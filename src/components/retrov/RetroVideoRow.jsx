import { useRef } from "react";
import RetroVideoCard from "./RetroVideoCard";

// 테마별 영상 가로 스크롤 목록 (휠·터치·마우스 드래그·화살표 버튼)
export default function RetroVideoRow({ id, title, videos, frame, onPlay }) {
  const listRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  function scrollByPage(direction) {
    const list = listRef.current;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  }

  function handlePointerDown(e) {
    if (e.pointerType !== "mouse") return; // 터치는 기본 스크롤 사용
    drag.current = { active: true, moved: false, startX: e.clientX, scrollLeft: listRef.current.scrollLeft };
    listRef.current.style.scrollSnapType = "none"; // 드래그 중 스냅이 끼어들지 않도록
  }

  function handlePointerMove(e) {
    const state = drag.current;
    if (!state.active) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 5) state.moved = true;
    listRef.current.scrollLeft = state.scrollLeft - dx;
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    listRef.current.style.scrollSnapType = "";
  }

  // 드래그 후 손을 뗄 때 카드 클릭이 일어나지 않도록
  function handleClickCapture(e) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <section className="retro-video-row" aria-labelledby={`retro-row-${id}`}>
      <div className="retro-video-row__head">
        <h2 id={`retro-row-${id}`} className="retro-video-row__title">
          {title}
        </h2>
        <div className="retro-video-row__controls">
          <button type="button" onClick={() => scrollByPage(-1)} aria-label={`${title} 이전 영상`}>‹</button>
          <button type="button" onClick={() => scrollByPage(1)} aria-label={`${title} 다음 영상`}>›</button>
        </div>
      </div>

      <ul
        ref={listRef}
        className="retro-video-row__list"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleClickCapture}
      >
        {videos.map((video) => (
          <li key={video.id} className="retro-video-row__item">
            <RetroVideoCard video={video} frame={frame} onPlay={onPlay} />
          </li>
        ))}
      </ul>
    </section>
  );
}
