import { SliderArrow } from '../common/SliderArrow';
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

// 16:9 영상 카드 가로 슬라이드 (관련영상 · 시즌별 회차 공통)
// - 오른쪽은 화면 끝까지, 다음 카드가 있으면 그라데이션 + 화살표 (CategorySlider 와 같은 방식)
// - label: 화살표 버튼 이름 (예: "관련영상")
// - renderItem: 카드 한 개를 그리는 함수
export const VideoSlider = ({ label, items = [], getKey = (item) => item.id, renderItem }) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigation = (swiper) => {
    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  return (
    <div className="category-row__slider video-slider">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateNavigation(swiper);
        }}
        onSlideChange={updateNavigation}
        onResize={updateNavigation}
        onBreakpoint={updateNavigation}
        slidesPerView="auto"
        slidesPerGroup={1}
        speed={500}
        grabCursor={true}
        longSwipesRatio={0.1}
        watchOverflow={true}
        breakpoints={{
          1024: { slidesPerGroup: 2 },
          1440: { slidesPerGroup: 3 },
        }}
        className="category-row__swiper"
      >
        {items.map((item) => (
          <SwiperSlide key={getKey(item)} className="video-slider__slide">
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>

      {canPrev && (
        <SliderArrow direction="prev"
          aria-label={`${label} 이전`}
          onClick={() => swiperRef.current?.slidePrev()}
         />
      )}

      {canNext && (
        <SliderArrow direction="next"
          aria-label={`${label} 다음`}
          onClick={() => swiperRef.current?.slideNext()}
         />
      )}
    </div>
  );
};
