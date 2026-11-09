import { ContinueWatchingSection } from '../../components/home/ContinueWatchingSection';
import { homeCollectionLink, homeCollectionTitle } from '../../data/editorCollections';
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

import { HomeGenreNav } from '../../components/home/HomeGenreNav';
import {
  discoverySections,
  additionalSections,
  getCategoryItems,
  loadDiscoveryItems,
} from '../../data/home/homeSeeAll';

import '../../styles/pages/home/Home.scss';
import '../../styles/components/home/HomeResponsive.scss';
import '../../styles/components/home/ContinueWatchingSection.scss';

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
      return <WeeklyContentSection key="weekly" appResponsive />;
    }

    if (type === 'hope') {
      return <HopeSection key="hope" appResponsive />;
    }

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
            appResponsive
            key={`existing-${id}`}
            {...section}
            moreLink={homeCollectionLink(id)}
          />
        );
      }

      // 여행·음악·토크·정형돈 TV 등의 최신 목록 사용
      const items =
        homeContentBySection[id] ??
        section.items ??
        [];

      if (!items.length) return null;

      const title = homeCollectionTitle(section);

      return (
        <ContentSection
          appResponsive
          key={`existing-${id}`}
          {...section}
          title={title}
          moreLink={homeCollectionLink(id)}
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
          appResponsive
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
          appResponsive
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

      {/* 1. 메인 히어로 */}
      <HomeGenreNav />
      <HomeHero items={heroItems} appResponsive />

      <div className="wavve-home__inner">
        {/* 이벤트 */}
        <EventBanner items={eventBanners.slice(0, 1)} />

        {/* 카테고리 */}
        <CategoryMenu items={categories} />

        {/* 선택한 프로필의 시청 중 콘텐츠 */}
        <ContinueWatchingSection />

        {/* TOP 랭킹 */}
        <RankingSection items={rankingItems} />

        {/* 기존 섹션 + 영화·드라마 + 추가 15개 섹션 */}
        {homeSectionOrder.map(renderHomeSection)}
      </div>
    </div>
  );
};