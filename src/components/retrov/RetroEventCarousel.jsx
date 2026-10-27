import { useState } from "react";
import "../../styles/components/RetroEventCarousel.scss";

// 가운데 배너 + 양옆 배너가 살짝 보이는 캐러셀
export default function RetroEventCarousel({ banners }) {
  const [current, setCurrent] = useState(0);
  const total = banners.length;
  if (total === 0) return null;

  const move = (step) => setCurrent((prev) => (prev + step + total) % total);
  const getBanner = (offset) => banners[(current + offset + total) % total];

  const slots = total > 1 ? [-1, 0, 1] : [0];

  return (
    <section className="rv-event" aria-roledescription="carousel" aria-label="레트로브 이벤트">
      <div className="rv-event__track">
        {slots.map((offset) => {
          const banner = getBanner(offset);
          const isCenter = offset === 0;
          const [before, highlight, after] = banner.title;

          return (
            <article
              key={`${banner.id}-${offset}`}
              className={`rv-event__slide rv-event__slide--${banner.theme} ${isCenter ? "is-active" : offset < 0 ? "is-prev" : "is-next"
                }`}
              aria-hidden={!isCenter}
              onClick={isCenter ? undefined : () => move(offset)}
            >
              <span className="rv-event__deco rv-event__deco--left" aria-hidden="true">
                ❤
              </span>
              <div className="rv-event__text">
                <p className="rv-event__label">{banner.label}</p>
                <strong className="rv-event__title">
                  {before}
                  <em>{highlight}</em>
                  {after}
                </strong>
                <p className="rv-event__desc">{banner.description}</p>
              </div>
              <span className="rv-event__deco rv-event__deco--right" aria-hidden="true">
                ❤
              </span>
            </article>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button type="button" className="rv-event__nav rv-event__nav--prev" onClick={() => move(-1)} aria-label="이전 이벤트">
            ‹
          </button>
          <button type="button" className="rv-event__nav rv-event__nav--next" onClick={() => move(1)} aria-label="다음 이벤트">
            ›
          </button>
        </>
      )}
    </section>
  );
}
