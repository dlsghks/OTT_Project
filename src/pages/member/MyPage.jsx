import { SectionTitle } from '../../components/common/SectionTitle';
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationPopup } from "../../components/NotificationPopup";
import { shortsData } from "../../data/shortsData";
import { useProfileShorts } from "../../utils/profileShorts";
import profileImage from "../../assets/mypage/profile.png";
import pencilImage from "../../assets/mypage/pencil.png";
import emptyImage from "../../assets/mypage/empty-play.png";
import infinitePoster from "../../assets/mypage/poster-infinite.png";
import highkickPoster from "../../assets/mypage/poster-highkick.png";
import fullhousePoster from "../../assets/mypage/poster-fullhouse.png";
import dadPoster from "../../assets/mypage/poster-dad.png";
import nextGraphic from "../../assets/mypage/quiz-next.png";
import favoriteGraphic from "../../assets/mypage/quiz-favorite.png";
import linesGraphic from "../../assets/mypage/quiz-lines.png";
import heartImage from "../../assets/mypage/heart.png";
import heartGlowImage from "../../assets/mypage/heart-glow.png";
import "../../styles/pages/member/MyPage.scss";
import "../../styles/pages/member/MyPageShorts.scss";

import mobilePencil from "../../assets/mobile/pencil.svg";
import mobileEmpty from "../../assets/mobile/empty.svg";
import mobileBell from "../../assets/mobile/bell.svg";
import mobileSettings from "../../assets/mobile/settings.svg";
import mobileNextGraphic from "../../assets/mobile/quiz-next.png";
import mobileHeart0 from "../../assets/mobile/heart-0.svg";
import mobileHeart1 from "../../assets/mobile/heart-1.svg";
import mobileHeart2 from "../../assets/mobile/heart-2.svg";
import mobileHeart3 from "../../assets/mobile/heart-3.svg";
import mobileHeart4 from "../../assets/mobile/heart-4.svg";

const MOBILE_HEARTS = [mobileHeart0, mobileHeart1, mobileHeart2, mobileHeart3, mobileHeart4];
const EMPTY_ITEMS = [];
const TABS = [
  { key: "history", label: "시청 내역", title: "아직 시청한 콘텐츠가 없어요" },
  { key: "favorites", label: "관심 콘텐츠", title: "아직 관심 콘텐츠가 없어요" },
  { key: "purchases", label: "구매 콘텐츠", title: "아직 구매한 콘텐츠가 없어요" },
  { key: "downloads", label: "다운로드", title: "아직 다운로드한 콘텐츠가 없어요" },
];
const FILTERS = [
  { key: "all", label: "전체" },
  { key: "program", label: "프로그램" },
  { key: "movie", label: "영화" },
  { key: "shorts", label: "숏츠" },
];
const RETRO_PICKS = [
  {
    id: "infinite",
    title: "무한도전",
    image: infinitePoster,
    to: "/retrov/infinite-challenge",
  },
  {
    id: "highkick",
    title: "거침없이 하이킥!",
    image: highkickPoster,
    to: "/retrov/high-kick",
  },
  {
    id: "fullhouse",
    title: "풀하우스",
    image: fullhousePoster,
    to: "/retrov/full-house",
  },
  {
    id: "dad",
    title: "아빠! 어디가?",
    image: dadPoster,
    to: "/retrov/dad-where-are-we-going",
  },
];
const EVENTS = [
  { id: "next", eyebrow: "풀하우스 다음 장면 퀴즈", title: "잠깐! 이다음에", accent: "무슨 일이?", description: "잊지 못할 장면에 투표하고, 다른 팬들의 선택도 만나보세요", image: nextGraphic },
  { id: "favorite", eyebrow: "최애장면 선택", title: "나의", accent: "최애 장면은?!", description: "잊지 못할 장면에 투표하고, 다른 팬들의 선택도 만나보세요", image: favoriteGraphic },
  { id: "lines", eyebrow: "풀하우스 명대사 퀴즈", title: "다음에 올", accent: "명대사는?", description: "그때 그 대사, 아직 기억하나요?", image: linesGraphic },
];

// 숏츠 찜·시청 기록은 선택한 계정·프로필의 목록을 사용합니다.
// 영상별 실제 썸네일을 사용합니다. 고해상도 이미지가 없으면 기본 해상도로 대체합니다.
const toShortsCard = (item) => ({
  id: `shorts-${item.id}`,
  title: item.title,
  image: item.thumbnailUrl || `https://i.ytimg.com/vi/${encodeURIComponent(item.id)}/maxresdefault.jpg`,
  fallbackImage: `https://i.ytimg.com/vi/${encodeURIComponent(item.id)}/hqdefault.jpg`,
  type: "shorts",
  to: `/shorts?short=${encodeURIComponent(item.id)}`,
});

const MyPagePoster = ({ item, isShorts }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const sources = isShorts
    ? [item.image, item.fallbackImage, emptyImage].filter(Boolean)
    : [item.image, emptyImage].filter(Boolean);
  const useFallback = () => setImageIndex((index) => Math.min(index + 1, sources.length - 1));

  return (
    <img
      className="mypage__poster"
      src={sources[imageIndex]}
      alt={isShorts ? item.title || "저장한 숏츠 재생" : ""}
      loading="lazy"
      width="261"
      height="375"
      onError={useFallback}
      onLoad={(event) => {
        // 일부 영상은 없는 고해상도 이미지 대신 작은 기본 이미지를 반환합니다.
        if (isShorts && imageIndex === 0 && sources.length > 1 &&
            event.currentTarget.naturalWidth <= 120) useFallback();
      }}
    />
  );
};

// 목록 item 형식: { id, title, image, type: "program" | "movie" | "shorts", to? }
export const MyPage = ({
  profileName = "프로필1", avatar = profileImage, passName = "", coinCount = 0,
  couponCount = 0, retroCount = 0, historyItems = EMPTY_ITEMS,
  favoriteItems = EMPTY_ITEMS, purchasedItems = EMPTY_ITEMS,
  downloadItems = EMPTY_ITEMS, retroPicks = RETRO_PICKS,
  onAction, onOpenContent,
} = {}) => {
  const {
    profile: selectedProfile,
    likedIds: likedShortsIds,
    watchedIds: watchedShortsIds,
  } = useProfileShorts();
  const displayedName = selectedProfile.name || profileName;
  const displayedAvatar = selectedProfile.image || avatar;

  const [activeTab, setActiveTab] = useState("history");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeEvent, setActiveEvent] = useState(() => window.matchMedia("(max-width: 1024px)").matches ? 0 : 1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const dialogRef = useRef(null);
  const id = useId();
  // 저장된 ID 순서대로 표시해 가장 최근에 본 영상이 앞에 옵니다.
  const watchedShorts = watchedShortsIds
    .map((id) => shortsData.find((item) => item?.id === id))
    .filter(Boolean)
    .map(toShortsCard);

  const likedShorts = shortsData
    .filter((item) => item && likedShortsIds.includes(item.id))
    .map(toShortsCard);

  const lists = {
    history: [
      ...watchedShorts,
      ...historyItems.filter((item) =>
        !watchedShorts.some((short) => short.id === item.id)
      ),
    ],
    // 전체에서는 모두 표시하고, 숏츠 필터에서는 좋아요한 숏츠만 표시합니다.
    favorites: [
      ...favoriteItems.filter((item) => item.type !== "shorts"),
      ...likedShorts,
    ],
    purchases: purchasedItems,
    downloads: downloadItems,
  };
  const currentItems = lists[activeTab];
  const visibleItems = activeFilter === "all" ? currentItems : currentItems.filter((item) => item.type === activeFilter);
  const currentTab = TABS.find((tab) => tab.key === activeTab);

  useEffect(() => {
    if (dialogTitle && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [dialogTitle]);

  const requestAction = (action, title) => {
    if (onAction) onAction(action);
    else setDialogTitle(title);
  };
  const changeTab = (key) => { setActiveTab(key); setActiveFilter("all"); };
  const handleTabKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    else return;
    event.preventDefault();
    changeTab(TABS[nextIndex].key);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus();
  };

  const renderCard = (item, retro = false) => {
    const isShorts = item.type === "shorts";
    const body = (
      <>
        <div className={`mypage__poster-frame${isShorts ? " mypage__poster-frame--shorts" : ""}`}>
          <MyPagePoster key={`${item.id}:${item.image}`} item={item} isShorts={isShorts} />
          {isShorts && (
            <span className="mypage__shorts-badge">
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                <path d="M1 1L9 6L1 11Z" fill="currentColor" />
              </svg>
              숏츠
            </span>
          )}
        </div>

        {!isShorts && (
          <span className="mypage__card-title">
            {item.title}
          </span>
        )}
      </>
    );
    const className = `mypage__content-card${retro ? " mypage__content-card--retro" : ""}`;
    return (
      <li key={item.id}>
        {onOpenContent && item.type !== "shorts" ? <button className={className} type="button" onClick={() => onOpenContent(item)}>{body}</button>
          : <Link className={className} to={item.to || (retro ? "/retrov" : "/category")}>{body}</Link>}
      </li>
    );
  };

  return (
    <section className="wavve-mypage" aria-label="마이페이지">
      <div className="mypage__inner">
        <div className="mypage__profile-row">
          <img className="mypage__profile-img" src={displayedAvatar} alt={`${displayedName} 프로필`} width="90" height="90" />
          <div className="mypage__profile-copy">
            <div className="mypage__profile-heading">
              <h1>{displayedName}<span>님</span></h1>
              <Link className="mypage__edit" to="/profileedit" aria-label="프로필 수정">
                <picture><source media="(max-width: 1024px)" srcSet={mobilePencil} /><img src={pencilImage} alt="" width="25" height="25" /></picture>
              </Link>
            </div>
            <p>{passName || "보유하신 이용권이 없습니다"}</p>
          </div>
          <div className="mypage__mobile-actions">
            <button type="button" aria-label="알림" aria-haspopup="dialog" aria-expanded={isNotificationOpen} onClick={() => setIsNotificationOpen(true)}><img src={mobileBell} alt="" /></button>
            <Link to="/profileedit" aria-label="프로필 설정"><img src={mobileSettings} alt="" /></Link>
          </div>
          <button className="mypage__pass-button" type="button" onClick={() => requestAction("purchase-pass", "이용권 구매")}><span className="mypage__desktop-copy">이용권 구매</span><span className="mypage__mobile-copy">이용권 구매하기</span></button>
        </div>

        <dl className="mypage__summary">
          <div><dt>보유 코인</dt><dd>{coinCount.toLocaleString("ko-KR")}</dd></div>
          <div><dt>보유 쿠폰</dt><dd>{couponCount.toLocaleString("ko-KR")}</dd></div>
          <div><dt>구매 콘텐츠</dt><dd>{purchasedItems.length.toLocaleString("ko-KR")}</dd></div>
          <div className="mypage__retro-summary"><dt>레트로 콘텐츠</dt><dd>{retroCount.toLocaleString("ko-KR")}</dd></div>
        </dl>

        <div className="mypage__library">
          <div className="mypage__tabs" role="tablist" aria-label="나의 콘텐츠">
            {TABS.map((tab, index) => (
              <button key={tab.key} type="button" role="tab" id={`${id}-tab-${tab.key}`}
                aria-selected={activeTab === tab.key} aria-controls={`${id}-panel`}
                tabIndex={activeTab === tab.key ? 0 : -1}
                onClick={() => changeTab(tab.key)} onKeyDown={(event) => handleTabKeyDown(event, index)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mypage__library-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activeTab}`}>
            <div className="mypage__filter-row">
              <div className="mypage__filters" role="group" aria-label="콘텐츠 종류">
                {FILTERS.filter((filter) => filter.key !== "shorts" || activeTab === "history" || activeTab === "favorites").map((filter) => <button key={filter.key} type="button" aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}>{filter.label}</button>)}
              </div>
              <p className="mypage__total" aria-live="polite">전체 {visibleItems.length}개</p>
            </div>
            {visibleItems.length ? (
              <ul className="mypage__library-grid">{visibleItems.map((item) => renderCard(item))}</ul>
            ) : (
              <div className="mypage__empty">
                <picture><source media="(max-width: 1024px)" srcSet={mobileEmpty} /><img className="mypage__empty-icon" src={emptyImage} alt="" width="64" height="64" /></picture>
                <h2>{currentItems.length ? "선택한 종류의 콘텐츠가 없어요" : currentTab.title}</h2>
                <p>지금 마음에 드는 작품을 찾아 첫 이야기를 시작해보세요.</p>
                <Link className="mypage__browse" to="/">콘텐츠 둘러보기</Link>
              </div>
            )}
          </div>
        </div>

        <section className="mypage__management" aria-labelledby={`${id}-management`}>
          <SectionTitle id={`${id}-management`}>계정 · 서비스 관리</SectionTitle>
          <div className="mypage__management-grid">
            <Link to="/profileedit">프로필 관리<span aria-hidden="true">›</span></Link>
            <button type="button" onClick={() => requestAction("billing", "이용권 · 결제 내역")}>이용권 · 결제 내역<span aria-hidden="true">›</span></button>
            <button type="button" onClick={() => requestAction("coupon", "쿠폰 등록")}>쿠폰 등록<span aria-hidden="true">›</span></button>
            <button type="button" onClick={() => requestAction("support", "고객센터")}>고객센터<span aria-hidden="true">›</span></button>
          </div>
        </section>

        <section className="mypage__retro" aria-labelledby={`${id}-retro`}>
<<<<<<< HEAD
          <h2 id={`${id}-retro`}><span className="mypage__desktop-copy">레트로 Pick</span><span className="mypage__mobile-copy">레트로브 인기회차 픽!</span></h2>
=======
          <SectionTitle id={`${id}-retro`}>레트로 Pick</SectionTitle>
>>>>>>> origin/develop
          <ul className="mypage__retro-list">{retroPicks.map((item) => renderCard(item, true))}</ul>
        </section>
      </div>

      <section className="mypage__events" aria-label="추천 이벤트" aria-roledescription="캐러셀"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" && event.target === event.currentTarget) { event.preventDefault(); setActiveEvent((activeEvent + EVENTS.length - 1) % EVENTS.length); }
          if (event.key === "ArrowRight" && event.target === event.currentTarget) { event.preventDefault(); setActiveEvent((activeEvent + 1) % EVENTS.length); }
        }} tabIndex={0}>
        <div className="mypage__event-track" style={{ "--event-index": activeEvent }}>
          {EVENTS.map((event, index) => (
            <Link key={event.id} to="/event" className={`mypage__banner mypage__banner--${event.id}`} tabIndex={index === activeEvent ? 0 : -1}
              aria-label={`${event.eyebrow}: ${event.title} ${event.accent}`}>
              <img className="mypage__banner-art mypage__banner-art--left" src={event.image} alt="" />
              <div className="mypage__banner-copy"><p>{event.eyebrow}</p><h2>{event.title} <em>{event.accent}</em></h2><p>{event.description}</p></div>
              <picture className="mypage__banner-art-picture">
                {event.id === "next" && <source media="(max-width: 1024px)" srcSet={mobileNextGraphic} />}
                <img className="mypage__banner-art mypage__banner-art--right" src={event.image} alt="" />
              </picture>
              {[0, 1, 2, 3, 4].map((heart) => <picture key={heart}><source media="(max-width: 1024px)" srcSet={MOBILE_HEARTS[heart]} /><img className={`mypage__heart mypage__heart--${heart}`} src={heart % 2 ? heartGlowImage : heartImage} alt="" /></picture>)}
            </Link>
          ))}
        </div>
        <div className="mypage__event-controls">
          <button type="button" aria-label="이전 이벤트" onClick={() => setActiveEvent((activeEvent + EVENTS.length - 1) % EVENTS.length)}>‹</button>
          <div className="mypage__event-dots">{EVENTS.map((event, index) => <button key={event.id} type="button" aria-label={`${index + 1}번 이벤트 보기`}
            aria-current={activeEvent === index ? "true" : undefined} onClick={() => setActiveEvent(index)} />)}</div>
          <button type="button" aria-label="다음 이벤트" onClick={() => setActiveEvent((activeEvent + 1) % EVENTS.length)}>›</button>
        </div>
      </section>

      {isNotificationOpen && <NotificationPopup onClose={() => setIsNotificationOpen(false)} />}

      <dialog className="mypage__dialog" ref={dialogRef} aria-labelledby={`${id}-dialog-title`} onClose={() => setDialogTitle("")}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close(); }}>
        <h2 id={`${id}-dialog-title`}>{dialogTitle}</h2>
        <p>현재 준비 중인 서비스입니다.</p>
        {dialogTitle === "고객센터" && <Link to="/notice" onClick={() => dialogRef.current.close()}>공지사항 보기</Link>}
        <form method="dialog"><button type="submit" autoFocus>확인</button></form>
      </dialog>
    </section>
  );
};

export default MyPage;
