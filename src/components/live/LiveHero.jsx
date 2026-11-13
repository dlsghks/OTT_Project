import styles from '../../styles/pages/live/LivePage.module.scss';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import {
  getYoutubeLive,
  getCachedYoutubeLive,
} from '../../services/youtube';
import { useLiveArtwork } from '../../hooks/useLiveArtwork';
import { getLiveLogoStyle } from '../../data/live/liveChannelAssets';
import { SliderArrow } from '../common/SliderArrow';
import {
  liveDesignRanks,
  liveDesignDot,
} from '../../data/live/liveDesignData';

import 'swiper/css';

export const LiveHero = ({
  programs = [],
  getProgress,
}) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const [youtubeVideos, setYoutubeVideos] = useState(() => {
    const videos = {};

    programs.forEach((program) => {
      const cached = getCachedYoutubeLive(
        program.youtubeChannelId
      );

      if (cached?.thumbnail) {
        videos[program.id] = cached;
      }
    });

    return videos;
  });

  const sortedPrograms = useMemo(
    () =>
      [...programs]
        .sort(
          (a, b) =>
            (a.viewerRank ?? a.rank ?? Infinity) -
            (b.viewerRank ?? b.rank ?? Infinity)
        )
        .slice(0, 10),
    [programs]
  );

  useEffect(() => {
    let cancelled = false;

    const loadAllLives = async () => {
      const targets = sortedPrograms.filter(
        (program) => program.youtubeChannelId && !program.preferLocalArtwork
      );

      const results = await Promise.all(
        targets.map(async (program) => ({
          id: program.id,
          data: await getYoutubeLive(
            program.youtubeChannelId
          ),
        }))
      );

      if (cancelled) return;

      setYoutubeVideos((previous) => {
        const next = { ...previous };

        results.forEach(({ id, data }) => {
          if (data?.thumbnail) {
            next[id] = data;
          }
        });

        return next;
      });

      window.dispatchEvent(
        new Event('ott-live-thumbnails-updated')
      );
    };

    loadAllLives();

    return () => {
      cancelled = true;
    };
  }, [sortedPrograms]);

  const updateSwiper = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  if (sortedPrograms.length === 0) return null;

  return (
    <section
      className={styles.hero}
      aria-label="인기 라이브 방송 TOP 10"
    >
      <Swiper
        className={styles.heroSwiper}
        slidesPerView="auto"
        spaceBetween={18}
        breakpoints={{ 0: { spaceBetween: 8 }, 1025: { spaceBetween: 18 } }}
        speed={600}
        watchOverflow
        preventClicks
        preventClicksPropagation
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateSwiper(swiper);
        }}
        onSlideChange={updateSwiper}
        onResize={updateSwiper}
        onLock={updateSwiper}
        onUnlock={updateSwiper}
      >
        {sortedPrograms.map((program, index) => (
          <SwiperSlide
            className={styles.heroSlide}
            key={program.id}
          >
            <LiveHeroSlide
              program={program}
              liveVideo={youtubeVideos[program.id]}
              rank={program.viewerRank ?? index + 1}
              getProgress={getProgress}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {canPrev && (
        <SliderArrow
          thumbnailSelector={`.${styles.heroCard}`}
          direction="prev"
          aria-label="이전 라이브"
          onClick={() => swiperRef.current?.slidePrev()}
        />
      )}

      {canNext && (
        <SliderArrow
          thumbnailSelector={`.${styles.heroCard}`}
          direction="next"
          aria-label="다음 라이브"
          onClick={() => swiperRef.current?.slideNext()}
        />
      )}
    </section>
  );
};

const LiveHeroSlide = ({
  program,
  liveVideo,
  rank,
  getProgress,
}) => {
  const {
    image,
    logo,
    title,
    failImage,
  } = useLiveArtwork(program, liveVideo);

  const logoStyle = getLiveLogoStyle(logo);

  return (
    <Link
      className={styles.heroCard}
      to={`/livechannel?channel=${encodeURIComponent(
        program.channelId
      )}`}
      aria-label={`${program.channel} ${title || ''} 시청하기`}
      draggable={false}
    >
      {image ? (
        <img
          key={image}
          className={styles.heroImage}
          draggable={false}
          src={image}
          alt=""
          onError={failImage}
        />
      ) : (
        <div className={styles.heroBrandPlaceholder}>
          {logo ? (
            <img
              className={styles.heroFallbackLogo}
              src={logo}
              alt=""
            />
          ) : (
            <span>{program.channel}</span>
          )}
        </div>
      )}

      <span
        className={styles.heroTint}
        aria-hidden="true"
      />

      <span className={styles.badge}>
        <img src={liveDesignDot} alt="" />
        라이브
      </span>

      <div className={styles.heroInfo}>
        {logo ? (
          <div
            className={styles.heroLogoFrame}
            data-trimmed={logoStyle ? 'true' : undefined}
            style={logoStyle}
          >
            <img
              className={styles.heroChannelLogo}
              src={logo}
              alt={program.channel}
            />
          </div>
        ) : (
          <strong className={styles.heroChannel}>
            {program.channel}
          </strong>
        )}

        {title && <h2>{title}</h2>}

        {image && program.rating != null && (
          <p>시청률 {program.rating}%</p>
        )}

        <span className={styles.heroWatchButton}>
          시청하기
        </span>
      </div>

      {liveDesignRanks[rank - 1] ? (
        <img
          className={styles.heroRank}
          src={liveDesignRanks[rank - 1]}
          alt={`${rank}위`}
        />
      ) : (
        <strong
          className={`${styles.heroRank} ${styles.number}`}
        >
          {rank}
        </strong>
      )}

      {image && (
        <div className={styles.progress}>
          <span
            style={{
              width: `${getProgress?.(program) ?? 0}%`,
            }}
          />
        </div>
      )}
    </Link>
  );
};