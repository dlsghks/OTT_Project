import { useEffect, useId, useRef, useState } from 'react';
import { EditorCollectionCard } from './EditorCollectionCard';

export const EditorCollectionSlider = ({ collections, renderItem, cardType = 'editor', label = '에디터 Pick' }) => {
  const listRef = useRef(null);
  const id = useId();
  const dragRef = useRef(null);
  const blockClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  // Touch uses native scrolling; mouse dragging also works in responsive previews.
  const startDrag = event => {
    blockClickRef.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      moved: false,
    };
  };
  const moveDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      blockClickRef.current = true;
      setDragging(true);
      event.currentTarget.style.scrollSnapType = 'none';
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    drag.distance = distance;
    event.currentTarget.scrollLeft = drag.left - distance;
  };
  const endDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.scrollSnapType = 'x proximity';
    if (drag.moved && event.type !== 'pointercancel') {
      const list = event.currentTarget;
      const step = list.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0);
      const direction = drag.distance < 0 ? 1 : -1;
      list.scrollTo({
        left: drag.left + direction * Math.max(1, Math.round(Math.abs(drag.distance) / step)) * step,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
    if (event.type === 'pointercancel') blockClickRef.current = false;
  };
  const handleClick = event => {
    if (!blockClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    blockClickRef.current = false;
  };
  const [navigation, setNavigation] = useState({ prev: false, next: false });
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const prev = list.scrollLeft > 1;
      const next = list.scrollWidth - list.clientWidth - list.scrollLeft > 1;
      setNavigation(before => before.prev === prev && before.next === next ? before : { prev, next });
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const child of list.children) observer.observe(child);
    return () => { list.removeEventListener('scroll', update); observer.disconnect(); };
  }, [collections]);
  const slide = direction => {
    const list = listRef.current;
    if (!list) return;
    const first = list.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0) : list.clientWidth;
    list.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return (
    <div className={`mypage__editor-slider mypage__editor-slider--${cardType}`}>
      <ul
        className={`mypage__editor-list mypage__editor-list--${cardType}${cardType === "retro" ? " mypage__retro-list" : ""
          }`}
        id={id}
        ref={listRef}
        style={{
          overflowX: 'auto',
          touchAction: 'pan-x pan-y',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          scrollSnapType: dragging ? 'none' : 'x proximity',
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onDragStartCapture={event => event.preventDefault()}
        onClickCapture={handleClick}
      >
        {collections.map(collection => renderItem ? renderItem(collection)
          : <li key={collection.id}><EditorCollectionCard collection={collection} /></li>)}
      </ul>
      {navigation.prev && <button className="mypage__editor-arrow mypage__editor-arrow--prev" type="button"
        aria-label={`이전 ${label}`} aria-controls={id} onClick={() => slide(-1)} />}
      {navigation.next && <button className="mypage__editor-arrow mypage__editor-arrow--next" type="button"
        aria-label={`다음 ${label}`} aria-controls={id} onClick={() => slide(1)} />}
    </div>
  );
};
