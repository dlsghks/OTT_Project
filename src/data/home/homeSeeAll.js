// 메인 홈 섹션과 '더보기' 페이지가 동일한 콘텐츠 데이터/조회 로직을 사용합니다.
// 이 파일은 기존 Home.jsx의 카탈로그·API 캐시를 옮긴 것입니다.
import { categoryPages } from '../categoryData';
import { fetchTmdb, cleanList, toCard } from '../../services/tmdbDetail';

// 앞서 추가한 TMDB 영화·드라마 섹션
const MIN_SECTION_ITEMS = 15;
export const discoverySections = [
  {
    id: 'popular-movies',
    title: '오늘은 이 영화 어때요?',
    path: '/movie/popular',
    params: {
      region: 'KR',
    },
    basePath: '/moviedetail',
    moreLink: '/collection/popular-movies',
    fallbackCategory: 'movie',
  },
  {
    id: 'korean-dramas',
    title: '다음 화를 부르는 드라마',
    path: '/discover/tv',
    params: {
      with_genres: '18',
      without_genres: '16|10763|10764|10767',
      with_origin_country: 'KR',
      sort_by: 'popularity.desc',
    },
    basePath: '/dramadetail',
    moreLink: '/collection/korean-dramas',
    fallbackCategory: 'drama',
  },
  {
    id: 'thriller-movies',
    title: '끝까지 긴장을 놓을 수 없는 영화',
    path: '/discover/movie',
    params: {
      with_genres: '53',
      sort_by: 'popularity.desc',
      'vote_count.gte': '100',
    },
    basePath: '/moviedetail',
    moreLink: '/collection/thriller-movies',
    fallbackCategory: 'movie',
    fallbackGenres: ['thriller', 'crime', 'action'],
  },
  {
    id: 'global-dramas',
    title: '취향을 넓혀줄 해외 드라마',
    path: '/discover/tv',
    params: {
      with_genres: '18',
      without_genres: '16|10763|10764|10767',
      without_origin_country: 'KR',
      sort_by: 'popularity.desc',
      'vote_count.gte': '100',
    },
    basePath: '/globaldetail',
    moreLink: '/collection/global-dramas',
    fallbackCategory: 'global',
  },
];

// 이번에 추가하는 15개 섹션
// 카테고리 데이터의 장르를 기준으로 목록을 구성한다.
export const additionalSections = [
  // 예능 +2
  {
    id: 'entertainment-reality',
    category: 'entertainment',
    title: '남의 일상인데 자꾸 보게 돼',
    genres: ['reality', 'life', 'family'],
    moreLink: '/collection/entertainment-reality',
  },
  {
    id: 'entertainment-survival',
    category: 'entertainment',
    title: '승부가 시작되면 멈출 수 없지',
    genres: ['survival'],
    moreLink: '/collection/entertainment-survival',
  },

  // 드라마 +2
  {
    id: 'drama-romance',
    category: 'drama',
    title: '설렘이 필요한 오늘의 로맨스',
    genres: ['romance'],
    moreLink: '/collection/drama-romance',
  },
  {
    id: 'drama-investigation',
    category: 'drama',
    title: '사건 속으로 빠져드는 드라마',
    genres: ['action', 'thriller', 'law'],
    moreLink: '/collection/drama-investigation',
  },

  // 영화 +2
  {
    id: 'movie-comedy-romance',
    category: 'movie',
    title: '가볍게 웃고 설레는 영화 한 편',
    genres: ['comedy', 'romance'],
    moreLink: '/collection/movie-comedy-romance',
  },
  {
    id: 'movie-fantasy',
    category: 'movie',
    title: '현실을 벗어나는 두 시간',
    genres: ['sf', 'animation', 'family'],
    moreLink: '/collection/movie-fantasy',
  },

  // 시사교양 +3
  {
    id: 'documentary-truth',
    category: 'currentaffairs',
    title: '그 사건의 진실이 궁금하다면',
    genres: ['current', 'history'],
    moreLink: '/collection/documentary-truth',
  },
  {
    id: 'documentary-world',
    category: 'currentaffairs',
    title: '화면으로 떠나는 세상 여행',
    genres: ['travel', 'nature', 'food'],
    moreLink: '/collection/documentary-world',
  },
  {
    id: 'documentary-life',
    category: 'currentaffairs',
    title: '평범한 일상에서 발견한 특별함',
    genres: ['culture', 'documentary', 'health'],
    moreLink: '/collection/documentary-life',
  },

  // 애니 +3
  {
    id: 'animation-adventure',
    category: 'animation',
    title: '상상 너머로 떠나는 모험',
    genres: ['action', 'fantasy'],
    moreLink: '/collection/animation-adventure',
  },
  {
    id: 'animation-youth',
    category: 'animation',
    title: '뜨거운 청춘, 빛나는 우리',
    genres: ['sports', 'school', 'romance'],
    moreLink: '/collection/animation-youth',
  },
  {
    id: 'animation-family',
    category: 'animation',
    title: '온 가족이 함께 보는 애니 시간',
    genres: ['kids', 'korea', 'theater'],
    moreLink: '/collection/animation-family',
  },

  // 해외시리즈 +3
  {
    id: 'global-america',
    category: 'global',
    title: '한 번 시작하면 밤새 보는 미국 시리즈',
    genres: ['us'],
    moreLink: '/collection/global-america',
  },
  {
    id: 'global-asia',
    category: 'global',
    title: '가까운 나라에서 찾은 새로운 인생작',
    genres: ['china', 'japan', 'taiwan'],
    moreLink: '/collection/global-asia',
  },
  {
    id: 'global-mystery',
    category: 'global',
    title: '미스터리와 상상력 사이',
    genres: ['uk', 'crime', 'thriller', 'sf'],
    moreLink: '/collection/global-mystery',
  },
];

// 카테고리 데이터에서 해당 장르의 콘텐츠를 가져온다.
// 기존 포스터·배지·상세 링크를 그대로 사용한다.
// 주제에 맞는 콘텐츠 우선 배치
// 8개 미만이면 같은 카테고리의 다른 콘텐츠로 보충
export const getCategoryItems = (category, genres) => {
  const items = categoryPages[category]?.items ?? [];

  const matchedItems = genres?.length
    ? items.filter((item) => genres.includes(item.genre))
    : items;

  const seenIds = new Set();
  const seenTitles = new Set();

  const uniqueItems = (list) =>
    list.filter((item) => {
      const title = String(item.title ?? '')
        .normalize('NFKC')
        .replace(/\s+/g, '')
        .toLowerCase();

      if (
        seenIds.has(item.id) ||
        (title && seenTitles.has(title))
      ) {
        return false;
      }

      seenIds.add(item.id);

      if (title) {
        seenTitles.add(title);
      }

      return true;
    });

  const primaryItems = uniqueItems(matchedItems).slice(0, 20);

  if (primaryItems.length >= MIN_SECTION_ITEMS) {
    return primaryItems;
  }

  const extraItems = uniqueItems(items).slice(
    0,
    MIN_SECTION_ITEMS - primaryItems.length
  );

  return [...primaryItems, ...extraItems];
};

// API 조회 실패 시 사용할 기존 카테고리 콘텐츠
const getFallbackItems = (section) =>
  getCategoryItems(
    section.fallbackCategory,
    section.fallbackGenres
  );

// 홈 재진입 및 StrictMode에서 중복 요청을 줄인다.
const discoveryCache = new Map();
const DISCOVERY_CACHE_TIME = 5 * 60 * 1000;

export const loadDiscoveryItems = (section) => {
  const cached = discoveryCache.get(section.id);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const entry = {
    expiresAt: Infinity,
    promise: null,
  };

  entry.promise = Promise.resolve()
    .then(() =>
      fetchTmdb(section.path, {
        include_adult: 'false',
        page: '1',
        ...section.params,
      })
    )
    .then((data) => {
      const results = Array.isArray(data?.results)
        ? data.results
        : [];

      const items = cleanList(results)
        .slice(0, 20)
        .map((item) => ({
          ...toCard(item, section.basePath),
          kind:
            section.fallbackCategory === 'movie'
              ? 'movie'
              : 'tv',
          tmdbId: item.id,
        }));

      if (!items.length) {
        discoveryCache.delete(section.id);
        return getFallbackItems(section);
      }

      const filledItems = [...items];

      if (filledItems.length < MIN_SECTION_ITEMS) {
        const fallbackItems = getCategoryItems(
          section.fallbackCategory
        );

        const normalizeTitle = (title) =>
          String(title ?? '')
            .normalize('NFKC')
            .replace(/[\p{P}\p{Z}\s]/gu, '')
            .toLowerCase();

        const seenTitles = new Set(
          items.map((item) => normalizeTitle(item.title))
        );

        const seenTmdbIds = new Set(
          items
            .filter((item) => item.tmdbId)
            .map((item) => String(item.tmdbId))
        );

        for (const item of fallbackItems) {
          if (filledItems.length >= MIN_SECTION_ITEMS) break;

          const title = normalizeTitle(item.title);
          const tmdbId = item.tmdbId
            ? String(item.tmdbId)
            : null;

          if (
            seenTitles.has(title) ||
            (tmdbId && seenTmdbIds.has(tmdbId))
          ) {
            continue;
          }

          filledItems.push(item);
          seenTitles.add(title);

          if (tmdbId) {
            seenTmdbIds.add(tmdbId);
          }
        }
      }

      entry.expiresAt =
        Date.now() + DISCOVERY_CACHE_TIME;

      return filledItems;
    })
    .catch(() => {
      discoveryCache.delete(section.id);
      return getFallbackItems(section);
    });

  discoveryCache.set(section.id, entry);

  return entry.promise;
};


// 전체보기 화면에서는 TMDB 두 번째 페이지까지 가져와 슬라이더보다 더 많은
// 작품을 노출합니다. API가 없거나 실패하면 홈에서 쓰는 기존 목록만 사용합니다.
export const loadAllDiscoveryItems = async (section) => {
  const first = await loadDiscoveryItems(section);
  const response = await fetchTmdb(section.path, {
    include_adult: 'false',
    page: '2',
    ...section.params,
  });
  const extra = cleanList(Array.isArray(response?.results) ? response.results : [])
    .map((result) => ({
      ...toCard(result, section.basePath),
      kind: section.fallbackCategory === 'movie' ? 'movie' : 'tv',
      tmdbId: result.id,
    }));
  const seen = new Set();
  return [...first, ...extra].filter((item) => {
    const key = item.tmdbId
      ? `${item.kind}:${item.tmdbId}`
      : `title:${String(item.title || '').normalize('NFKC').toLowerCase().replace(/\s+/g, '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
