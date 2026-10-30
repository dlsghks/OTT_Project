import { useState } from "react";
import { getImagePath } from "../../utils/imagePath";
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

          return (
            <article
              key={`${banner.id}-${offset}`}
              className={`rv-event__slide ${isCenter ? "is-active" : offset < 0 ? "is-prev" : "is-next"}`}
              aria-hidden={!isCenter}
              onClick={isCenter ? undefined : () => move(offset)}
            >
              <img src={getImagePath(banner.image)} alt={`${banner.title} ${banner.description}`} draggable="false" />
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
