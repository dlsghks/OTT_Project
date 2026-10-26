
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { LiveCard } from './LiveCard';
import '../../styles/components/live/LiveSection.scss';

export const LiveSection = ({ title, items = [], getProgress }) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // 메인 페이지와 동일한 화살표 상태 관리
  const updateNavigation = (swiper) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  return (
    <section className="live-section">
      <div className="live-section__header">
        <h2>{title}</h2>
      </div>

      <div className="live-section__slider">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation(swiper);
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          slidesPerView={2}
          slidesPerGroup={2}
          spaceBetween={12}
          speed={500}
          grabCursor={true}
          simulateTouch={true}
          longSwipesRatio={0.1}
          shortSwipes={true}
          watchOverflow={true}
          breakpoints={{
            640: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              spaceBetween: 14,
            },
            1024: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 16,
            },
            1440: {
              slidesPerView: 5,
              slidesPerGroup: 5,
              spaceBetween: 20,
            },
          }}
          className="live-section__swiper"
        >
          {items.map((program, index) => (
            <SwiperSlide key={program.id ?? index}>
              <LiveCard
                program={program}
                progress={getProgress(program)}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {canPrev && (
          <button
            type="button"
            className="live-section__arrow live-section__arrow--prev"
            aria-label={`${title} 이전 목록`}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <span>‹</span>
          </button>
        )}

        {canNext && (
          <button
            type="button"
            className="live-section__arrow live-section__arrow--next"
            aria-label={`${title} 다음 목록`}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <span>›</span>
          </button>
        )}
      </div>
    </section>
  );
};
