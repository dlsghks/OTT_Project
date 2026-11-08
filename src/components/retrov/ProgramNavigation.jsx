import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';

// 프로그램 필터: 화면보다 넓으면 가로 스크롤 (터치 · 트랙패드는 기본 스크롤, 마우스는 드래그 — 홈 카테고리와 같은 방식)
export default function ProgramNavigation({ programs }) {
  const dragRef = useRef(null);
  const draggedRef = useRef(false);

  const startDrag = (event) => {
    draggedRef.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
    };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!draggedRef.current) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - drag.y)) return;
      draggedRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = 'true';
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - dx;
  };

  const endDrag = (event) => {
    dragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <nav
      className="circle-navigation"
      aria-label="프로그램 선택"
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onClickCapture={(event) => {
        // 드래그로 넘긴 뒤에는 프로그램 링크가 눌리지 않도록
        if (!draggedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        draggedRef.current = false;
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {programs.map((program) => (
        <Link
          key={program.id}
          to={`/retrov/${program.id}`}
          className="circle-navigation__item"
          draggable={false}
        >
          <img
            src={getImagePath(program.image)}
            alt=""
            draggable={false}
          />
          <span>{program.title}</span>
        </Link>
      ))}
    </nav>
  );
}
