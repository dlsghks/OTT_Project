import { useEffect, useRef } from 'react';
import '../../styles/components/common/SliderArrow.scss';

// All card lists share the same glyph, edge gradient, and thumbnail bounds.
export const SliderArrow = ({ direction, thumbnailSelector, ...props }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const slider = button.parentElement;
    const thumbnail = slider.querySelector(thumbnailSelector || [
      '.content-card__thumbnail', '.landscape-card__thumb', '.live-card__thumb',
      '.movie-videos__thumb', '.retro-video-card__play', '.mypage__poster-frame',
      '.mypage__history-thumbnail', '.live-top20__image',
      '.rv-rank-card__poster', '.rv-thumb-card__image', '.rv-short-card__image',
    ].join(', ')) || slider.querySelector('.swiper-slide, li');
    if (!thumbnail) return;

    const updateBounds = () => {
      const bounds = thumbnail.getBoundingClientRect();
      const parentBounds = slider.getBoundingClientRect();
      button.style.top = `${bounds.top - parentBounds.top + slider.scrollTop}px`;
      button.style.height = `${bounds.height}px`;
    };
    const observer = new ResizeObserver(updateBounds);
    observer.observe(thumbnail);
    observer.observe(slider);
    updateBounds();
    return () => observer.disconnect();
  });

  return (
    <button {...props} ref={buttonRef} type="button" className={`slider-arrow slider-arrow--${direction}`}>
      <svg viewBox="0 0 48 84" aria-hidden="true" focusable="false">
        <path d="M18 28L33 41.5L18 55" />
      </svg>
    </button>
  );
};
