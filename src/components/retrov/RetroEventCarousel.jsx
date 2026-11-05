import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { getImagePath } from '../../utils/imagePath';

import 'swiper/css';
import '../../styles/components/retrov/RetroEventCarousel.scss';

export default function RetroEventCarousel({ banners = [] }) {
  const swiperRef = useRef(null);
  const canSlide = banners.length > 1;

  if (!banners.length) return null;

  return (
    <section className="rv-event" aria-label="추천 이벤트">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView="auto"
        slidesPerGroup={1}
        centeredSlides
        spaceBetween={24}
        loop={canSlide}
        speed={500}
        grabCursor={canSlide}
        simulateTouch
        allowTouchMove={canSlide}
        longSwipesRatio={0.1}
        shortSwipes
        watchOverflow
        className="rv-event__swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            className="rv-event__slide"
          >
            <img
              src={getImagePath(banner.image)}
              alt={[banner.title, banner.description].filter(Boolean).join(' ')}
              draggable={false}
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {canSlide && (
        <>
          <button
            type="button"
            className="rv-event__nav rv-event__nav--prev"
            aria-label="이전 이벤트"
            onClick={() => swiperRef.current?.slidePrev()}
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

          <button
            type="button"
            className="rv-event__nav rv-event__nav--next"
            aria-label="다음 이벤트"
            onClick={() => swiperRef.current?.slideNext()}
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
        </>
      )}
    </section>
  );
}