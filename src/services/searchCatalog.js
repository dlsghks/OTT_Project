import { categoryPages } from '../data/categoryData';
import { homeSections } from '../data/home/homeData';
import { fetchTmdb, TMDB_IMG } from './tmdbDetail';

const CATEGORY_ROUTES = {
  entertainment: '/entertainment', drama: '/drama', movie: '/movie',
  currentaffairs: '/currentaffairs', animation: '/animation', global: '/global',
};
const DETAIL_ROUTES = {
  entertainment: '/entertainmentdetail', drama: '/dramadetail', movie: '/moviedetail',
  currentaffairs: '/currentaffairsdetail', animation: '/animationdetail', global: '/globaldetail',
};
const CATEGORY_ALIASES = {
  entertainment: ['예능', '버라이어티'], drama: ['드라마'], movie: ['영화'],
  currentaffairs: ['시사교양', '교양', '다큐'], animation: ['애니', '애니메이션'],
  global: ['해외시리즈', '해외', '미드'],
};

export const normalizeSearchKeyword = (value) =>
  String(value ?? '').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, '').trim();

const includesKeyword = (source, keyword) =>
  Boolean(keyword) && normalizeSearchKeyword(source).includes(keyword);

export const getLocalSearchMatches = (query) => {
  const keyword = normalizeSearchKeyword(query);
  if (!keyword) return { programs: [], categories: [], upcoming: [] };

  const categories = [];
  const programs = [];
  const seenPrograms = new Set();

  Object.entries(categoryPages).forEach(([key, page]) => {
    const path = CATEGORY_ROUTES[key];
    if (!path) return;
    const labels = [page.name, ...(CATEGORY_ALIASES[key] ?? [])];
    if (labels.some(label => includesKeyword(label, keyword))) {
      categories.push({ name: page.name, label: `${page.name} 전체`, path });
    }

    const filters = page.filters ?? [];
    (page.items ?? []).forEach((item) => {
      const matchingGenre = filters.find(filter => filter.id === item.genre);
      const terms = [item.title, item.tmdbTitle, item.genre, matchingGenre?.label,
        item.description, item.badge, ...(Array.isArray(item.tags) ? item.tags : []),
        ...labels];
      if (!terms.some(term => includesKeyword(term, keyword))) return;
      const link = item.link || `${DETAIL_ROUTES[key]}/${item.id}`;
      const unique = `${key}:${item.id}`;
      if (seenPrograms.has(unique)) return;
      seenPrograms.add(unique);
      programs.push({ ...item, kind: key === 'movie' ? 'movie' : 'tv', link });
    });
  });

  const upcoming = (homeSections.find(section => section.id === 'coming-soon')?.items ?? [])
    .filter(item => [item.title, item.description].some(term => includesKeyword(term, keyword)))
    .map(item => ({ ...item, image: `${import.meta.env.BASE_URL}${String(item.image || '').replace(/^\//, '')}` }));

  return { programs, categories, upcoming };
};

const getTvDetailPath = (show) => {
  const genres = show.genre_ids ?? [];
  const countries = show.origin_country ?? [];
  if (genres.includes(16)) return '/animationdetail';
  if (genres.includes(99) || genres.includes(10763)) return '/currentaffairsdetail';
  if (genres.includes(10764) || genres.includes(10767) ||
    (genres.includes(35) && !genres.includes(18))) return '/entertainmentdetail';
  if (countries.length && !countries.includes('KR')) return '/globaldetail';
  return '/dramadetail';
};

const searchCache = new Map();
export const getTmdbSearchMatches = (query) => {
  const keyword = String(query ?? '').trim();
  if (!keyword) return Promise.resolve({ items: [], failed: false });
  const cacheKey = normalizeSearchKeyword(keyword);
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const promise = fetchTmdb('/search/multi', { query: keyword, include_adult: 'false' })
    .then(data => {
      if (!Array.isArray(data?.results)) return { items: [], failed: true };
      const seen = new Set();
      const items = data.results.filter(result => {
        if (!['movie', 'tv'].includes(result.media_type) || !result.id) return false;
        const key = `${result.media_type}:${result.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map(result => ({
        id: `tmdb-${result.media_type}-${result.id}`,
        tmdbId: result.id,
        title: result.title ?? result.name,
        kind: result.media_type,
        poster: result.poster_path ? `${TMDB_IMG}w500${result.poster_path}` : '',
        link: `${result.media_type === 'movie' ? '/moviedetail' : getTvDetailPath(result)}/${result.id}`,
      }));
      return { items, failed: false };
    }).catch(() => ({ items: [], failed: true }));
  searchCache.set(cacheKey, promise);
  // API 오류는 다음 검색에서 재시도할 수 있도록 캐시에서 제거
  promise.then(result => { if (result.failed) searchCache.delete(cacheKey); });
  return promise;
};
