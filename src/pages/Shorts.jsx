import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShortsPlayer } from "../components/shorts/ShortsPlayer";
import { shortsData } from "../data/shortsData";
import heartOutline from "../assets/shorts/heart-outline.svg";
import heartFilled from "../assets/shorts/heart-filled.svg";
import shareIcon from "../assets/shorts/share.svg";
import "../styles/components/Shorts.scss";

const LIKE_KEY = "wavve-shorts-liked";
const readLikes = () => {
  try {
    const value = JSON.parse(localStorage.getItem(LIKE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id) => typeof id === "string") : [];
  } catch { return []; }
};
const formatLikes = (count) => count >= 10000
  ? `${(count / 10000).toFixed(1).replace(/\.0$/, "")}만` : count.toLocaleString("ko-KR");

export const Shorts = ({ items = shortsData }) => {
  const [params, setParams] = useSearchParams();
  const [likedIds, setLikedIds] = useState(readLikes);
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const viewerRef = useRef(null);
  const wheelTime = useRef(0);
  const touchStart = useRef(null);
  const found = items.findIndex((item) => item.id === params.get("short"));
  const activeIndex = found >= 0 ? found : 0;
  const item = items[activeIndex];

  useEffect(() => {
    try { localStorage.setItem(LIKE_KEY, JSON.stringify(likedIds)); } catch { /* 저장이 제한되어도 화면 동작 유지 */ }
  }, [likedIds]);

  useEffect(() => { setShareMessage(""); setShareUrl(""); }, [item?.id]);

  const goTo = (index) => {
    if (index < 0 || index >= items.length || index === activeIndex) return;
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("short", items[index].id);
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || items.length < 2) return;
    let sum = 0;
    const onWheel = (event) => {
      if (event.target.closest("input, button, a") || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const index = activeIndex + direction;
      if (index < 0 || index >= items.length) return;
      event.preventDefault();
      if (Date.now() - wheelTime.current < 650) return;
      sum += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 500 : 1);
      if (Math.abs(sum) < 70) return;
      wheelTime.current = Date.now();
      sum = 0;
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("short", items[index].id);
        return next;
      }, { replace: true });
    };
    viewer.addEventListener("wheel", onWheel, { passive: false });
    return () => viewer.removeEventListener("wheel", onWheel);
  }, [activeIndex, items, setParams]);

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("short", item.id);
    const textUrl = url.toString();
    setShareMessage(""); setShareUrl("");
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.episode, url: textUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textUrl);
        setShareMessage("영상 링크를 복사했어요.");
      } else {
        setShareUrl(textUrl);
        setShareMessage("아래 링크를 복사해주세요.");
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      setShareUrl(textUrl);
      setShareMessage("아래 링크를 복사해주세요.");
    }
  };

  if (!item) return <section className="shorts-page"><p>등록된 쇼츠가 없습니다.</p></section>;
  const liked = likedIds.includes(item.id);
  const count = Math.max(0, Number(item.likeCount) || 0) + (liked ? 1 : 0);

  return (
    <section className="shorts-page" aria-label="웨이브 쇼츠">
      <div className={`shorts-page__viewer${items.length > 1 ? " shorts-page__viewer--multiple" : ""}`}
        ref={viewerRef} tabIndex={0} aria-label="쇼츠 플레이어. 위아래 방향키로 영상 이동"
        onKeyDown={(event) => {
          if (event.target.closest("input, button, a, [contenteditable=true]")) return;
          if (event.key === "ArrowDown") { event.preventDefault(); goTo(activeIndex + 1); }
          if (event.key === "ArrowUp") { event.preventDefault(); goTo(activeIndex - 1); }
        }}
        onTouchStart={(event) => {
          if (!event.target.closest(".shorts-player__info, .shorts-player__top") || event.target.closest("button, input, a")) return;
          const point = event.touches[0];
          touchStart.current = { x: point.clientX, y: point.clientY };
        }}
        onTouchEnd={(event) => {
          if (!touchStart.current) return;
          const point = event.changedTouches[0];
          const dy = touchStart.current.y - point.clientY;
          const dx = touchStart.current.x - point.clientX;
          touchStart.current = null;
          if (Math.abs(dy) >= 60 && Math.abs(dy) > Math.abs(dx)) goTo(activeIndex + (dy > 0 ? 1 : -1));
        }} onTouchCancel={() => { touchStart.current = null; }}>
        <ShortsPlayer item={item} />
        <aside className="shorts-page__actions" aria-label="영상 조작">
          {items.length > 1 && <div className="shorts-page__navigation">
            <button type="button" aria-label="이전 쇼츠" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}>↑</button>
            <button type="button" aria-label="다음 쇼츠" disabled={activeIndex === items.length - 1} onClick={() => goTo(activeIndex + 1)}>↓</button>
          </div>}
          <button className="shorts-page__action" type="button" aria-label="좋아요" aria-pressed={liked}
            onClick={() => setLikedIds((previous) => previous.includes(item.id)
              ? previous.filter((id) => id !== item.id) : [...previous, item.id])}>
            <span className="shorts-page__action-icon"><img src={liked ? heartFilled : heartOutline} alt="" /></span>
            <span>{formatLikes(count)}</span>
          </button>
          <button className="shorts-page__action" type="button" aria-label="영상 공유" onClick={share}>
            <span className="shorts-page__action-icon"><img src={shareIcon} alt="" /></span>
            <span>공유</span>
          </button>
        </aside>
      </div>
      {shareMessage && <div className="shorts-page__share-notice" role="status">
        <p>{shareMessage}</p>
        {shareUrl && <input aria-label="공유 링크" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />}
      </div>}
    </section>
  );
};

export default Shorts;
