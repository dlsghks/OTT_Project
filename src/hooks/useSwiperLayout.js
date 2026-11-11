import { useCallback, useEffect, useRef } from 'react';

// CSS 반응형 너비가 확정된 뒤 Swiper의 이동 범위도 같은 너비로 맞춥니다.
export const useSwiperLayout = () => {
  const cleanupRef = useRef(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  return useCallback((swiper) => {
    cleanupRef.current?.();
    let frame = 0;
    let geometry = '';
    const observed = new Set();

    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (swiper.destroyed || !swiper.el) return;
        const next = [swiper.el.clientWidth, ...Array.from(swiper.slides, (slide) =>
          slide.getBoundingClientRect().width.toFixed(3))].join(':');
        if (next === geometry) return;
        geometry = next;
        const wasAtEnd = swiper.isEnd;
        swiper.update();
        if (wasAtEnd && !swiper.isLocked) {
          swiper.slideTo(swiper.slides.length - 1, 0, false);
        }
      });
    };

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refresh);
    const observeSlides = () => {
      [swiper.el, ...swiper.slides].forEach((element) => {
        if (!element || observed.has(element)) return;
        observed.add(element);
        observer?.observe(element);
      });
      refresh();
    };

    const cleanup = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      swiper.off('slidesLengthChange', observeSlides);
      swiper.off('destroy', cleanup);
    };
    swiper.on('slidesLengthChange', observeSlides);
    swiper.on('destroy', cleanup);
    cleanupRef.current = cleanup;
    observeSlides();
  }, []);
};
