import { useEffect, useState } from 'react';

import { HomeHero } from '../../components/home/HomeHero';
import { CategoryMenu } from '../../components/home/CategoryMenu';
import { ContentSection } from '../../components/home/ContentSection';
import { RankingSection } from '../../components/home/RankingSection';
import { EventBanner } from '../../components/home/EventBanner';
import { HopeSection } from '../../components/home/HopeSection';
import { WeeklyContentSection } from '../../components/home/WeeklyContentSection';
import { ComingSoonSection } from '../../components/home/ComingSoonSection';
import { homeContentBySection } from '../../data/home/requestedHomeSections';

import {
  heroItems,
  categories,
  homeSections,
  rankingItems,
  eventBanners,
} from '../../data/home/homeData';

<<<<<<< HEAD
import '../../styles/components/Home.scss';
import '../../styles/components/HomeResponsive.scss';
import { HomeGenreNav } from '../../components/home/HomeGenreNav';
=======
import { categoryPages } from '../../data/categoryData';
>>>>>>> origin/develop

import {
  fetchTmdb,
  cleanList,
  toCard,
} from '../../services/tmdbDetail';

import '../../styles/pages/home/Home.scss';

// 앞서 추가한 TMDB 영화·드라마 섹션
const MIN_SECTION_ITEMS = 15;
const discoverySections = [
  {
    id: 'popular-movies',
    title: '오늘은 이 영화 어때요?',
    path: '/movie/popular',
    params: {
      region: 'KR',
    },
    basePath: '/moviedetail',
    moreLink: '/movie',
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
    moreLink: '/drama',
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
    moreLink: '/movie',
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
    moreLink: '/global',
    fallbackCategory: 'global',
  },
];

<<<<<<< HEAD
  if (id === 'coming-soon') {
    return (
      <ComingSoonSection
        key={section.id}
        {...section}
        appResponsive
      />
    );
  }

  return (
    <ContentSection
      key={section.id}
      {...section}
        appResponsive
    />
=======
// 이번에 추가하는 15개 섹션
// 카테고리 데이터의 장르를 기준으로 목록을 구성한다.
const additionalSections = [
  // 예능 +2
  {
    id: 'entertainment-reality',
    category: 'entertainment',
    title: '남의 일상인데 자꾸 보게 돼',
    genres: ['reality', 'life', 'family'],
    moreLink: '/entertainment',
  },
  {
    id: 'entertainment-survival',
    category: 'entertainment',
    title: '승부가 시작되면 멈출 수 없지',
    genres: ['survival'],
    moreLink: '/entertainment',
  },

  // 드라마 +2
  {
    id: 'drama-romance',
    category: 'drama',
    title: '설렘이 필요한 오늘의 로맨스',
    genres: ['romance'],
    moreLink: '/drama',
  },
  {
    id: 'drama-investigation',
    category: 'drama',
    title: '사건 속으로 빠져드는 드라마',
    genres: ['action', 'thriller', 'law'],
    moreLink: '/drama',
  },

  // 영화 +2
  {
    id: 'movie-comedy-romance',
    category: 'movie',
    title: '가볍게 웃고 설레는 영화 한 편',
    genres: ['comedy', 'romance'],
    moreLink: '/movie',
  },
  {
    id: 'movie-fantasy',
    category: 'movie',
    title: '현실을 벗어나는 두 시간',
    genres: ['sf', 'animation', 'family'],
    moreLink: '/movie',
  },

  // 시사교양 +3
  {
    id: 'documentary-truth',
    category: 'currentaffairs',
    title: '그 사건의 진실이 궁금하다면',
    genres: ['current', 'history'],
    moreLink: '/currentaffairs',
  },
  {
    id: 'documentary-world',
    category: 'currentaffairs',
    title: '화면으로 떠나는 세상 여행',
    genres: ['travel', 'nature', 'food'],
    moreLink: '/currentaffairs',
  },
  {
    id: 'documentary-life',
    category: 'currentaffairs',
    title: '평범한 일상에서 발견한 특별함',
    genres: ['culture', 'documentary', 'health'],
    moreLink: '/currentaffairs',
  },

  // 애니 +3
  {
    id: 'animation-adventure',
    category: 'animation',
    title: '상상 너머로 떠나는 모험',
    genres: ['action', 'fantasy'],
    moreLink: '/animation',
  },
  {
    id: 'animation-youth',
    category: 'animation',
    title: '뜨거운 청춘, 빛나는 우리',
    genres: ['sports', 'school', 'romance'],
    moreLink: '/animation',
  },
  {
    id: 'animation-family',
    category: 'animation',
    title: '온 가족이 함께 보는 애니 시간',
    genres: ['kids', 'korea', 'theater'],
    moreLink: '/animation',
  },

  // 해외시리즈 +3
  {
    id: 'global-america',
    category: 'global',
    title: '한 번 시작하면 밤새 보는 미국 시리즈',
    genres: ['us'],
    moreLink: '/global',
  },
  {
    id: 'global-asia',
    category: 'global',
    title: '가까운 나라에서 찾은 새로운 인생작',
    genres: ['china', 'japan', 'taiwan'],
    moreLink: '/global',
  },
  {
    id: 'global-mystery',
    category: 'global',
    title: '미스터리와 상상력 사이',
    genres: ['uk', 'crime', 'thriller', 'sf'],
    moreLink: '/global',
  },
];

// 카테고리 데이터에서 해당 장르의 콘텐츠를 가져온다.
// 기존 포스터·배지·상세 링크를 그대로 사용한다.
// 주제에 맞는 콘텐츠 우선 배치
// 8개 미만이면 같은 카테고리의 다른 콘텐츠로 보충
const getCategoryItems = (category, genres) => {
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
>>>>>>> origin/develop
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

const loadDiscoveryItems = (section) => {
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

// 화면에 보여줄 순서
// 기존 섹션 사이에 새 카테고리를 섞어서 배치한다.
const homeSectionOrder = [
  { type: 'discovery', id: 'popular-movies' },
  { type: 'weekly' },
  { type: 'discovery', id: 'korean-dramas' },
  { type: 'existing', id: 'travel' },

  { type: 'additional', id: 'documentary-world' },
  { type: 'hope' },
  { type: 'additional', id: 'animation-adventure' },

  { type: 'existing', id: 'music-entertainment' },
  { type: 'additional', id: 'drama-romance' },
  { type: 'discovery', id: 'thriller-movies' },
  { type: 'additional', id: 'global-america' },

  { type: 'existing', id: 'jung-hyung-don' },
  { type: 'additional', id: 'entertainment-reality' },
  { type: 'additional', id: 'movie-comedy-romance' },
  { type: 'additional', id: 'documentary-truth' },

  { type: 'existing', id: 'variety' },
  { type: 'existing', id: 'coming-soon' },
  { type: 'additional', id: 'animation-youth' },
  { type: 'discovery', id: 'global-dramas' },

  { type: 'additional', id: 'drama-investigation' },
  { type: 'additional', id: 'entertainment-survival' },
  { type: 'additional', id: 'global-asia' },
  { type: 'additional', id: 'movie-fantasy' },

  { type: 'existing', id: 'talk' },
  { type: 'additional', id: 'documentary-life' },
  { type: 'additional', id: 'animation-family' },
  { type: 'additional', id: 'global-mystery' },

  { type: 'existing', id: 'all-entertainment' },
];

export const Home = () => {
  const [discoveryItems, setDiscoveryItems] = useState({});

  useEffect(() => {
    let cancelled = false;

    // 조회가 끝난 목록부터 표시한다.
    discoverySections.forEach((section) => {
      loadDiscoveryItems(section).then((items) => {
        if (cancelled) return;

        setDiscoveryItems((previous) => ({
          ...previous,
          [section.id]: items,
        }));
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const renderHomeSection = ({ type, id }) => {
    if (type === 'weekly') {
      return <WeeklyContentSection key="weekly" />;
    }

    if (type === 'hope') {
      return <HopeSection key="hope" />;
    }

    // 기존 홈 섹션
    // 기존 홈 섹션
    if (type === 'existing') {
      const section = homeSections.find(
        (item) => item.id === id
      );

      if (!section) return null;

      // Coming Soon의 알림·로그인·하트 기능 유지
      if (id === 'coming-soon') {
        return (
          <ComingSoonSection
            key={`existing-${id}`}
            {...section}
          />
        );
      }

      // 여행·음악·토크·정형돈 TV 등의 최신 목록 사용
      const items =
        homeContentBySection[id] ??
        section.items ??
        [];

      if (!items.length) return null;

      const title =
        id === 'travel'
          ? '일상을 벗어나는 여행 예능'
          : id === 'music-entertainment'
            ? '듣고 웃고 즐기는 음악 예능'
            : section.title;

      return (
        <ContentSection
          key={`existing-${id}`}
          {...section}
          title={title}
          items={items}
          cardType={
            id === 'jung-hyung-don'
              ? 'wide'
              : section.cardType
          }
        />
      );
    }

    // TMDB 영화·드라마 섹션
    if (type === 'discovery') {
      const section = discoverySections.find(
        (item) => item.id === id
      );

      const items = discoveryItems[id];

      if (!section || !items?.length) return null;

      return (
        <ContentSection
          key={`discovery-${id}`}
          title={section.title}
          items={items}
          moreLink={section.moreLink}
        />
      );
    }

    // 이번에 추가한 카테고리별 15개 섹션
    if (type === 'additional') {
      const section = additionalSections.find(
        (item) => item.id === id
      );

      if (!section) return null;

      const items = getCategoryItems(
        section.category,
        section.genres
      );

      if (!items.length) return null;

      return (
        <ContentSection
          key={`additional-${id}`}
          title={section.title}
          items={items}
          moreLink={section.moreLink}
        />
      );
    }

    return null;
  };

  return (
    <div className="wavve-home">
<<<<<<< HEAD

      {/* 1. 메인 히어로 */}
      <HomeGenreNav />
      <HomeHero items={heroItems} appResponsive />
=======
      {/* 메인 히어로 */}
      <HomeHero items={heroItems} />
>>>>>>> origin/develop

      <div className="wavve-home__inner">
        {/* 이벤트 */}
        <EventBanner items={eventBanners.slice(0, 1)} />

        {/* 카테고리 */}
        <CategoryMenu items={categories} />

        {/* TOP 랭킹 */}
        <RankingSection items={rankingItems} />

<<<<<<< HEAD
        {/* 5. 요일별 콘텐츠 */}
        <WeeklyContentSection appResponsive />

        {/* 6. 해외로 떠나는 여행 예능 */}
        {renderSection('travel')}

        {/* 7. 영화 HOPE 특집 */}
        <HopeSection appResponsive />

        {/* 8. 걱정은 잠시 잊게 만드는 음악 예능 */}
        {renderSection('music-entertainment')}

        {/* 9. 정형돈의 제목없음 TV */}
        {renderSection('jung-hyung-don')}

        {/* 10. #버라이어티 */}
        {renderSection('variety')}

        {/* 11. 두근두근 Coming Soon */}
        {renderSection('coming-soon')}

        {/* 12. #토크 */}
        {renderSection('talk')}

        {/* 13. #뮤직 */}
        {renderSection('music')}

        {/* 14. 예능 전체보기 */}
        {renderSection('all-entertainment')}

=======
        {/* 기존 섹션 + 영화·드라마 + 추가 15개 섹션 */}
        {homeSectionOrder.map(renderHomeSection)}
>>>>>>> origin/develop
      </div>
    </div>
  );
};