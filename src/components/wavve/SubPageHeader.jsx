import { useRef } from 'react';
import { HomeHero } from '../home/HomeHero';

export const SubPageHeader = ({
  heroItems = [],
  filters = [],
  activeFilter,
  onFilterChange,
}) => {
  const dragRef = useRef(null);
  const draggedRef = useRef(false);

  const handlePointerDown = (event) => {
    draggedRef.current = false;

    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const element = event.currentTarget;
    const distance = event.clientX - drag.startX;

    if (!draggedRef.current) {
      if (Math.abs(distance) < 6) return;
      if (element.scrollWidth <= element.clientWidth + 1) return;

      draggedRef.current = true;
      element.setPointerCapture(event.pointerId);
      element.dataset.dragging = 'true';
    }

    event.preventDefault();
    element.scrollLeft = drag.scrollLeft - distance;
  };

  const handlePointerEnd = (event) => {
    dragRef.current = null;
    delete event.currentTarget.dataset.dragging;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const renderButton = (filter) => (
    <button
      key={filter.id}
      type="button"
      className={`category-filter__button ${
        activeFilter === filter.id ? 'is-active' : ''
      }`}
      aria-pressed={activeFilter === filter.id}
      onClick={() => onFilterChange(filter.id)}
    >
      {filter.label}
    </button>
  );

  return (
    <>
      <HomeHero items={heroItems} appResponsive />

      {/* 모바일 장르 목록 */}
      <nav className="category-filter-app" aria-label="장르 필터">
        <div className="category-filter-app__rows">
          {[
            filters.slice(0, Math.ceil(filters.length / 2)),
            filters.slice(Math.ceil(filters.length / 2)),
          ].map((row, index) => (
            <div className="category-filter-app__row" key={index}>
              {row.map(renderButton)}
            </div>
          ))}
        </div>
      </nav>

      {/* PC 장르 목록 */}
      <nav
        className="category-filter"
        aria-label="장르 필터"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onClickCapture={(event) => {
          // 드래그 직후에는 버튼 선택 방지
          if (!draggedRef.current || event.detail === 0) return;

          event.preventDefault();
          event.stopPropagation();
          draggedRef.current = false;
        }}
      >
        {filters.map(renderButton)}
      </nav>
    </>
  );
};