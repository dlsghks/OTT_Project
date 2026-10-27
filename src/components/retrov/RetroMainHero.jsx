import { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import { getImagePath } from "../../utils/imagePath";

import "swiper/css";

// 레트로브 메인 배너: 가운데 배너 + 양옆 배너 미리보기, 5초마다 자동 넘김
export default function RetroMainHero({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const total = slides.length;

  if (!total) return null;

  return (
    <section
      className="rv-main-hero hero-full-width"
      aria-roledescription="carousel"
      aria-label="레트로브 추천 프로그램"
    >
      <Swiper
        modules={[Autoplay]}
        slidesPerView="auto"
        centeredSlides
        spaceBetween={24}
        loop={total > 2}
        speed={700}
        grabCursor
        autoplay={
          total > 1
            ? {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
            : false
        }
        onSwiper={setSwiper}
        onSlideChange={(instance) => setCurrent(instance.realIndex)}
        className="rv-main-hero__swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.id}
            className="rv-main-hero__slide"
          >
            <Link
              to={`/retrov/${slide.id}`}
              className="rv-main-hero__card"
              style={{
                backgroundImage: `url("${getImagePath(slide.thumbnail)}")`,
              }}
              aria-label={`${slide.title} 보러가기`}
              tabIndex={index === current ? 0 : -1}
            >
              <div className="rv-main-hero__content">
                <p className="rv-main-hero__badge">
                  <img
                    src={getImagePath("/images/W-icon.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                  original
                </p>

                <h2 className="rv-main-hero__logo">
                  <img
                    src={getImagePath(slide.logo)}
                    alt={slide.title}
                  />
                </h2>

                <p className="rv-main-hero__meta">
                  <span
                    className="rv-main-hero__rating"
                    aria-label={`${slide.rating}세 이상 관람가`}
                  >
                    {slide.rating}
                  </span>
                  <span>· {slide.genre}</span>
                </p>

                <p className="rv-main-hero__desc">
                  {slide.description.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {total > 1 && (
        <>
          <button
            type="button"
            className="rv-main-hero__nav rv-main-hero__nav--prev"
            onClick={() => swiper?.slidePrev()}
            aria-label="이전 배너"
          >
            ‹
          </button>

          <button
            type="button"
            className="rv-main-hero__nav rv-main-hero__nav--next"
            onClick={() => swiper?.slideNext()}
            aria-label="다음 배너"
          >
            ›
          </button>

          <ol
            className="rv-main-hero__dots"
            aria-label="배너 위치"
          >
            {slides.map((slide, index) => (
              <li key={slide.id}>
                <button
                  type="button"
                  className={index === current ? "is-active" : ""}
                  onClick={() => swiper?.slideToLoop(index)}
                  aria-label={`${slide.title} 배너 보기`}
                  aria-current={index === current}
                />
              </li>
            ))}
          </ol>

          <p className="rv-main-hero__count" aria-live="polite">
            <strong>{current + 1}</strong> | {total}
          </p>
        </>
      )}
    </section>
  );
}