import { lockPlaybackScroll } from '../../utils/playbackScrollLock';
import { useMobileLandscapePlayback } from '../../hooks/useMobileLandscapePlayback';
import { useEffect, useRef, useState } from "react";
import { useProfileWatchHistory, saveProfileWatchHistory } from "../../utils/profileWatchHistory";
import { loadYouTubeAPI } from "../../utils/youtubePlayerApi";
import { ChevronLeft } from "lucide-react";
import "../../styles/components/common/YoutubePlayerModal.scss";

// 유튜브 영상 전체화면 플레이어 (ESC / 뒤로가기 버튼으로 닫기)
// 사용: 홈 시청 중 콘텐츠, 영화 · 시리즈 상세, 레트로브 메인 · 상세
export default function YoutubePlayerModal({ video, onClose, onPlaybackStart }) {
  const closeRef = useRef(null);
  const landscapeRef = useRef(null);
  const landscape = useMobileLandscapePlayback(landscapeRef, Boolean(video.videoId), video.videoId, onClose);
  const { profileId, ownerId } = useProfileWatchHistory();
  // 모달을 연 계정·프로필을 유지하여 재생 중 변경 시 잘못된 계정에 쓰지 않습니다.
  const openedBy = useRef({ profileId, ownerId });
  const [historyError, setHistoryError] = useState("");
  const saveQueue = useRef(Promise.resolve());
  const persistPlayback = (playedVideo, progress) => {
    if (!playedVideo.historyItem) return Promise.resolve();
    const owner = openedBy.current;
    const record = {
      ...playedVideo.historyItem, videoId: playedVideo.videoId,
      episodeTitle: playedVideo.title || playedVideo.historyItem.title,
      thumbnailUrl: playedVideo.thumbnailUrl || (playedVideo.videoId
        ? `https://i.ytimg.com/vi/${encodeURIComponent(playedVideo.videoId)}/hqdefault.jpg` : ""),
      position: progress?.position || 0, duration: progress?.duration || 0,
    };
    // 시작/일시정지/닫기 저장이 역순으로 끝나 진행률을 덮어쓰지 않게 순서를 유지합니다.
    const task = saveQueue.current.then(() => saveProfileWatchHistory(owner.profileId, record, owner.ownerId));
    saveQueue.current = task.catch(() => {});
    return task.catch(() => {
      setHistoryError("시청 기록을 저장하지 못했어요. 계정·프로필과 연결 상태를 확인해주세요.");
    });
  };
  const recordPlayback = async (playedVideo, progress) => {
    setHistoryError("");
    await persistPlayback(playedVideo, progress);
    await onPlaybackStart?.(playedVideo);
  };

  useEffect(() => {
    const releaseScroll = lockPlaybackScroll();
    closeRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      releaseScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const params = new URLSearchParams({
    autoplay: "1", rel: "0", enablejsapi: "1", origin: window.location.origin,
  });
  if (video.playlistId) params.set("list", video.playlistId);
  const startSeconds = Number.isFinite(video.startSeconds) ? Math.floor(video.startSeconds) : 0;
  if (startSeconds > 0) params.set("start", String(startSeconds));
  const src = `https://www.youtube.com/embed/${video.videoId}?${params}`;
  // 영상을 못 찾았으면 유튜브 검색 결과 페이지로 안내
  const searchQuery = video.source?.query ?? video.title;
  const watchParams = new URLSearchParams({ v: video.videoId });
  if (startSeconds > 0) watchParams.set("t", `${startSeconds}s`);
  const watchUrl = video.videoId
    ? `https://www.youtube.com/watch?${watchParams}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const status = video.videoId ? "ready" : video.mbcUrl ? "external" : video.status ?? "loading";

  return (
    <div ref={landscapeRef} className={`yt-modal${landscape.active ? " mobile-landscape-player" : ""}`} role="dialog" aria-modal="true" aria-labelledby="yt-modal-title">
      {/* 상단: 뒤로가기 + 제목 / 오른쪽: 날짜 · 유튜브 링크 */}
      <div className="yt-modal__head">
        <button ref={closeRef} type="button" className="yt-modal__close" onClick={onClose} aria-label="영상 닫기">
          <ChevronLeft size={32} />
        </button>
        <h2 id="yt-modal-title">{video.title}</h2>

        <div className="yt-modal__info">
          {video.videoId && <button type="button" className="mobile-playback-action" onClick={landscape.enter}>전체화면</button>}
          {historyError && <span role="status">{historyError}</span>}
          {video.date && <time dateTime={video.date.replaceAll(".", "-")}>{video.date}</time>}

          {/* 퍼가기가 막힌 영상 · 못 찾은 영상일 때를 위한 유튜브 링크 */}
          {status !== "loading" && status !== "external" && (
            <a className="yt-modal__external" href={watchUrl} target="_blank" rel="noopener noreferrer">
              {status === "ready" ? "재생이 안 되나요? YouTube에서 보기 ↗" : "YouTube에서 직접 찾아보기 ↗"}
            </a>
          )}
          {status === "ready" && video.mbcUrl && (
            <a className="yt-modal__external" href={video.mbcUrl} target="_blank" rel="noopener noreferrer">
              MBC 다시보기 ↗
            </a>
          )}
        </div>
      </div>

      <div className="yt-modal__player">
        {status === "ready" ? (
          <TrackedYoutubeFrame key={src} src={src} video={video} onPlaybackStart={recordPlayback} onPlaybackProgress={persistPlayback} />
        ) : status === "external" ? (
          <div className="yt-modal__status">
            <a className="yt-modal__external" href={video.mbcUrl} target="_blank" rel="noopener noreferrer">
              MBC에서 다시보기 ↗
            </a>
          </div>
        ) : (
          <p className="yt-modal__status" role="status">
            {status === "loading" ? "영상을 찾는 중이에요…" : "재생할 수 있는 영상을 찾지 못했어요."}
          </p>
        )}
      </div>
    </div>
  );
}

// 최초 재생 시 저장하고, 재생 중 15초마다 및 일시정지/종료/닫기 시 진행률을 갱신합니다.
function TrackedYoutubeFrame({ src, video, onPlaybackStart, onPlaybackProgress }) {
  const hostRef = useRef(null);
  const latest = useRef({ video, onPlaybackStart, onPlaybackProgress });
  latest.current = { video, onPlaybackStart, onPlaybackProgress };

  useEffect(() => {
    const host = hostRef.current;
    let cancelled = false;
    let player;
    let started = false;
    let interval;
    let lastProgress = "";
    const snapshot = () => {
      const position = Number(player?.getCurrentTime?.());
      const duration = Number(player?.getDuration?.());
      return { position: Number.isFinite(position) ? Math.max(0, position) : 0,
        duration: Number.isFinite(duration) ? Math.max(0, duration) : 0 };
    };
    const invoke = (callback, progress) => {
      if (!callback) return;
      Promise.resolve(callback(latest.current.video, progress))
        .catch((error) => console.error("시청 기록 저장 실패", error));
    };
    const saveProgress = () => {
      if (!started) return;
      const progress = snapshot();
      const signature = `${Math.floor(progress.position)}:${Math.floor(progress.duration)}`;
      if (lastProgress === signature) return;
      lastProgress = signature;
      invoke(latest.current.onPlaybackProgress, progress);
    };
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = latest.current.video.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    host.appendChild(iframe);
    loadYouTubeAPI().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(iframe, {
        events: {
          onStateChange: (event) => {
            if (cancelled) return;
            if (event.data === YT.PlayerState.PLAYING && !started) {
              started = true;
              const progress = snapshot();
              lastProgress = `${Math.floor(progress.position)}:${Math.floor(progress.duration)}`;
              invoke(latest.current.onPlaybackStart, progress);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              saveProgress();
            }
          },
        },
      });
      interval = window.setInterval(() => {
        if (!cancelled && player?.getPlayerState?.() === YT.PlayerState.PLAYING) saveProgress();
      }, 15000);
    }).catch(() => {});
    return () => {
      saveProgress();
      cancelled = true;
      window.clearInterval(interval);
      player?.destroy();
      iframe.remove();
    };
  }, [src]);
  return <div ref={hostRef} />;
}
