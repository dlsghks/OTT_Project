import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import RetroMobileEventSwiper from './RetroMobileEventSwiper';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { getImagePath } from '../../utils/imagePath';

import 'swiper/css';
import '../../styles/components/retrov/RetroEventCarousel.scss';

export default function RetroEventCarousel({ banners = [] }) {
  const swiperRef = useRef(null);
  const isMobile = useMobileLayout();
  const canSlide = banners.length > 1;
  // loop + centeredSlides 는 슬라이드가 적으면(3개) 한쪽 옆 배너를 못 채워 끊겨 보임 → 6개 이상이 되도록 복제
  const slides = canSlide
    ? Array.from({ length: Math.ceil(6 / banners.length) }, () => banners).flat()
    : banners;

  if (!banners.length) return null;
  if (isMobile) return <RetroMobileEventSwiper banners={banners} />;

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
        {slides.map((banner, index) => (
          <SwiperSlide
            key={`${banner.id}-${index}`}
            className="rv-event__slide"
          >
            {/* 배너를 누르면 이벤트 페이지로 (드래그로 넘길 때는 Swiper 가 클릭을 막음) */}
            <Link to={banner.link ?? '/eventdetail'} className="rv-event__link" draggable={false}>
              <img
                src={getImagePath(banner.image)}
                alt={[banner.title, banner.description].filter(Boolean).join(' ')}
                draggable={false}
                loading="lazy"
              />
            </Link>
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