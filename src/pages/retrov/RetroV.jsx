// src/pages/retrov/RetroV.jsx

import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { BrowsePageHeader } from "../../components/common/BrowsePageHeader";
import RetroMobileEvents from "../../components/retrov/RetroMobileEvents";
import ProgramNavigation from "../../components/retrov/ProgramNavigation";
import RetroMainHero from "../../components/retrov/RetroMainHero";
import RetroMainRow from "../../components/retrov/RetroMainRow";
import RetroEventCarousel from "../../components/retrov/RetroEventCarousel";
import YoutubePlayerModal from "../../components/common/YoutubePlayerModal";

import { programs, eventBanners } from "../../data/retrov/retrov";
import {
  userName,
  heroSlides,
  rankings,
  watching,
  recommendations,
  shorts,
} from "../../data/retrov/retrovMain";

import { getEpisodeSource } from "../../data/retrov/retrovTmdb";
import { useRetrovPlayer } from "../../hooks/useRetrovPlayer";
import {
  useRetrovTmdbStore,
  tmdbImage,
} from "../../store/useRetrovTmdbStore";
import { getImagePath } from "../../utils/imagePath";

import "../../styles/pages/retrov/Retrov.scss";
import "../../styles/responsive/RetrovResponsive.scss";

function youtubeThumb(videoId) {
  return videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;
}

// 추천·시청 중 콘텐츠 썸네일
function useRecommendationImages(items) {
  const { episodes, onFetchEpisodes } = useRetrovTmdbStore();

  useEffect(() => {
    const targets = new Set(
      items
        .filter((item) => !item.image && item.tmdb)
        .map((item) => `${item.tmdb.id}_${item.tmdb.season}`)
    );

    targets.forEach((key) => {
      const [id, season] = key.split("_");
      onFetchEpisodes(Number(id), Number(season));
    });
  }, [items, onFetchEpisodes]);

  return useMemo(
    () =>
      items.map((item) => {
        if (item.image) return item;

        const still = item.tmdb
          ? episodes[
            `${item.tmdb.id}_${item.tmdb.season}`
          ]?.find(
            (ep) => ep.episode_number === item.tmdb.episode
          )?.still_path
          : null;

        return {
          ...item,
          image:
            tmdbImage(still, "w500") ??
            youtubeThumb(item.videoId) ??
            item.fallbackImage,
        };
      }),
    [items, episodes]
  );
}

// 시청 중·추천 카드: 재생 가능한 영상이 있으면 팝업 재생
function PlayableCard({ item, onPlay, className, children }) {
  const source =
    item.source ??
    (item.play &&
      getEpisodeSource(
        item.programId,
        item.play.seasonId,
        item.play.episode
      ));

  if (item.videoId || source) {
    return (
      <button
        type="button"
        className={`${className} ${className}--button`}
        onClick={() =>
          onPlay({
            id: item.id,
            title: item.title,
            description: item.description,
            videoId: item.videoId,
            source,
          })
        }
        aria-label={`${item.title} 재생`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      to={`/retrov/${item.programId}`}
      className={className}
    >
      {children}
    </Link>
  );
}

export const RetroV = () => {
  const { playingVideo, play, close } = useRetrovPlayer();
  const recommendCards = useRecommendationImages(recommendations);
  const watchingCards = useRecommendationImages(watching);

  return (
    <div className="retrov-main">
      <BrowsePageHeader title="레트로브" retro />

      {/* 메인 배너 */}
      <div className="retrov-main__hero">
        <RetroMainHero slides={heroSlides} />
      </div>

      {/* 프로그램 선택 */}
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
                className={
                  item.poster
                    ? "rv-rank-card__image--poster"
                    : undefined
                }
                src={getImagePath(item.poster ?? item.thumbnail)}
                alt=""
                loading="lazy"
                draggable="false"
              />

              {!item.poster && (
                <img
                  className="rv-rank-card__logo"
                  src={getImagePath(item.logo)}
                  alt=""
                  draggable="false"
                />
              )}
            </span>

            <img
              className="rv-rank-card__number"
              src={getImagePath(item.rankImage)}
              alt=""
              draggable="false"
            />
          </Link>
        )}
      />

      {/* 시청 중 콘텐츠 */}
      <RetroMainRow
        id="watching"
        variant="watching"
        icon="👑"
        title={`${userName}님이 시청 중인 콘텐츠`}
        items={watchingCards}
        renderItem={(item) => (
          <PlayableCard
            item={item}
            onPlay={play}
            className="rv-thumb-card"
          >
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
        items={recommendCards}
        renderItem={(item) => (
          <PlayableCard
            item={item}
            onPlay={play}
            className="rv-thumb-card"
          >
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

      {/* 쇼츠: 클릭한 영상의 숏츠 페이지로 이동 */}
      {/* 레트로브 전용 숏츠 */}
      <RetroMainRow
        id="shorts"
        variant="shorts"
        title="레트로브 쇼츠 모아보기"
        items={shorts}
        renderItem={(item) => {
          const program = programs.find(
            (program) => program.id === item.programId
          );

          return (
            <Link
              to={`/retrov/shorts?short=${encodeURIComponent(item.id)}`}
              className="rv-short-card"
              aria-label={`${item.title} 숏츠 보기`}
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
        <RetroMobileEvents banners={eventBanners} />
      </div>

      {/* 시청 중·추천 콘텐츠 재생 팝업 */}
      {playingVideo && (
        <YoutubePlayerModal
          video={playingVideo}
          onClose={close}
        />
      )}
    </div>
  );
};