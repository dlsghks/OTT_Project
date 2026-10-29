import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { ContentCard } from '../home/ContentCard';

// 카테고리 페이지 가로 슬라이드
// - 카드 크기는 1920 기준 318*464 비율 (Category.scss)
// - 오른쪽은 화면 끝까지 이어지고, 다음 콘텐츠가 있으면 그라데이션 표시
// - ranked: TOP 20 순위 숫자 표시
export const CategorySlider = ({ title, items = [], moreLink, headerExtra, ranked = false }) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigation = (swiper) => {
    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  return (
    <section className={`category-row ${ranked ? 'category-row--rank' : ''}`}>
      <div className="category-row__header">
        <div className="category-row__title">
          <h2>{title}</h2>
          {moreLink && <Link to={moreLink}>더보기</Link>}
        </div>

        {/* 제목 아래 추가 영역 (요일 필터 등) */}
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
          slidesPerView="auto"
          slidesPerGroup={2}
          speed={500}
          grabCursor={true}
          longSwipesRatio={0.1}
          watchOverflow={true}
          breakpoints={{
            640: { slidesPerGroup: 3 },
            1024: { slidesPerGroup: 4 },
            1440: { slidesPerGroup: 5 },
          }}
          className="category-row__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id ?? index} className="category-row__slide">
              <ContentCard item={item} />
              {ranked && <span className="category-row__rank">{index + 1}</span>}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 오른쪽 그라데이션 (투명 → 검정) */}
        {canNext && <span className="category-row__fade" aria-hidden="true" />}

        {canPrev && (
          <button
            type="button"
            className="category-row__arrow category-row__arrow--prev"
            aria-label={`${title} 이전`}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            ‹
          </button>
        )}

        {canNext && (
          <button
            type="button"
            className="category-row__arrow category-row__arrow--next"
            aria-label={`${title} 다음`}
            onClick={() => swiperRef.current?.slideNext()}
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
};
