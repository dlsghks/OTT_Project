
import React from 'react';

import { HomeHero } from '../../components/home/HomeHero';
import { CategoryMenu } from '../../components/home/CategoryMenu';
import { ContentSection } from '../../components/home/ContentSection';
import { RankingSection } from '../../components/home/RankingSection';
import { EventBanner } from '../../components/home/EventBanner';

import {
  heroItems,
  categories,
  homeSections,
  rankingItems,
  eventBanners
} from '../../data/homeData';

import '../../styles/components/Home.scss';

export const Home = () => {
  // 섹션 ID로 데이터 조회
  const getSection = (id) =>
    homeSections.find((section) => section.id === id);

  // 기존 ContentSection 재사용
  const renderSection = (id) => {
    const section = getSection(id);

    if (!section) return null;

    return (
      <ContentSection
        key={section.id}
        {...section}
      />
    );
  };

  return (
    <div className="wavve-home">

      {/* 1. 메인 히어로 */}
      <HomeHero items={heroItems} />

      <div className="wavve-home__inner">

        {/* 2. 이벤트 */}
        <EventBanner items={eventBanners.slice(0, 1)} />

        {/* 3. 카테고리 버튼 */}
        <CategoryMenu items={categories} />

        {/* 4. TOP 20 */}
        <RankingSection items={rankingItems} />

        {/* 5. 요일별 콘텐츠 */}
        {renderSection('weekly')}

        {/* 6. 해외로 떠나는 여행 예능 */}
        {renderSection('travel')}

        {/* 7. 영화 HOPE 특집 */}
        <section className="home-hope">
          <h2 className="home-hope__title">HOPE</h2>
          <p className="home-hope__description">
            &lt;호프&gt;의 감독과 배우들, 그들의 필모그래피
          </p>
        </section>

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

      </div>
    </div>
  );
};
