import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShortsPlayer } from "../../components/shorts/ShortsPlayer";
import { ShortsShareModal } from "../../components/shorts/ShortsShareModal";
import mobileHeartOutline from "../../assets/shorts/mobile/heart-outline.svg";
import mobileShareIcon from "../../assets/shorts/mobile/share.svg";
import { shortsData, SHORTS_FILTERS } from "../../data/shortsData";
import { saveShortsHistory, toggleShortsLike, useProfileShorts } from "../../utils/profileShorts";
import heartOutline from "../../assets/shorts/heart-outline.svg";
import heartFilled from "../../assets/shorts/heart-filled.svg";
import shareIcon from "../../assets/shorts/share.svg";
import "../../styles/pages/shorts/Shorts.scss";
import "../../styles/pages/shorts/ShortsLikeCount.scss";

// 필터 변경 시 피드를 새로 시작하여 스크롤·재생 상태를 초기화합니다.
export const Shorts = ({ items = shortsData, onGenreChange }) => {
  const [params, setParams] = useSearchParams();
  const filterOptions = useMemo(() => SHORTS_FILTERS.filter((filter) =>
    filter.id === "all" || items.some((item) => item.genres?.includes(filter.id))
  ), [items]);
  const requestedGenre = params.get("genre") || "all";
  const selectedGenre = filterOptions.some((filter) => filter.id === requestedGenre)
    ? requestedGenre : "all";
  const filteredItems = useMemo(() => selectedGenre === "all" ? items
    : items.filter((item) => item.genres?.includes(selectedGenre)), [items, selectedGenre]);

  const selectGenre = (genre) => {
    if (genre === selectedGenre) return;
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("short");
      if (genre === "all") next.delete("genre");
      else next.set("genre", genre);
      return next;
    }, { replace: true });
    onGenreChange?.(genre);
  };

  return <ShortsFeed key={selectedGenre} items={filteredItems}
    selectedGenre={selectedGenre} filterOptions={filterOptions} onGenreChange={selectGenre} />;
};

const ShortsFeed = ({ items, selectedGenre, filterOptions, onGenreChange }) => {
  const [isApp, setIsApp] = useState(() => window.matchMedia('(max-width: 1024px)').matches);
  const [playback, setPlayback] = useState({ id: null, playing: false });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsApp(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
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
  const isPlaying = playback.id === activeItem?.id && playback.playing;
  const handlePlaybackChange = useCallback((playing, id) => {
    setPlayback(previous => previous.id === id && previous.playing === playing
      ? previous : { id, playing });
  }, []);

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
      <div className={`shorts-screen${isPlaying ? ' shorts-screen--playing' : ''}`}>
        <nav className="shorts-screen__genres" aria-label="숏츠 장르" hidden={isPlaying}>
          {filterOptions.map(genre => (
            <button key={genre.id} type="button" aria-pressed={selectedGenre === genre.id}
              className={selectedGenre === genre.id ? 'is-active' : ''}
              onClick={() => onGenreChange(genre.id)}>
              {genre.label}
            </button>
          ))}
        </nav>
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
                {isActive ? <ShortsPlayer item={item} autoPlay={!isApp}
                  onPlaybackChange={handlePlaybackChange}
                  onNavigate={(direction) => goTo(index + direction)} /> : (
                  <div className="shorts-player shorts-player--youtube" aria-hidden="true" />
                )}
                {isActive && (
                  <aside className="shorts-page__actions" aria-label="영상 조작">
                    <div className="shorts-page__navigation">
                      <button type="button" aria-label="이전 쇼츠" disabled={index === 0} onClick={() => goTo(index - 1)}>↑</button>
                      <button type="button" aria-label="다음 쇼츠" disabled={index === items.length - 1} onClick={() => goTo(index + 1)}>↓</button>
                    </div>
                    <button className="shorts-page__action" type="button" aria-label="좋아요" aria-pressed={liked} disabled={likeBusy} onClick={() => toggleLike(item.id)}>
                      <span className="shorts-page__action-icon">
                        <picture>
                          {!liked && <source media="(max-width: 1024px)" srcSet={mobileHeartOutline} />}
                          <img src={liked ? heartFilled : heartOutline} alt="" />
                        </picture>
                      </span>
                      <span className="shorts-page__like-count" aria-live="polite">
                        {Math.max(0, Number(item.likeCount) || 0) + (liked ? 1 : 0)}
                      </span>
                    </button>
                    <button className="shorts-page__action" type="button" aria-label="영상 공유" aria-haspopup="dialog" onClick={() => setShareItem(item)}>
                      <span className="shorts-page__action-icon"><picture>
                        <source media="(max-width: 1024px)" srcSet={mobileShareIcon} />
                        <img src={shareIcon} alt="" />
                      </picture></span>
                      <span>공유</span>
                    </button>
                    {item.programImage && (
                      item.programTo ? (
                        <Link to={item.programTo} aria-label={`${item.programName || item.episode || "프로그램"} 상세페이지 보기`}>
                          <img className="shorts-page__program-image" src={item.programImage} alt="" width={72} height={72} />
                        </Link>
                      ) : (
                        <img className="shorts-page__program-image" src={item.programImage} alt="관련 프로그램" width={72} height={72} />
                      )
                    )}
                  </aside>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p>등록된 쇼츠가 없습니다.</p>}
      </section>
      </div>
      {recordMessage && <p role="status">{recordMessage}</p>}
      {shareItem && <ShortsShareModal key={shareItem.id} item={shareItem} onClose={() => setShareItem(null)} />}
    </>
  );
};

export default Shorts;
