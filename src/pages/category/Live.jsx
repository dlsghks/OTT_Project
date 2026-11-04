
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { LiveHero } from '../../components/live/LiveHero';
import { LiveSection } from '../../components/live/LiveSection';

import {
  livePrograms,
  liveTop10,
  liveCategories,
  liveBanner,
} from '../../data/liveData';

import '../../styles/pages/Live.scss';

export const Live = () => {
  const [now, setNow] = useState(() => Date.now());

  // 방송 진행률 30초마다 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // 방송 진행률 계산
  const getProgress = (program) => {
    const start = new Date(program.start).getTime();
    const end = new Date(program.end).getTime();

    return end > start
      ? Math.max(
          0,
          Math.min(
            100,
            ((now - start) / (end - start)) * 100
          )
        )
      : 0;
  };

  return (
    <main className="live-page">
      {/* 페이지 제목 */}
      <div className="live-page__heading">
        <h1>라이브</h1>

        <Link to="/schedule">
          편성표 보기 ›
        </Link>
      </div>

      {/* 실시간 인기 TOP 10 히어로 */}
      <LiveHero
        programs={liveTop10}
        getProgress={getProgress}
      />

      {/* 라이브 배너 */}
      <Link
        to={liveBanner.link}
        className="live-banner"
        style={
          liveBanner.image
            ? {
                backgroundImage: `url("${liveBanner.image}")`,
              }
            : undefined
        }
      >
        <strong>{liveBanner.title}</strong>
        <span>{liveBanner.subtitle}</span>
      </Link>

      {/* 카테고리별 라이브 */}
      {liveCategories.map((category) => (
        <LiveSection
          key={category}
          title={category}
          items={livePrograms.filter(
            (program) => program.category === category
          )}
          getProgress={getProgress}
        />
      ))}
    </main>
  );
};
