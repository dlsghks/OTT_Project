import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function MyPageEventCarousel({ events, renderBanner }) {
  const count = events.length;
  const [position, setPosition] = useState(count > 1 ? count : 0);
  const [animate, setAnimate] = useState(false);
  const [geometry, setGeometry] = useState(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const moving = useRef(false);
  const reducedMotion = useRef(false);
  const swipe = useRef(null);
  const suppressClick = useRef(false);
  const active = count ? ((position % count) + count) % count : 0;
  const copies = count > 1 ? [...events, ...events, ...events] : events;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!viewport || !first) return;
    const measure = () => {
      const width = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setGeometry({ width, gap, viewport: viewport.clientWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(first);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { reducedMotion.current = query.matches; };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const finish = () => {
    moving.current = false;
    setAnimate(false);
    setPosition(value => count > 1 ? count + ((value % count) + count) % count : 0);
  };

  useEffect(() => {
    if (!moving.current) return;
    // 전환 이벤트가 생략되는 경우에도 조작이 잠기지 않도록 합니다.
    const timer = window.setTimeout(finish, animate ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, [position, animate, count]);

  const goTo = target => {
    if (count < 2 || moving.current) return;
    if (target === position) return;
    moving.current = true;
    setAnimate(!reducedMotion.current);
    setPosition(target);
  };

    useEffect(() => {
    if (count < 2) return;

    const timer = window.setInterval(() => {
      // 전환 중이거나 손으로 넘기는 중이면 건너뛰기
      if (document.hidden || moving.current || swipe.current) return;

      moving.current = true;
      setAnimate(!reducedMotion.current);
      setPosition(value => value + 1);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [count]);

  const offset = geometry
    ? (geometry.viewport - geometry.width) / 2 - position * (geometry.width + geometry.gap)
    : 0;

  if (!count) return null;
  return (
    <section ref={viewportRef} className="mypage__events" aria-label="추천 이벤트" aria-roledescription="캐러셀"
      tabIndex={0} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); goTo(position - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); goTo(position + 1); }
      }}>
      <div ref={trackRef} className="mypage__event-track" style={{
        width: "100%", marginLeft: 0,
        transform: `translate3d(${offset}px, 0, 0)`,
        transition: animate ? "transform 350ms ease" : "none",
        visibility: geometry ? "visible" : "hidden",
        touchAction: "pan-y",
      }}
        onTransitionEnd={event => {
          if (event.target === event.currentTarget && event.propertyName === "transform") finish();
        }}
        onTouchStart={event => {
          const touch = event.touches[0];
          swipe.current = { x: touch.clientX, y: touch.clientY };
          suppressClick.current = false;
        }}
        onTouchMove={event => {
          if (!swipe.current) return;
          const dx = event.touches[0].clientX - swipe.current.x;
          const dy = event.touches[0].clientY - swipe.current.y;
          if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) suppressClick.current = true;
        }}
        onTouchEnd={event => {
          if (!swipe.current) return;
          const dx = event.changedTouches[0].clientX - swipe.current.x;
          const dy = event.changedTouches[0].clientY - swipe.current.y;
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            suppressClick.current = true;
            goTo(position + (dx < 0 ? 1 : -1));
          }
          swipe.current = null;
        }}
        onTouchCancel={() => { swipe.current = null; suppressClick.current = false; }}
        onClickCapture={event => {
          if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
        }}>
        {copies.map((event, index) => (
          <Link key={`${event.id}-${index}`} to={event.to || "/event"}
            className={`mypage__banner mypage__banner--${event.id}`}
            tabIndex={index === position ? 0 : -1} aria-hidden={index === position ? undefined : true}
            aria-label={`${event.eyebrow}: ${event.title} ${event.accent}`}>
            {renderBanner(event)}
          </Link>
        ))}
      </div>
      {count > 1 && <div className="mypage__event-controls" style={{ zIndex: 2 }}>
        <button type="button" aria-label="이전 이벤트" onClick={() => goTo(position - 1)}>‹</button>
        <div className="mypage__event-dots">{events.map((event, index) => (
          <button key={event.id} type="button" aria-label={`${index + 1}번 이벤트 보기`}
            aria-current={active === index ? "true" : undefined} onClick={() => goTo(position + index - active)} />
        ))}</div>
        <button type="button" aria-label="다음 이벤트" onClick={() => goTo(position + 1)}>›</button>
      </div>}
    </section>
  );
}
