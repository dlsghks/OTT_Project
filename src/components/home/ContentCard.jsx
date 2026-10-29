
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImagePath } from "../../utils/imagePath";
import { getTmdbPoster } from "../../services/tmdb";
import "../../styles/components/ContentCard.scss";

export const ContentCard = ({ item, rank }) => {
  const [tmdbPoster, setTmdbPoster] = useState(null);
  const [imageError, setImageError] = useState(false);

  // 직접 지정한 이미지가 있으면 우선 사용
  const localPoster = item.poster || item.image;

  useEffect(() => {
    let cancelled = false;

    setTmdbPoster(null);
    setImageError(false);

    if (localPoster || !item.title) return;

    getTmdbPoster(item).then((poster) => {
      if (!cancelled) {
        setTmdbPoster(poster);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item.title, item.kind, item.tmdbId, localPoster]);

  const poster = localPoster
    ? getImagePath(localPoster)
    : tmdbPoster;

  const showPoster = Boolean(poster) && !imageError;

  return (
    <Link
      to={`/programdetail/${item.id}`}
      className="content-card"
    >
      <div className="content-card__thumbnail">

        {/* 프로그램 썸네일 */}
        {showPoster && (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        {/* 좌측 상단 상태 배지 */}
        {item.badge && (
          <span
            className={`content-card__badge ${item.badge === "개별구매"
                ? "content-card__badge--purchase"
                : "content-card__badge--new"
              }`}
          >
            {item.badge}
          </span>
        )}

        {/* 우측 상단 Wavve Original 로고 */}
        {item.isOriginal && (
          <img
            className="content-card__original"
            src={getImagePath("/images/W-icon.svg")}
            alt="Wavve Original"
          />
        )}

        {/* 랭킹 번호 */}
        {rank && (
          <span className="content-card__rank">
            {rank}
          </span>
        )}

        {/* 이미지가 없을 때 기존 플레이스홀더 */}
        {!showPoster && (
          <span className="content-card__placeholder">
            {item.title}
          </span>
        )}

      </div>

      <div className="content-card__info">
        <h3>{item.title}</h3>
      </div>
    </Link>
  );
};
