
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  getYoutubeLive,
  getCachedYoutubeLive,
} from '../../services/youtube';
import { getImagePath } from '../../utils/imagePath';


import 'swiper/css';


export const LiveHero = ({
  programs = [],
  getProgress,
}) => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();
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



  // 현재 선택된 방송의 유튜브 썸네일 조회
  useEffect(() => {
    let cancelled = false;

    const loadAllLives = async () => {
      // 유튜브 채널 ID가 있는 방송만 조회
      const targets = sortedPrograms.filter(
        (program) => program.youtubeChannelId
      );

      // 모든 방송을 동시에 조회
      const results = await Promise.all(
        targets.map(async (program) => {
          const result = await getYoutubeLive(
            program.youtubeChannelId
          );

          return {
            id: program.id,
            data: result,
          };
        })
      );

      if (cancelled) return;

      // 모든 썸네일을 한 번에 저장
      const videos = {};

      results.forEach(({ id, data }) => {
        videos[id] = data;
      });

      setYoutubeVideos((previous) => {
        const next = { ...previous };

        results.forEach(({ id, data }) => {
          if (data?.thumbnail) {
            next[id] = data;
          }
        });

        return next;
      });
      // 다른 영역에서도 갱신된 썸네일 캐시를 읽도록 알림
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
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  const getWatchPath = (program) =>
    `/livechannel?channel=${encodeURIComponent(
      program.channelId
    )}`;

  if (sortedPrograms.length === 0) return null;

  return (
    <section
      className="live-hero"
      aria-label="인기 라이브 방송 TOP 10"
    >
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateSwiper(swiper);
        }}
        onSlideChange={updateSwiper}
        onResize={updateSwiper}
        slidesPerView="auto"
        slidesPerGroup={1}
        centeredSlides={false}
        slidesOffsetBefore={110}
        spaceBetween={8}
        loop={false}
        speed={600}
        grabCursor={true}
        allowTouchMove={true}
        watchOverflow={true}
        className="live-hero__swiper"
      >
        {sortedPrograms.map((program, index) => {
          const youtubeVideo = youtubeVideos[program.id];

          const thumbnail = getImagePath(
            youtubeVideo?.thumbnail || program.image || ''
          );

          return (
            <SwiperSlide key={program.id}>
              <article
                className="live-hero__slide"
                role="link"
                tabIndex={0}
                aria-label={`${program.channel} ${program.title} 시청하기`}
                onClick={() =>
                  navigate(getWatchPath(program))
                }
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;

                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    navigate(getWatchPath(program));
                  }
                }}
                style={
                  thumbnail
                    ? {
                      backgroundImage: `url("${thumbnail}")`,
                    }
                    : undefined
                }
              >
                {/* 영상은 재생하지 않고 썸네일만 표시 */}

                <div className="live-hero__info">
                  <span className="live-hero__badge">
                    ● 라이브
                  </span>

                  <strong className="live-hero__rank">
                    {program.viewerRank ?? index + 1}
                  </strong>

                  <h2>{program.channel}</h2>

                  <p>{program.title}</p>

                  {program.rating != null && (
                    <small>
                      시청률 {program.rating}%
                    </small>
                  )}

                  <div className="live-hero__progress">
                    <span
                      style={{
                        width: `${typeof getProgress === 'function'
                          ? getProgress(program)
                          : 0
                          }%`,
                      }}
                    />
                  </div>

                  <Link
                    to={getWatchPath(program)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    시청하기
                  </Link>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* 이전 버튼 */}
      {canPrev && (
        <button
          type="button"
          className="live-hero__arrow live-hero__arrow--prev"
          aria-label="이전 라이브 방송"
          onClick={() =>
            swiperRef.current?.slidePrev()
          }
        >
          <svg
            width="22"
            height="36"
            viewBox="0 0 22 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 2 2 18l18 16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}

      {/* 다음 버튼 */}
      {canNext && (
        <button
          type="button"
          className="live-hero__arrow live-hero__arrow--next"
          aria-label="다음 라이브 방송"
          onClick={() =>
            swiperRef.current?.slideNext()
          }
        >
          <svg
            width="22"
            height="36"
            viewBox="0 0 22 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2 20 18 2 34"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}
    </section>
  );
};
