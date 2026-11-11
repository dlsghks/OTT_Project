import { SliderArrow } from '../common/SliderArrow';
import { SectionTitle } from '../common/SectionTitle';
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";

import "swiper/css";

// 레트로브 메인 가로 목록 (터치 · 마우스 드래그 · 트랙패드 가로 스크롤 + 마우스 올리면 나오는 화살표)
// 카드 너비는 Retrov.scss 의 .rv-main-row--{variant} 에서 지정
export default function RetroMainRow({ id, title, icon, items, variant, renderItem }) {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigation = (swiper) => {
    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  return (
    <section className={`rv-main-row rv-main-row--${variant}`} aria-labelledby={`rv-main-row-${id}`}>
      <SectionTitle id={`rv-main-row-${id}`} className="rv-main-row__title">
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </SectionTitle>

      <div className="rv-main-row__slider">
        <Swiper
          modules={[Mousewheel]}
          // 트랙패드 · 가로 휠로도 넘김 (세로 휠은 페이지 스크롤 그대로)
          mousewheel={{ forceToAxis: true }}
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={20}
          breakpoints={{ 0: { spaceBetween: 8 }, 601: { spaceBetween: 12 }, 1025: { spaceBetween: 20 } }}
          speed={500}
          grabCursor
          watchOverflow
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation(swiper);
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          className="rv-main-row__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id} className="rv-main-row__item">
              {renderItem(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>

        {canPrev && (
          <SliderArrow direction="prev"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label={`${title} 이전`}
           />
        )}
        {canNext && (
          <SliderArrow direction="next"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label={`${title} 다음`}
           />
        )}
      </div>
    </section>
  );
}
