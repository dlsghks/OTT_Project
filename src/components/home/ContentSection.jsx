import { SliderArrow } from '../common/SliderArrow';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SectionTitle } from '../common/SectionTitle';
import { ContentCard } from './ContentCard';

import 'swiper/css';
import '../../styles/components/home/ContentSection.scss';

// 카드 종류별 설정
const CARD_TYPES = {
  default: {
    width: 318,
    group: 5,
  },
  wide: {
    width: 379,
    group: 4,
  },
  'coming-soon': {
    width: 407,
    group: 4,
  },
};

export const ContentSection = ({
  title,
  items = [],
  moreLink,
  more,
  cardType = 'default',
  showHeader = true,
  renderCard,
  appResponsive = false,
}) => {
  const swiperRef = useRef(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const config = CARD_TYPES[cardType] || CARD_TYPES.default;

  // 이전/다음 버튼 표시 여부
  const updateNavigation = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  // 화살표와 그라데이션 영역을 실제 썸네일 높이에 맞춤


  return (
    <section
      className={`content-section content-section--${cardType}`}
      style={{
        '--content-card-width': `${config.width}px`,
      }}
    >
      {/* 섹션 제목 */}
      {showHeader && (
        <div className="content-section__header">
          <div className="content-section__title">
            <SectionTitle>{title}</SectionTitle>

            {(moreLink || more) && (
              <Link className="section-more" to={moreLink || more}>
                더보기
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Swiper 슬라이드 영역 */}
      <div
        className="content-section__slider"
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
          slidesOffsetAfter={0}
          centeredSlides={false}
          snapToSlideEdge={false}
          slidesPerGroup={2}
          spaceBetween={18}
          speed={500}
          grabCursor
          simulateTouch
          longSwipesRatio={0.1}
          shortSwipes
          watchOverflow
          breakpoints={
            appResponsive
              ? {
                  0: {
                    slidesPerGroup: 1,
                    spaceBetween: 8,
                  },
                  601: {
                    slidesPerGroup: 3,
                    spaceBetween: 12,
                  },
                  1025: {
                    slidesPerGroup: 4,
                    spaceBetween: 18,
                  },
                  1920: {
                    slidesPerGroup: config.group,
                    spaceBetween: 18,
                  },
                }
              : {
                  640: {
                    slidesPerGroup: 3,
                  },
                  1024: {
                    slidesPerGroup: 4,
                  },
                  1440: {
                    slidesPerGroup: config.group,
                  },
                }
          }
          className="content-section__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id ?? index}
              className="card-slide"
            >
              {renderCard ? (
                renderCard(item, index)
              ) : (
                <ContentCard item={item} />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 이전 버튼 */}
        {canPrev && (
          <SliderArrow direction="prev"
            aria-label="이전 콘텐츠"
            onClick={() => swiperRef.current?.slidePrev()}
           />
        )}

        {/* 다음 버튼 */}
        {canNext && (
          <SliderArrow direction="next"
            aria-label="다음 콘텐츠"
            onClick={() => swiperRef.current?.slideNext()}
           />
        )}
      </div>
    </section>
  );
};