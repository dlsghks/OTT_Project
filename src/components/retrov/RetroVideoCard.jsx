import RetroTvFrame from "./RetroTvFrame";

// TV 썸네일 + 제목 / 설명 / 방영일 카드 (썸네일 클릭 시 onPlay 호출)
export default function RetroVideoCard({ video, frame, onPlay }) {
  const canPlay = Boolean(video.videoId && onPlay); // 영상 ID가 없으면 재생 버튼 비활성

  return (
    <article className="retro-video-card">
      <button
        type="button"
        className="retro-video-card__play"
        onClick={() => canPlay && onPlay(video)}
        aria-disabled={!canPlay} // disabled 대신 사용: 카드 위에서 시작하는 드래그 스크롤이 막히지 않도록
        aria-label={canPlay ? `${video.title} 재생` : `${video.title} (영상 준비 중)`}
      >
        <RetroTvFrame src={video.image} alt="" frame={frame} />
        <span className="retro-video-card__play-icon" aria-hidden="true">▶</span>
      </button>

      <h3 className="retro-video-card__title">{video.title}</h3>
      {video.description && <p className="retro-video-card__desc">{video.description}</p>}

      {video.date && (
        <time className="retro-video-card__date" dateTime={video.date.replaceAll(".", "-")}>
          {video.date}
        </time>
      )}
    </article>
  );
}
