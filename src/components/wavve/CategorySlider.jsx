import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SectionTitle } from '../common/SectionTitle';
import { ContentCard } from '../home/ContentCard';

import 'swiper/css';

export const CategorySlider = ({
  title,
  items = [],
  moreLink,
  headerExtra,
  ranked = false,
}) => {
  const swiperRef = useRef(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigation = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    setCanPrev(
      !swiper.isBeginning && !swiper.isLocked
    );

    setCanNext(
      !swiper.isEnd && !swiper.isLocked
    );
  };

  return (
    <section className="category-row">
      <div className="category-row__header">
        <div className="category-row__title">
          <SectionTitle>{title}</SectionTitle>

          {moreLink && (
            <Link to={moreLink}>
              더보기
            </Link>
          )}
        </div>

        {headerExtra}
      </div>

      <div className="category-row__slider">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation(swiper);
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          onBreakpoint={updateNavigation}
          onUpdate={updateNavigation}
          onLock={updateNavigation}
          onUnlock={updateNavigation}
          onReachBeginning={updateNavigation}
          onReachEnd={updateNavigation}
          slidesPerView="auto"
          slidesPerGroup={2}
          speed={500}
          grabCursor
          simulateTouch
          longSwipesRatio={0.1}
          shortSwipes
          watchOverflow
          breakpoints={{
            0: { slidesPerGroup: 1, spaceBetween: 8 },
            601: { slidesPerGroup: 3, spaceBetween: 12 },
            1025: { slidesPerGroup: 4, spaceBetween: 0 },
            1440: { slidesPerGroup: 5, spaceBetween: 0 },
          }}
          className="category-row__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id ?? index}
              className="card-slide"
            >
              <ContentCard
                item={item}
                rank={ranked ? index + 1 : undefined}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {canPrev && (
          <button
            type="button"
            className="category-row__arrow category-row__arrow--prev"
            aria-label={`${title} 이전 콘텐츠`}
            onClick={() =>
              swiperRef.current?.slidePrev()
            }
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}

        {canNext && (
          <button
            type="button"
            className="category-row__arrow category-row__arrow--next"
            aria-label={`${title} 다음 콘텐츠`}
            onClick={() =>
              swiperRef.current?.slideNext()
            }
          >
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </section>
  );
};