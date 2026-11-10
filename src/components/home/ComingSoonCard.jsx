
import { Heart } from "lucide-react";
import { getImagePath } from "../../utils/imagePath";
import "../../styles/components/home/ComingSoonCard.scss";

export const ComingSoonCard = ({
  item,
  isFavorite,
  onFavoriteClick,
  onPlay,
}) => {
  return (
    <div className="coming-soon-card">
      <button
        type="button"
        className="coming-soon-card__play"
        aria-label={`${item.title} 라인업 영상 재생`}
        onClick={onPlay}
      >
        <span className="coming-soon-card__thumbnail">
          <img
            src={getImagePath(item.image)}
            alt={item.title}
            loading="lazy"
            draggable="false"
          />

          {/* Wavve Original 로고 */}
          {item.isOriginal && (
            <img
              className="coming-soon-card__original"
              src={getImagePath("/images/W-icon.svg")}
              alt="Wavve Original"
              draggable="false"
            />
          )}
        </span>
      </button>

      <div className="coming-soon-card__info">
        <div className="coming-soon-card__text">
          <h3>
            <button type="button" className="coming-soon-card__play" onClick={onPlay}>
              {item.title}
            </button>
          </h3>

          <p>{item.description}</p>
        </div>

        <button
          type="button"
          className={`coming-soon-card__heart ${isFavorite ? "is-active" : ""
            }`}
          onClick={() => onFavoriteClick(item)}
          aria-label={
            isFavorite
              ? `${item.title} 관심 등록 해제`
              : `${item.title} 관심 등록`
          }
          aria-pressed={isFavorite}
        >
          <Heart
            size={26}
            strokeWidth={1.5}
            fill={isFavorite ? "#ff424f" : "none"}
          />
        </button>
      </div>
    </div>
  );
};
