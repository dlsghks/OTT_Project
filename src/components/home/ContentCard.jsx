
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIndividualPurchaseMovie } from "../../data/individualPurchaseMovies";
import { getImagePath } from "../../utils/imagePath";
import { getTmdbPoster, logTmdbDiagnostic } from "../../services/tmdb";
import "../../styles/components/home/ContentCard.scss";

const ContentCardBody = ({ item, rank, onPosterLoad }) => {
  const [tmdbPoster, setTmdbPoster] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [localFailed, setLocalFailed] = useState(false);

  // 직접 지정한 이미지가 있으면 우선 사용
  const localPoster = item.poster || item.image;

  useEffect(() => {
    let cancelled = false;

    // 로컬 이미지가 있거나 제목이 없으면 TMDB 검색 생략
    if (
      (localPoster && !localFailed) ||
      !(item.title || item.tmdbTitle || item.tmdbId)
    ) return;

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
  const poster =
    localPoster && !localFailed
      ? getImagePath(localPoster)
      : tmdbPoster;

  // 이미지 표시 가능 여부
  const showPoster = Boolean(poster) && !imageError;
  const movieId = item.link?.match(/^\/moviedetail\/(\d+)$/)?.[1]
    ?? (item.kind === 'movie' ? item.tmdbId : null);
  const isIndividualPurchase = Boolean(getIndividualPurchaseMovie(movieId));
  const badges = Array.isArray(item.badges) && item.badges.length > 0
    ? item.badges
    : item.badge ? [item.badge] : [];
  const visibleBadges = isIndividualPurchase
    ? ['개별구매', ...badges.filter((badge) => badge !== '개별구매')]
    : badges;

  return (
    <Link
      to={item.link || `/programdetail/${item.id}`}
      className={`content-card ${rank ? "content-card--ranked" : ""}`}
    >
      <div className="content-card__visual">
      <div className="content-card__thumbnail">

        {/* 프로그램 썸네일 */}
        {showPoster && (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            onLoad={(event) => onPosterLoad?.(event.currentTarget.getAttribute('src'))}
            onError={() => {
              if (localPoster && !localFailed) {
                logTmdbDiagnostic("local_image_error");
                setLocalFailed(true);
              } else {
                logTmdbDiagnostic("tmdb_image_error");
                setImageError(true);
              }
            }}
          />
        )}

        {/* 좌측 상단 상태 배지 */}
        {visibleBadges.length > 0 && (
          <div className="content-card__badges">
            {visibleBadges.map((badge) => (
              <span
                key={badge}
                className={`content-card__badge ${
                  badge === "개별구매"
                    ? "content-card__badge--purchase"
                    : "content-card__badge--new"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
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
      </div>

      {/* 카드 하단 정보 */}
      <div className="content-card__info">

        {/* 콘텐츠 제목 */}
        <h3>{item.title}</h3>

        {/* 업데이트 날짜가 있는 콘텐츠만 표시 */}
        {item.updatedAt && (
          <p className="content-card__date">
            {item.updatedAt.replaceAll("-", ".")}(금)
          </p>
        )}

      </div>

    </Link>
  );
};

export const ContentCard = ({ item, rank, onPosterLoad }) => {
  const imageKey = JSON.stringify([
    item.id,
    item.title,
    item.kind,
    item.tmdbId,
    item.tmdbTitle,
    item.tmdbYear,
    item.year,
    item.tmdbSeason,
    item.poster,
    item.image,
    item.isPlaceholder,
    item.updatedAt,
  ]);

  return (
    <ContentCardBody
      key={imageKey}
      item={item}
      rank={rank}
      onPosterLoad={onPosterLoad}
    />
  );
};
