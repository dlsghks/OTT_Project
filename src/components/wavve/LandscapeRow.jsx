import { SliderArrow } from '../common/SliderArrow';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { getImagePath } from '../../utils/imagePath';

// 16:9 썸네일 가로 슬라이드 (클립 · 라이브)
// - ranked: 카드 왼쪽에 순위 숫자 표시 (landscapeRank)
export const LandscapeRow = ({ title, items = [], ranked = false }) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // 불러오지 못한 썸네일은 제목 카드로 대체
  const [brokenImages, setBrokenImages] = useState([]);

  const updateNavigation = (swiper) => {
    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  if (!items.length) return null;

  return (
    <section className={`category-row landscape-row ${ranked ? 'landscape-row--ranked' : ''}`}>
      <div className="category-row__header">
        <div className="category-row__title">
          <h2>{title}</h2>
        </div>
      </div>

      <div className="category-row__slider">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation(swiper);
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          slidesPerView="auto"
          slidesPerGroup={2}
          speed={500}
          grabCursor
          longSwipesRatio={0.1}
          watchOverflow
          breakpoints={{ 1024: { slidesPerGroup: 3 } }}
          className="category-row__swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id ?? index} className="landscape-row__slide">
              <Link to={item.link ?? '#'} className="landscape-card" draggable={false}>
                {ranked && <strong className="landscape-card__rank">{index + 1}</strong>}

                <div className="landscape-card__body">
                  <div className="landscape-card__thumb">
                    {item.thumbnail && !brokenImages.includes(item.id) ? (
                      <img
                        src={getImagePath(item.thumbnail)}
                        alt={item.title}
                        loading="lazy"
                        draggable={false}
                        onError={() => setBrokenImages((list) => [...list, item.id])}
                      />
                    ) : (
                      <span className="landscape-card__placeholder">{item.title}</span>
                    )}
                    {item.badge && <span className="landscape-card__badge">{item.badge}</span>}
                    {item.duration && <span className="landscape-card__time">{item.duration}</span>}
                  </div>

                  <p className="landscape-card__title">{item.title}</p>
                  {item.meta && <span className="landscape-card__meta">{item.meta}</span>}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {canPrev && (
          <SliderArrow direction="prev"
            aria-label={`${title} 이전`}
            onClick={() => swiperRef.current?.slidePrev()}
           />
        )}

        {canNext && (
          <SliderArrow direction="next"
            aria-label={`${title} 다음`}
            onClick={() => swiperRef.current?.slideNext()}
           />
        )}
      </div>
    </section>
  );
};
