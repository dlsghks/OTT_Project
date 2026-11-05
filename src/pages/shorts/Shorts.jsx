import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShortsPlayer } from "../../components/shorts/ShortsPlayer";
import { ShortsShareModal } from "../../components/shorts/ShortsShareModal";
import { shortsData } from "../../data/shortsData";
import { saveShortsHistory, toggleShortsLike, useProfileShorts } from "../../utils/profileShorts";
import heartOutline from "../../assets/shorts/heart-outline.svg";
import heartFilled from "../../assets/shorts/heart-filled.svg";
import shareIcon from "../../assets/shorts/share.svg";
import "../../styles/pages/shorts/Shorts.scss";

export const Shorts = ({ items = shortsData }) => {
  const [params, setParams] = useSearchParams();
  const initialIndex = useRef(
    Math.max(0, items.findIndex((item) => item?.id === params.get("short")))
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex.current);
  const { profile, likedIds, ownerId } = useProfileShorts();
  const [recordMessage, setRecordMessage] = useState("");
  const [likeBusy, setLikeBusy] = useState(false);
  const likeBusyRef = useRef(false);
  const profileId = profile.id;
  const [shareItem, setShareItem] = useState(null);
  const feedRef = useRef(null);
  const slidesRef = useRef([]);
  const activeIndexRef = useRef(activeIndex);
  const activeItem = items[activeIndex];
  activeIndexRef.current = activeIndex;

  // 현재 영상이 보이는 탭에서 2초간 활성화되면 기록합니다.
  // 실제 재생 시간을 확인하려면 ShortsPlayer의 재생 상태 연결이 필요합니다.
  useEffect(() => {
    const id = activeItem?.id;
    if (!id || shareItem) return;
    let timer;
    let recorded = false;
    let cancelled = false;

    const startTimer = () => {
      window.clearTimeout(timer);
      if (document.visibilityState !== "visible" || recorded) return;
      timer = window.setTimeout(async () => {
        if (document.visibilityState !== "visible" || cancelled) return;
        try {
          recorded = await saveShortsHistory(profileId, id, ownerId);
        } catch {
          if (!cancelled) setRecordMessage("시청 기록을 저장하지 못했어요. 연결을 확인해주세요.");
        }
      }, 2000);
    };

    startTimer();
    document.addEventListener("visibilitychange", startTimer);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", startTimer);
    };
  }, [activeItem?.id, shareItem, profileId, ownerId]);

  useLayoutEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTop = initialIndex.current * feed.clientHeight;
    const resize = new ResizeObserver(() => {
      feed.scrollTo({
        top: activeIndexRef.current * feed.clientHeight,
        behavior: "instant",
      });
    });
    resize.observe(feed);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.intersectionRatio >= 0.6)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveIndex(Number(visible.target.dataset.index));
    }, { root: feed, threshold: [0, 0.6, 1] });
    slidesRef.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    setShareItem(null);
    setRecordMessage("");
  }, [activeItem?.id, profileId, ownerId]);

  useEffect(() => {
    if (!activeItem || params.get("short") === activeItem.id) return;
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("short", activeItem.id);
      return next;
    }, { replace: true });
  }, [activeItem, params, setParams]);

  const goTo = (index) => {
    const feed = feedRef.current;
    if (shareItem || !feed || index < 0 || index >= items.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    feed.scrollTo({
      top: index * feed.clientHeight,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  const toggleLike = async (id) => {
    if (likeBusyRef.current) return;
    likeBusyRef.current = true;
    setLikeBusy(true);
    setRecordMessage("");
    try {
      await toggleShortsLike(profileId, id, ownerId);
    } catch {
      setRecordMessage("찜을 저장하지 못했어요. 연결을 확인하고 다시 시도해주세요.");
    } finally {
      likeBusyRef.current = false;
      setLikeBusy(false);
    }
  };

  return (
    <>
      <section
        className={`shorts-page shorts-page--feed${shareItem ? " shorts-page--sharing" : ""}`}
        aria-label="웨이브 쇼츠"
        ref={feedRef}
        tabIndex={0}
        onKeyDown={(event) => {
          if (shareItem || event.target.closest("button, a, input")) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            goTo(activeIndex + 1);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            goTo(activeIndex - 1);
          }
        }}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const liked = likedIds.includes(item.id);
          return (
            <div
              className="shorts-page__slide"
              data-index={index}
              key={item.id}
              ref={(element) => { slidesRef.current[index] = element; }}
              aria-label={`${index + 1}번째 쇼츠`}
            >
              <div className="shorts-page__viewer">
                {isActive ? <ShortsPlayer item={item} /> : (
                  <div className="shorts-player shorts-player--youtube" aria-hidden="true" />
                )}
                {isActive && (
                  <aside className="shorts-page__actions" aria-label="영상 조작">
                    <div className="shorts-page__navigation">
                      <button type="button" aria-label="이전 쇼츠" disabled={index === 0} onClick={() => goTo(index - 1)}>↑</button>
                      <button type="button" aria-label="다음 쇼츠" disabled={index === items.length - 1} onClick={() => goTo(index + 1)}>↓</button>
                    </div>
                    <button className="shorts-page__action" type="button" aria-label="좋아요" aria-pressed={liked} disabled={likeBusy} onClick={() => toggleLike(item.id)}>
                      <span className="shorts-page__action-icon"><img src={liked ? heartFilled : heartOutline} alt="" /></span>
                    </button>
                    <button className="shorts-page__action" type="button" aria-label="영상 공유" aria-haspopup="dialog" onClick={() => setShareItem(item)}>
                      <span className="shorts-page__action-icon"><img src={shareIcon} alt="" /></span>
                      <span>공유</span>
                    </button>
                    {item.programImage && (
                      <img className="shorts-page__program-image" src={item.programImage} alt="관련 프로그램" width={72} height={72} />
                    )}
                  </aside>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p>등록된 쇼츠가 없습니다.</p>}
      </section>
      {recordMessage && <p role="status">{recordMessage}</p>}
      {shareItem && <ShortsShareModal key={shareItem.id} item={shareItem} onClose={() => setShareItem(null)} />}
    </>
  );
};

export default Shorts;
