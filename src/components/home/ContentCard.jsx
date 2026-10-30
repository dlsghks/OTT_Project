
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImagePath } from "../../utils/imagePath";
import { getTmdbPoster, logTmdbDiagnostic } from "../../services/tmdb";
import "../../styles/components/ContentCard.scss";

const ContentCardBody = ({ item, rank }) => {
  const [tmdbPoster, setTmdbPoster] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [localFailed, setLocalFailed] = useState(false);

  // 직접 지정한 이미지가 있으면 우선 사용
  const localPoster = item.poster || item.image;

  useEffect(() => {
    let cancelled = false;

    // 로컬 이미지가 있거나 제목이 없으면 TMDB 검색 생략
    if ((localPoster && !localFailed) || !(item.title || item.tmdbTitle || item.tmdbId)) return;

    getTmdbPoster(item, { skipLocal: true }).then((poster) => {
      if (!cancelled) {
        setTmdbPoster(poster);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item, localPoster, localFailed]);

  // 최종 포스터 경로
  const poster = localPoster && !localFailed
    ? getImagePath(localPoster)
    : tmdbPoster;

  // 이미지 표시 가능 여부
  const showPoster = Boolean(poster) && !imageError;

  return (
    <Link
      to={`/programdetail/${item.id}`}
      className={`content-card ${rank ? "content-card--ranked" : ""}`}
    >
      <div className="content-card__thumbnail">

        {/* 프로그램 썸네일 */}
        {showPoster && (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            onError={() => {
              if (localPoster && !localFailed) {
                logTmdbDiagnostic('local_image_error');
                setLocalFailed(true);
              } else {
                logTmdbDiagnostic('tmdb_image_error');
                setImageError(true);
              }
            }}
          />
        )}

        {/* 좌측 상단 상태 배지 */}
        {Array.isArray(item.badges) && item.badges.length > 0 ? (
          <div className="content-card__badges">
            {item.badges.map((badge) => (
              <span
                key={badge}
                className={`content-card__badge ${badge === "개별구매" ? "content-card__badge--purchase" : "content-card__badge--new"}`}
              >
                {badge}
              </span>
            ))}
          </div>
        ) : item.badge && (
          <span
            className={`content-card__badge ${
              item.badge === "개별구매"
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

        {/* 이미지가 없거나 불러오기 실패한 경우 */}
        {!showPoster && (
          <span className="content-card__placeholder">
            {item.title}
          </span>
        )}

      </div>

      {/* 카드 하단 제목 */}
      <div className="content-card__info">
        <h3>{item.title}</h3>
      </div>

      {/* TOP 20 순위 SVG 이미지 */}
      {rank && rank <= 20 && (
        <img
          className="content-card__rank"
          src={getImagePath(
            `/images/rank/wavve_rank${rank}.svg`
          )}
          alt={`${rank}위`}
          draggable="false"
        />
      )}

    </Link>
  );
};

export const ContentCard = ({ item, rank }) => {
  // 이미지 식별 정보가 바뀌면 오류 상태와 진행 중 콜백을 이전 카드와 분리한다.
  const imageKey = JSON.stringify([
    item.id, item.title, item.kind, item.tmdbId, item.tmdbTitle,
    item.tmdbYear, item.year, item.tmdbSeason, item.poster, item.image, item.isPlaceholder,
  ]);
  return <ContentCardBody key={imageKey} item={item} rank={rank} />;
};
