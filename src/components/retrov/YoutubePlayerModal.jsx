import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import "../../styles/components/YoutubePlayerModal.scss";

// 카드 클릭 시 뜨는 유튜브 재생 팝업 (ESC / 배경 클릭 / X 버튼으로 닫기)
export default function YoutubePlayerModal({ video, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 뒤 페이지 스크롤 막기
    closeRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (video.playlistId) params.set("list", video.playlistId);
  const src = `https://www.youtube.com/embed/${video.videoId}?${params}`;
  // 영상을 못 찾았으면 유튜브 검색 결과 페이지로 안내
  const searchQuery = video.source?.query ?? video.title;
  const watchUrl = video.videoId
    ? `https://www.youtube.com/watch?v=${video.videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const status = video.videoId ? "ready" : video.status ?? "loading"; // loading | notFound | ready

  return (
    <div className="yt-modal" role="dialog" aria-modal="true" aria-labelledby="yt-modal-title" onClick={onClose}>
      <div className="yt-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="yt-modal__head">
          <h2 id="yt-modal-title">{video.title}</h2>
          <button ref={closeRef} type="button" className="yt-modal__close" onClick={onClose} aria-label="영상 닫기">
            <X size={28} />
          </button>
        </div>

        <div className="yt-modal__player">
          {status === "ready" ? (
            <iframe
              src={src}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <p className="yt-modal__status" role="status">
              {status === "loading" ? "영상을 찾는 중이에요…" : "재생할 수 있는 영상을 찾지 못했어요."}
            </p>
          )}
        </div>

        <div className="yt-modal__info">
          {video.description && <p>{video.description}</p>}
          {video.date && <time dateTime={video.date.replaceAll(".", "-")}>{video.date}</time>}

          {/* 퍼가기가 막힌 영상 · 못 찾은 영상일 때를 위한 유튜브 링크 */}
          {status !== "loading" && (
            <a className="yt-modal__external" href={watchUrl} target="_blank" rel="noopener noreferrer">
              {status === "ready" ? "재생이 안 되나요? YouTube에서 보기 ↗" : "YouTube에서 직접 찾아보기 ↗"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
