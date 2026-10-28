import RetroTvFrame from "./RetroTvFrame";
import { getImagePath } from "../../utils/imagePath";

// TV 썸네일 + 제목 / 설명 / 방영일 카드 (썸네일 클릭 시 onPlay 호출)
export default function RetroVideoCard({ video, frame, onPlay }) {
  const canPlay = Boolean(video.videoId && onPlay);

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