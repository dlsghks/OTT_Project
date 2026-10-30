import RetroTvFrame from "./RetroTvFrame";
import { getImagePath } from "../../utils/imagePath";

// TV 썸네일 + 제목 / 설명 / 방영일 카드 (썸네일 클릭 시 onPlay 호출)
export default function RetroVideoCard({ video, frame, onPlay }) {
  // 재생 가능: 유튜브 id 가 있거나(무한도전), TMDB 고유 id 로 찾을 수 있는 영상(source)
  const canPlay = Boolean((video.videoId || video.source) && onPlay);

  return (
    <article className="retro-video-card">
      <button
        type="button"
        className="retro-video-card__play"
        onClick={() => canPlay && onPlay(video)}
        aria-disabled={!canPlay}
        aria-label={
          canPlay
            ? `${video.title} 재생`
            : `${video.title} (영상 준비 중)`
        }
      >
        <RetroTvFrame
          src={getImagePath(video.image)}
          fallbackSrc={video.fallbackImage}
          alt=""
          frame={frame}
        />

        <span
          className="retro-video-card__play-icon"
          aria-hidden="true"
        >
          ▶
        </span>
      </button>

      <h3 className="retro-video-card__title">
        {video.title}
      </h3>

      {video.description && (
        <p className="retro-video-card__desc">
          {video.description}
        </p>
      )}

      {video.date && (
        <time
          className="retro-video-card__date"
          dateTime={video.date.replaceAll(".", "-")}
        >
          {video.date}
        </time>
      )}
    </article>
  );
}