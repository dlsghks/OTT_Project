import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '../../styles/components/Category-menu.scss';

const getCategoryImage = (image = '') => {
  if (!image) return '';

  const fileName = image.split('/').pop();

  return `${import.meta.env.BASE_URL}images/category-buttons/${fileName}`;
};

export const CategoryMenu = ({ items = [] }) => {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigation = (swiper) => {
    if (!swiper) return;
    setCanPrev(!swiper.isBeginning && !swiper.isLocked);
    setCanNext(!swiper.isEnd && !swiper.isLocked);
  };

  return (
    <nav className="home-categories" aria-label="콘텐츠 카테고리">
      <div className="home-categories__slider">
        <Swiper
          className="home-categories__swiper"
          onSwiper={(swiper) => { swiperRef.current = swiper; updateNavigation(swiper); }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          onBreakpoint={updateNavigation}
          slidesPerView="auto"
          slidesPerGroup={5}
          spaceBetween={10}
          speed={500}
          grabCursor
          simulateTouch
          longSwipesRatio={0.1}
          shortSwipes
          watchOverflow

        >
          {items.map((item, index) => (
            <SwiperSlide key={`${item.label}-${index}`}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className="home-categories__card"
                  aria-label={item.label}
                  draggable={false}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    draggable={false}
                  />
                </NavLink>
              ) : (
                <div className="home-categories__card home-categories__card--static" title={item.label}>
                  <img
                    src={item.image}
                    alt={item.label}
                    draggable={false}
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {canPrev && (
          <button type="button" className="home-categories__arrow home-categories__arrow--prev" aria-label="카테고리 이전" onClick={() => swiperRef.current?.slidePrev()}>
            <span>‹</span>
          </button>
        )}
        {canNext && (
          <button type="button" className="home-categories__arrow home-categories__arrow--next" aria-label="카테고리 다음" onClick={() => swiperRef.current?.slideNext()}>
            <span>›</span>
          </button>
        )}
      </div>
    </nav>
  );
};
