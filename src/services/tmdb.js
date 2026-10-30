import { getImagePath } from '../utils/imagePath';
import { getContentPosterItem } from '../data/contentCatalog';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const cache = new Map();
const requestCache = new Map();
const TRANSIENT_TTL = 5000;
const NEGATIVE_TTL = 300000;

export const logTmdbDiagnostic = (reason, httpStatus) => {
  if (import.meta.env.DEV) {
    // 인증 URL, 제목, 예외 객체 및 API 키는 기록하지 않는다.
    console.warn('[TMDB]', reason, typeof httpStatus === 'number' ? httpStatus : '');
  }
};

const failure = (status, retryable = false, httpStatus) => ({ status, retryable, httpStatus, poster: null });

// pending Promise도 공유한다. 일시적 실패는 5초, 확정된 빈 결과는 5분 뒤 재조회한다.
const cached = (map, key, loader) => {
  const entry = map.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.promise;
  const next = { expiresAt: Infinity };
  next.promise = Promise.resolve().then(loader).then((result) => {
    next.expiresAt = result.status === 'success' && result.poster ? Infinity
      : Date.now() + (result.retryable ? TRANSIENT_TTL : NEGATIVE_TTL);
    return result;
  }).catch(() => {
    next.expiresAt = Date.now() + TRANSIENT_TTL;
    return failure('network_error', true);
  });
  map.set(key, next);
  return next.promise;
};

const requestTmdb = (path, query) => cached(requestCache, JSON.stringify([path, query || '']), async () => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const url = new URL(API_URL + path);
      url.searchParams.set('api_key', API_KEY);
      url.searchParams.set('language', 'ko-KR');
      if (query) url.searchParams.set('query', query);
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) {
        const transient = response.status === 429 || response.status >= 500;
        // 429는 즉시 재시도하지 않고 짧은 캐시 후 다음 조회에서 재시도한다.
        if (response.status >= 500 && attempt === 0) continue;
        const result = failure(response.status === 404 ? 'not_found' : 'http_error', transient, response.status);
        logTmdbDiagnostic(result.status, response.status);
        return result;
      }
      try {
        return { status: 'success', data: await response.json() };
      } catch {
        logTmdbDiagnostic('invalid_response');
        return failure('invalid_response', true);
      }
    } catch {
      if (attempt === 0) continue;
      logTmdbDiagnostic('network_error');
      return failure('network_error', true);
    }
  }
});

const normalizeTitle = (title) => String(title || '').normalize('NFKC')
  .toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');

const seasonTitle = (title, season) => {
  const explicit = title.replace(/\s*(?:시즌\s*\d+|season\s*\d+)\s*$/iu, '').trim();
  if (explicit !== title.trim()) return explicit;
  // 작품명 자체의 숫자는 보존한다. 별도 시즌 정보가 일치하는 경우에만 분리한다.
  const match = title.match(/^(.*?)\s+(\d{1,2})$/u);
  return match && Number.isInteger(season) && Number(match[2]) === season
    ? match[1].trim() : title.trim();
};

const findMatch = (results, query, mediaType, year) => {
  const expectedYear = String(year || '').match(/^\d{4}/)?.[0];
  const candidates = results.filter((result) => {
    if (result.media_type && result.media_type !== mediaType) return false;
    const date = mediaType === 'movie' ? result.release_date : result.first_air_date;
    return !expectedYear || date?.slice(0, 4) === expectedYear;
  });
  const names = (result) => mediaType === 'movie'
    ? [result.title, result.original_title] : [result.name, result.original_name];
  const exact = candidates.filter((result) => names(result).some(
    (name) => name && name.trim().toLowerCase() === query.trim().toLowerCase()
  ));
  if (exact.length) return exact.length === 1 ? { match: exact[0] } : { ambiguous: true };
  const normalized = normalizeTitle(query);
  const matches = normalized ? candidates.filter((result) => names(result).some(
    (name) => name && normalizeTitle(name) === normalized
  )) : [];
  return matches.length === 1 ? { match: matches[0] } : { ambiguous: matches.length > 1 };
};

export const getTmdbPosterResult = async (item, { skipLocal = false } = {}) => {
  item = getContentPosterItem(item);
  const local = item.poster || item.image;
  if (local && !skipLocal) return { status: 'success', poster: getImagePath(local) };
  if (item.isPlaceholder) return failure('placeholder');
  if (!API_KEY) {
    logTmdbDiagnostic('missing_api_key');
    return failure('missing_api_key');
  }
  const mediaType = item.kind === 'movie' ? 'movie' : 'tv';
  const year = item.tmdbYear || item.year;
  const key = JSON.stringify([mediaType, item.tmdbId, item.tmdbTitle, item.title, year, item.tmdbSeason]);
  return cached(cache, key, async () => {
    const outcomes = [];
    if (item.tmdbId) {
      const response = await requestTmdb('/' + mediaType + '/' + item.tmdbId);
      if (response.status === 'success') {
        if (response.data?.poster_path) return { status: 'success', poster: IMAGE_URL + response.data.poster_path };
        outcomes.push(failure('no_poster'));
        logTmdbDiagnostic('no_poster');
      } else {
        if (response.retryable || response.httpStatus === 401 || response.httpStatus === 403) return response;
        outcomes.push(response);
      }
    }
    const titles = [item.tmdbTitle, item.title].filter((title) => typeof title === 'string' && title.trim());
    const queries = [...new Set([...titles, ...(mediaType === 'tv'
      ? titles.map((title) => seasonTitle(title, item.tmdbSeason)) : [])].map((title) => title.trim()).filter(Boolean))];
    for (const query of queries) {
      const response = await requestTmdb('/search/' + mediaType, query);
      if (response.status !== 'success') {
        if (response.retryable || response.httpStatus === 401 || response.httpStatus === 403) return response;
        outcomes.push(response);
        continue;
      }
      const results = response.data?.results;
      if (!Array.isArray(results)) {
        logTmdbDiagnostic('invalid_response');
        return failure('invalid_response', true);
      }
      const { match, ambiguous } = findMatch(results, query, mediaType, year);
      if (match?.poster_path) return { status: 'success', poster: IMAGE_URL + match.poster_path };
      const reason = !results.length ? 'search_empty' : ambiguous ? 'ambiguous' : !match ? 'no_match' : 'no_poster';
      logTmdbDiagnostic(reason);
      outcomes.push(failure(reason));
    }
    const status = outcomes.find((r) => r.status === 'no_poster')?.status
      || outcomes.find((r) => r.status === 'ambiguous')?.status
      || outcomes[0]?.status || 'search_empty';
    return { ...failure(status), reasons: outcomes.map((r) => r.status) };
  });
};

// 기존 사용처는 계속 URL 또는 null을 받는다.
export const getTmdbPoster = async (item, options) => (await getTmdbPosterResult(item, options)).poster;
