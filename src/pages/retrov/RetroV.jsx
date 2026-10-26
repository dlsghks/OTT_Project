// src/pages/RetroV.jsx
import { Link } from "react-router-dom";

import ProgramNavigation from "../../components/retrov/ProgramNavigation";
import RetroMainHero from "../../components/retrov/RetroMainHero";
import RetroMainRow from "../../components/retrov/RetroMainRow";
import RetroEventCarousel from "../../components/retrov/RetroEventCarousel";
import { programs, eventBanners } from "../../data/retrov";
import {
  userName,
  heroSlides,
  rankings,
  watching,
  recommendations,
  shorts,
} from "../../data/retrovMain";
import "../../styles/Retrov.scss";

export const RetroV = () => {
  return (
    <div className="retrov-main">
      {/* 메인 배너 */}
      <RetroMainHero slides={heroSlides} />

      {/* 프로그램 선택 (동그란 필터) */}
      <ProgramNavigation programs={programs} />

      {/* TOP 랭킹 */}
      <RetroMainRow
        id="ranking"
        variant="ranking"
        title="레트로브 TOP 랭킹"
        items={rankings}
        renderItem={(item, index) => (
          <Link to={`/retrov/${item.id}`} className="rv-rank-card" aria-label={`${index + 1}위 ${item.title}`}>
            <span className="rv-rank-card__poster">
              <img src={item.thumbnail} alt="" loading="lazy" draggable="false" />
              <img className="rv-rank-card__logo" src={item.logo} alt="" draggable="false" />
            </span>
            <span className="rv-rank-card__number" aria-hidden="true">
              {index + 1}
            </span>
          </Link>
        )}
      />

      {/* 시청 중 콘텐츠 */}
      <RetroMainRow
        id="watching"
        variant="watching"
        icon="👑"
        title={`${userName}님이 시청 중인 콘텐츠`}
        items={watching}
        renderItem={(item) => (
          <Link to={`/retrov/${item.programId}`} className="rv-thumb-card">
            <span className="rv-thumb-card__image">
              <img src={item.image} alt={item.title} loading="lazy" draggable="false" />
            </span>
            <span
              className="rv-thumb-card__progress"
              role="progressbar"
              aria-valuenow={item.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.title} 시청 진행률`}
            >
              <span style={{ width: `${item.progress}%` }} />
            </span>
          </Link>
        )}
      />

      {/* 추천 콘텐츠 */}
      <RetroMainRow
        id="recommend"
        variant="recommend"
        title="레트로브 추천 콘텐츠"
        items={recommendations}
        renderItem={(item) => (
          <Link to={`/retrov/${item.programId}`} className="rv-thumb-card">
            <span className="rv-thumb-card__image">
              <img src={item.image} alt="" loading="lazy" draggable="false" />
            </span>
            <strong className="rv-thumb-card__title">{item.title}</strong>
            {item.description && <span className="rv-thumb-card__desc">{item.description}</span>}
          </Link>
        )}
      />

      {/* 쇼츠 */}
      <RetroMainRow
        id="shorts"
        variant="shorts"
        title="레트로브 쇼츠 모아보기"
        items={shorts}
        renderItem={(item) => {
          const program = programs.find((p) => p.id === item.programId);
          return (
            <Link to={`/retrov/${item.programId}`} className="rv-short-card">
              <strong className="rv-short-card__caption">
                <span>{item.caption[0]}</span>
                <em>{item.caption[1]}</em>
              </strong>
              <span className="rv-short-card__image">
                <img src={item.image} alt="" loading="lazy" draggable="false" />
                <img className="rv-short-card__badge" src="/images/W-icon.svg" alt="" />
              </span>
              <span className="rv-short-card__footer">
                {program?.title} | 오직 <b>wavve</b>에서
              </span>
            </Link>
          );
        }}
      />

      {/* 이벤트 배너 */}
      <div className="retrov-main__event">
        <RetroEventCarousel banners={eventBanners} />
      </div>
    </div>
  );
};
