import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    const saved = JSON.parse(localStorage.getItem(LIKE_KEY) || "[]");

    return Array.isArray(saved)
      ? saved.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
};

export const Shorts = ({ items = shortsData }) => {
  const [params, setParams] = useSearchParams();

  const initialIndex = useRef(
    Math.max(0, items.findIndex((item) => item.id === params.get("short")))
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex.current);
  const [likedIds, setLikedIds] = useState(readLikes);
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const feedRef = useRef(null);
  const slidesRef = useRef([]);
  const activeIndexRef = useRef(activeIndex);

  const activeItem = items[activeIndex];
  activeIndexRef.current = activeIndex;

  // 좋아요 저장
  useEffect(() => {
    try {
      localStorage.setItem(LIKE_KEY, JSON.stringify(likedIds));
    } catch {
      // 저장이 제한되어도 화면에서는 동작합니다.
    }
  }, [likedIds]);

  // 공유 링크로 접속하면 해당 영상 위치에서 시작
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

  // 현재 화면에 보이는 영상 선택
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.intersectionRatio >= 0.6)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveIndex(Number(visible.target.dataset.index));
        }
      },
      {
        root: feed,
        threshold: [0, 0.6, 1],
      }
    );

    slidesRef.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [items]);

  // 영상 변경 시 공유 안내 초기화
  useEffect(() => {
    setShareMessage("");
    setShareUrl("");
  }, [activeItem?.id]);

  // 현재 영상 정보를 주소에 반영
  useEffect(() => {
    if (!activeItem || params.get("short") === activeItem.id) return;

    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("short", activeItem.id);
        return next;
      },
      { replace: true }
    );
  }, [activeItem, params, setParams]);

  // 이전·다음 영상 이동
  const goTo = (index) => {
    const feed = feedRef.current;

    if (!feed || index < 0 || index >= items.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    feed.scrollTo({
      top: index * feed.clientHeight,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  // 좋아요 토글
  const toggleLike = (id) => {
    setLikedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  };

  // 현재 영상 공유
  const share = async (item) => {
    const url = new URL(window.location.href);
    url.searchParams.set("short", item.id);

    setShareMessage("");
    setShareUrl("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          url: url.toString(),
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setShareMessage("영상 링크를 복사했어요.");
      } else {
        setShareUrl(url.toString());
        setShareMessage("아래 링크를 복사해주세요.");
      }
    } catch (error) {
      if (error.name === "AbortError") return;

      setShareUrl(url.toString());
      setShareMessage("아래 링크를 복사해주세요.");
    }
  };

  return (
    <section
      className="shorts-page shorts-page--feed"
      aria-label="웨이브 쇼츠"
      ref={feedRef}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target.closest("button, a, input")) return;

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
            ref={(element) => {
              slidesRef.current[index] = element;
            }}
            aria-label={`${index + 1}번째 쇼츠`}
          >
            <div className="shorts-page__viewer">
              {/* 현재 영상만 플레이어 연결 */}
              {isActive ? (
                <ShortsPlayer item={item} />
              ) : (
                <div
                  className="shorts-player shorts-player--youtube"
                  aria-hidden="true"
                />
              )}

              {isActive && (
                <>
                  {/* 오른쪽 버튼 묶음 */}
                  <aside
                    className="shorts-page__actions"
                    aria-label="영상 조작"
                  >
                    <div className="shorts-page__navigation">
                      <button
                        type="button"
                        aria-label="이전 쇼츠"
                        disabled={index === 0}
                        onClick={() => goTo(index - 1)}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        aria-label="다음 쇼츠"
                        disabled={index === items.length - 1}
                        onClick={() => goTo(index + 1)}
                      >
                        ↓
                      </button>
                    </div>

                    {/* 좋아요: 숫자 없이 하트만 표시 */}
                    <button
                      className="shorts-page__action"
                      type="button"
                      aria-label="좋아요"
                      aria-pressed={liked}
                      onClick={() => toggleLike(item.id)}
                    >
                      <span className="shorts-page__action-icon">
                        <img
                          src={liked ? heartFilled : heartOutline}
                          alt=""
                        />
                      </span>
                    </button>

                    {/* 공유 */}
                    <button
                      className="shorts-page__action"
                      type="button"
                      aria-label="영상 공유"
                      onClick={() => share(item)}
                    >
                      <span className="shorts-page__action-icon">
                        <img src={shareIcon} alt="" />
                      </span>
                      <span>공유</span>
                    </button>

                    {/* 공유 아래 프로그램 이미지 */}
                    {item.programImage && (
                      <img
                        className="shorts-page__program-image"
                        src={item.programImage}
                        alt="관련 프로그램"
                        width={72}
                        height={72}
                      />
                    )}
                  </aside>

                  {/* 공유 안내 */}
                  {shareMessage && (
                    <div
                      className="shorts-page__feed-message"
                      role="status"
                    >
                      <p>{shareMessage}</p>

                      {shareUrl && (
                        <input
                          aria-label="공유 링크"
                          readOnly
                          value={shareUrl}
                          onFocus={(event) => event.target.select()}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {items.length === 0 && <p>등록된 쇼츠가 없습니다.</p>}
    </section>
  );
};

export default Shorts;