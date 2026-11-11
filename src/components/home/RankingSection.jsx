import { SliderArrow } from '../common/SliderArrow';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SectionTitle } from '../common/SectionTitle';
import { ContentCard } from './ContentCard';

import 'swiper/css';

export const RankingSection = ({ items = [] }) => {
  const swiperRef = useRef(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // 이전/다음 버튼 표시 여부
  const updateNavigation = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  // 순위 숫자 영역을 제외한 실제 포스터 높이 측정


  return (
    <section className="home-section ranking-section">
      {/* 섹션 제목 */}
      <div className="home-section__head">
        <SectionTitle>오늘의 TOP 랭킹</SectionTitle>
        <Link to="/collection/home--ranking">
          더보기
        </Link>
      </div>

      {/* Swiper 슬라이드 영역 */}
      <div
        className="ranking-section__slider"
      >
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
          spaceBetween={8}
          speed={500}
          grabCursor
          simulateTouch
          longSwipesRatio={0.1}
          shortSwipes
          watchOverflow
          breakpoints={{
            601: {
              slidesPerGroup: 3,
              spaceBetween: 12,
            },
            1025: {
              slidesPerGroup: 4,
              spaceBetween: 18,
            },
            1920: {
              slidesPerGroup: 5,
              spaceBetween: 18,
            },
          }}
          className="ranking-section__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id ?? index}
              className="card-slide"
            >
              <ContentCard
                item={item}
                rank={index + 1}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 이전 버튼 */}
        {canPrev && (
          <SliderArrow direction="prev"
            aria-label="랭킹 이전"
            onClick={() => swiperRef.current?.slidePrev()}
           />
        )}

        {/* 다음 버튼 */}
        {canNext && (
          <SliderArrow direction="next"
            aria-label="랭킹 다음"
            onClick={() => swiperRef.current?.slideNext()}
           />
        )}
      </div>
    </section>
  );
};