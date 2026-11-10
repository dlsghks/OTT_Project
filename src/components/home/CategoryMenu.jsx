import { CategoryLogo } from './CategoryLogo';
import '../../styles/components/home/CategoryButtonStates.scss';
import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '../../styles/components/home/Category-menu.scss';

const getCategoryImage = (image = '') => {
  if (!image) return '';

  const fileName = image.split('/').pop();

  return `${import.meta.env.BASE_URL}images/category-buttons/${fileName}`;
};

export const CategoryMenu = ({ items = [] }) => {
  const appDragRef = useRef(null);
  const appDraggedRef = useRef(false);

  // Touch uses native momentum scrolling; mouse dragging uses the same scroll area.
  const startAppDrag = (event) => {
    appDraggedRef.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    appDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
    };
  };
  const moveAppDrag = (event) => {
    const drag = appDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!appDraggedRef.current) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - drag.y)) return;
      appDraggedRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = 'true';
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - dx;
  };
  const endAppDrag = (event) => {
    appDragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <nav className="home-categories" aria-label="콘텐츠 카테고리">
      <div
        className="home-categories__app"
        tabIndex={0}
        aria-label="콘텐츠 카테고리 가로 목록"
        onPointerDown={startAppDrag}
        onPointerMove={moveAppDrag}
        onPointerUp={endAppDrag}
        onPointerCancel={endAppDrag}
        onLostPointerCapture={endAppDrag}
        onClickCapture={(event) => {
          if (!appDraggedRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          appDraggedRef.current = false;
        }}
      >
        <div className="home-categories__app-rows">
          {[items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))].map((row, rowIndex) => (
            <div className="home-categories__app-row" key={rowIndex}>
              {row.map((item, index) => item.path ? (
                <NavLink key={`${item.label}-${index}`} to={item.path} end={item.path === '/'} className="home-categories__card" aria-label={item.label} draggable={false}>
                  <CategoryLogo src={item.image} alt={item.label} />
                </NavLink>
              ) : (
                <div key={`${item.label}-${index}`} className="home-categories__card home-categories__card--static" title={item.label}>
                  <CategoryLogo src={item.image} alt={item.label} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="home-categories__slider">
        <Swiper
          className="home-categories__swiper"
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
                  <CategoryLogo src={item.image} alt={item.label} />
                </NavLink>
              ) : (
                <div className="home-categories__card home-categories__card--static" title={item.label}>
                  <CategoryLogo src={item.image} alt={item.label} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </nav>
  );
};
