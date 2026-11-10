
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { getImagePath } from "../../utils/imagePath";
import "../../styles/components/home/ComingSoonCard.scss";

export const ComingSoonCard = ({
  item,
  isFavorite,
  onFavoriteClick,
}) => {
  const detailPath = `/home-content/coming-soon/${item.id}`;
  return (
    <div className="coming-soon-card">
      {/* 썸네일을 감싸는 링크 */}
      <Link to={detailPath} className="coming-soon-card__link">
        <div className="coming-soon-card__thumbnail">
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
        </div>
      </Link>

      <div className="coming-soon-card__info">
        <div className="coming-soon-card__text">
          {/* // 제목을 감싸는 링크 */}
          <Link to={detailPath}>
            <h3>{item.title}</h3>
          </Link>

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
