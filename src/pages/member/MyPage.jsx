import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import "../../styles/components/MyPage.scss";

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

// 실제 스토어 연결 전에는 Figma의 프로필1 / 전체 0개 상태로 표시됩니다.
// 목록 item 형식: { id, title, image, type: "program" | "movie" | "shorts", to? }
export const MyPage = ({
  profileName = "프로필1", avatar = profileImage, passName = "", coinCount = 0,
  couponCount = 0, retroCount = 0, historyItems = EMPTY_ITEMS,
  favoriteItems = EMPTY_ITEMS, purchasedItems = EMPTY_ITEMS,
  downloadItems = EMPTY_ITEMS, retroPicks = RETRO_PICKS,
  onAction, onOpenContent,
} = {}) => {
  const [activeTab, setActiveTab] = useState("history");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeEvent, setActiveEvent] = useState(1);
  const [dialogTitle, setDialogTitle] = useState("");
  const dialogRef = useRef(null);
  const id = useId();
  const lists = { history: historyItems, favorites: favoriteItems, purchases: purchasedItems, downloads: downloadItems };
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
    const body = <><img className="mypage__poster" src={item.image} alt="" loading="lazy" width="261" height="375" /><span className="mypage__card-title">{item.title}</span></>;
    const className = `mypage__content-card${retro ? " mypage__content-card--retro" : ""}`;
    return (
      <li key={item.id}>
        {onOpenContent ? <button className={className} type="button" onClick={() => onOpenContent(item)}>{body}</button>
          : <Link className={className} to={item.to || (retro ? "/retrov" : "/category")}>{body}</Link>}
      </li>
    );
  };

  return (
    <section className="wavve-mypage" aria-label="마이페이지">
      <div className="mypage__inner">
        <div className="mypage__profile-row">
          <img className="mypage__profile-img" src={avatar} alt={`${profileName} 프로필`} width="90" height="90" />
          <div className="mypage__profile-copy">
            <div className="mypage__profile-heading">
              <h1>{profileName}<span>님</span></h1>
              <Link className="mypage__edit" to="/profileselect" aria-label="프로필 변경">
                <img src={pencilImage} alt="" width="25" height="25" />
              </Link>
            </div>
            <p>{passName || "보유하신 이용권이 없습니다"}</p>
          </div>
          <button className="mypage__pass-button" type="button" onClick={() => requestAction("purchase-pass", "이용권 구매")}>이용권 구매</button>
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
                {FILTERS.map((filter) => <button key={filter.key} type="button" aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}>{filter.label}</button>)}
              </div>
              <p className="mypage__total" aria-live="polite">전체 {visibleItems.length}개</p>
            </div>
            {visibleItems.length ? (
              <ul className="mypage__library-grid">{visibleItems.map((item) => renderCard(item))}</ul>
            ) : (
              <div className="mypage__empty">
                <img className="mypage__empty-icon" src={emptyImage} alt="" width="64" height="64" />
                <h2>{currentItems.length ? "선택한 종류의 콘텐츠가 없어요" : currentTab.title}</h2>
                <p>지금 마음에 드는 작품을 찾아 첫 이야기를 시작해보세요.</p>
                <Link className="mypage__browse" to="/">콘텐츠 둘러보기</Link>
              </div>
            )}
          </div>
        </div>

        <section className="mypage__management" aria-labelledby={`${id}-management`}>
          <h2 id={`${id}-management`}>계정 · 서비스 관리</h2>
          <div className="mypage__management-grid">
            <Link to="/profileselect">프로필 관리<span aria-hidden="true">›</span></Link>
            <button type="button" onClick={() => requestAction("billing", "이용권 · 결제 내역")}>이용권 · 결제 내역<span aria-hidden="true">›</span></button>
            <button type="button" onClick={() => requestAction("coupon", "쿠폰 등록")}>쿠폰 등록<span aria-hidden="true">›</span></button>
            <button type="button" onClick={() => requestAction("support", "고객센터")}>고객센터<span aria-hidden="true">›</span></button>
          </div>
        </section>

        <section className="mypage__retro" aria-labelledby={`${id}-retro`}>
          <h2 id={`${id}-retro`}>레트로 Pick</h2>
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
              <img className="mypage__banner-art mypage__banner-art--right" src={event.image} alt="" />
              {[0, 1, 2, 3, 4].map((heart) => <img key={heart} className={`mypage__heart mypage__heart--${heart}`} src={heart % 2 ? heartGlowImage : heartImage} alt="" />)}
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
