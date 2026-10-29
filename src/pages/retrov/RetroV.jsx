// src/pages/retrov/RetroV.jsx

import { Link } from "react-router-dom";

import ProgramNavigation from "../../components/retrov/ProgramNavigation";
import RetroMainHero from "../../components/retrov/RetroMainHero";
import RetroMainRow from "../../components/retrov/RetroMainRow";
import RetroEventCarousel from "../../components/retrov/RetroEventCarousel";
import YoutubePlayerModal from "../../components/retrov/YoutubePlayerModal";

import { programs, eventBanners } from "../../data/retrov";
import {
  userName,
  heroSlides,
  rankings,
  watching,
  recommendations,
  shorts,
} from "../../data/retrovMain";

import { getEpisodeSource } from "../../data/retrovTmdb";
import { useRetrovPlayer } from "../../hooks/useRetrovPlayer";
import { getImagePath } from "../../utils/imagePath";

import "../../styles/Retrov.scss";

// 카드: TMDB 로 재생할 수 있는 회차(item.play)면 누르면 바로 재생, 아니면 상세페이지로 이동
function PlayableCard({ item, onPlay, className, children }) {
  const source = item.play && getEpisodeSource(item.programId, item.play.seasonId, item.play.episode);

  if (source) {
    return (
      <button
        type="button"
        className={`${className} ${className}--button`}
        onClick={() => onPlay({ id: item.id, title: item.title, description: item.description, source })}
        aria-label={`${item.title} 재생`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={`/retrov/${item.programId}`} className={className}>
      {children}
    </Link>
  );
}

export const RetroV = () => {
  const { playingVideo, play, close } = useRetrovPlayer(); // 영상 재생 (유튜브 팝업)

  return (
    <div className="retrov-main">

      {/* 메인 배너 */}
      <div className="retrov-main__hero">
        <RetroMainHero slides={heroSlides} />
      </div>

      {/* 프로그램 선택 (동그란 필터) */}
      <ProgramNavigation programs={programs} />

      {/* TOP 랭킹 */}
      <RetroMainRow
        id="ranking"
        variant="ranking"
        title="레트로브 TOP 랭킹"
        items={rankings}
        renderItem={(item, index) => (
          <Link
            to={`/retrov/${item.id}`}
            className="rv-rank-card"
            aria-label={`${index + 1}위 ${item.title}`}
          >
            <span className="rv-rank-card__poster">
              <img
                src={getImagePath(item.thumbnail)}
                alt=""
                loading="lazy"
                draggable="false"
              />
              <img
                className="rv-rank-card__logo"
                src={getImagePath(item.logo)}
                alt=""
                draggable="false"
              />
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
          <PlayableCard item={item} onPlay={play} className="rv-thumb-card">
            <span className="rv-thumb-card__image">
              <img
                src={getImagePath(item.image)}
                alt={item.title}
                loading="lazy"
                draggable="false"
              />
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
          </PlayableCard>
        )}
      />

      {/* 추천 콘텐츠 */}
      <RetroMainRow
        id="recommend"
        variant="recommend"
        title="레트로브 추천 콘텐츠"
        items={recommendations}
        renderItem={(item) => (
          <PlayableCard item={item} onPlay={play} className="rv-thumb-card">
            <span className="rv-thumb-card__image">
              <img
                src={getImagePath(item.image)}
                alt=""
                loading="lazy"
                draggable="false"
              />
            </span>

            <strong className="rv-thumb-card__title">
              {item.title}
            </strong>

            {item.description && (
              <span className="rv-thumb-card__desc">
                {item.description}
              </span>
            )}
          </PlayableCard>
        )}
      />

      {/* 쇼츠 */}
      <RetroMainRow
        id="shorts"
        variant="shorts"
        title="레트로브 쇼츠 모아보기"
        items={shorts}
        renderItem={(item) => {
          const program = programs.find(
            (p) => p.id === item.programId
          );

          return (
            <Link
              to={`/retrov/${item.programId}`}
              className="rv-short-card"
            >
              <strong className="rv-short-card__caption">
                <span>{item.caption[0]}</span>
                <em>{item.caption[1]}</em>
              </strong>

              <span className="rv-short-card__image">
                <img
                  src={getImagePath(item.image)}
                  alt=""
                  loading="lazy"
                  draggable="false"
                />
                <img
                  className="rv-short-card__badge"
                  src={getImagePath("/images/W-icon.svg")}
                  alt=""
                />
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

      {/* 유튜브 재생 팝업 */}
      {playingVideo && <YoutubePlayerModal video={playingVideo} onClose={close} />}
    </div>
  );
};