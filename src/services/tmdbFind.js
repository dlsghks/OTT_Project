import { fetchTmdb } from './tmdbDetail';

// 제목으로 TMDB 작품을 찾아 상세 페이지 경로를 돌려준다 (스페셜 페이지 콘텐츠 → 상세 페이지)
// - kind: 'movie' (영화만 검색) | 'multi' (영화 · 시리즈 함께 검색)
// - 시리즈는 TMDB 장르 · 제작 국가로 상세 페이지 종류를 고른다

// TMDB TV 장르 id
const ANIMATION = 16;
const DOCUMENTARY = 99;
const NEWS = 10763;
const REALITY = 10764;
const TALK = 10767;
const COMEDY = 35;
const DRAMA = 18;

// TMDB TV 결과 → 상세 페이지 경로
const getTvPath = (show) => {
  const genres = show.genre_ids ?? [];
  const countries = show.origin_country ?? [];

  if (genres.includes(ANIMATION)) return `/animationdetail/${show.id}`;
  if (genres.includes(DOCUMENTARY) || genres.includes(NEWS)) return `/currentaffairsdetail/${show.id}`;
  if (genres.includes(REALITY) || genres.includes(TALK)) return `/entertainmentdetail/${show.id}`;
  // 국내 코미디(드라마 장르 없음)는 예능 (예: 개그 콘서트)
  if (genres.includes(COMEDY) && !genres.includes(DRAMA)) return `/entertainmentdetail/${show.id}`;
  if (countries.length && !countries.includes('KR')) return `/globaldetail/${show.id}`;
  return `/dramadetail/${show.id}`;
};

const getPath = (result) =>
  result.media_type === 'tv' || result.name ? getTvPath(result) : `/moviedetail/${result.id}`;

// 검색어 정리: [극장판] · (2026) · (4K) · (자막) 등 제거, 연도는 따로 사용
const cleanTitle = (title = '') => {
  const year = title.match(/\((\d{4})\)/)?.[1];
  const query = title
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { query, year };
};

// 시즌 · 회차 표기를 뗀 검색어 (예: 1박2일 시즌4 → 1박2일, 짱구는 못말려25 → 짱구는 못말려)
const getFallbackQueries = (query) => {
  const words = query.split(' ');
  const list = [
    query.replace(/\s*(시즌|season)\s*\d+.*$/i, ''),
    query.replace(/\s*(\d+기|part\s*\d+|\d+)$/i, ''),
    query.split(/[:：-]/)[0],
    query.split('!!')[0] + (query.includes('!!') ? '!!' : ''), // 하이큐!! 세컨드 시즌 → 하이큐!!
    query.replace(/\s/g, ''), // 개그 콘서트 → 개그콘서트
    words.length >= 3 ? words.slice(0, -1).join(' ') : '', // 명탐정 코난 미공개X파일 → 명탐정 코난
  ].map((item) => item.trim());
  return [...new Set(list)].filter((item) => item && item !== query);
};

const normalize = (text = '') => text.replace(/[\s:·,.!?'"-]/g, '').toLowerCase();

// 같은 제목이면 정확히 일치하는 작품, 영화 · 시리즈 함께 검색할 때는 시리즈 우선
const pickResult = (results, query) => {
  const target = normalize(query);
  const isExact = (item) => normalize(item.title ?? item.name) === target
    || normalize(item.original_title ?? item.original_name) === target;
  const isTv = (item) => item.media_type === 'tv';

  const exact = results.find((item) => isExact(item) && isTv(item)) ?? results.find(isExact);
  const item = exact ?? results.find(isTv) ?? results[0] ?? null;
  return item ? { item, exact: Boolean(exact) } : null;
};

const search = async (query, kind, year) => {
  if (kind === 'movie') {
    const data = await fetchTmdb('/search/movie', year ? { query, year } : { query });
    return pickResult(data?.results ?? [], query);
  }

  const data = await fetchTmdb('/search/multi', { query });
  const results = (data?.results ?? []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
  return pickResult(results, query);
};

const cache = new Map();

export const findTmdbDetailPath = async (title, kind = 'multi') => {
  const key = `${kind}:${title}`;
  if (cache.has(key)) return cache.get(key);

  const { query, year } = cleanTitle(title);
  let result = query ? await search(query, kind, year) : null;

  // 정확히 일치하지 않으면 시즌 · 회차 표기를 뗀 검색어로 정확히 일치하는 작품을 다시 찾는다
  if (!result?.exact) {
    for (const fallback of getFallbackQueries(query)) {
      const next = await search(fallback, kind);
      if (next?.exact || (next && !result)) result = next;
      if (result?.exact) break;
    }
  }

  const path = result ? getPath(result.item) : null;
  cache.set(key, path);
  return path;
};
