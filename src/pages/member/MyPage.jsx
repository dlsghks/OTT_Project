import { WatchHistoryCard } from "../../components/member/WatchHistoryCard";
import { MyPageEventCarousel } from "../../components/member/MyPageEventCarousel";
import RetroMobileEventSwiper from "../../components/retrov/RetroMobileEventSwiper";
import { eventBanners } from "../../data/retrov/retrov";
import { useMobileLayout } from "../../hooks/useMobileLayout";
import { MemberInfoModal } from "../../components/member/MemberInfoModal";
import { getImagePath } from "../../utils/imagePath";
import { saveProfileWatchHistory, useProfileWatchHistory } from "../../utils/profileWatchHistory";
import { saveContentFavorite, useProfileFavorites } from "../../utils/profileFavorites";
import { EditorCollectionCard } from "../../components/member/EditorCollectionCard";
import "../../styles/pages/member/MyPageUnifiedRow.scss";
import { EditorCollectionSlider } from "../../components/member/EditorCollectionSlider";
import { saveEditorPick, useEditorPicks } from "../../utils/profileEditorPicks";
import { SectionTitle } from '../../components/common/SectionTitle';
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationPanel } from "../../components/common/NotificationPanel";
import { useAuthState } from "../../hooks/useAuthState";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useProfileShorts } from "../../utils/profileShorts";
import { getCoinTotal } from "../../utils/coinRecords";
import { getOwnedCoupons } from "../../utils/couponRecords";
import { getDemoVoucherPurchases } from "../../utils/demoVoucherPurchases";
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
import "../../styles/pages/member/MyPageWatchHistory.scss";

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
const BILLING_TITLE = "이용권 · 결제 내역";
const TABS = [
  { key: "history", label: "시청 내역", title: "아직 시청한 콘텐츠가 없어요" },
  { key: "favorites", label: "관심 콘텐츠", title: "아직 관심 콘텐츠가 없어요" },
  { key: "purchases", label: "구매 콘텐츠", title: "아직 구매한 콘텐츠가 없어요" },
  { key: "downloads", label: "다운로드", title: "아직 다운로드한 콘텐츠가 없어요" },
];
const FILTERS = [
  { key: "all", label: "전체" },
  { key: "editor", label: "에디터 Pick" },
  { key: "program", label: "프로그램" },
  { key: "movie", label: "영화" },
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

const MyPagePoster = ({ item, isShorts }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const sources = isShorts
    ? [item.image, item.fallbackImage, emptyImage].filter(Boolean)
    : [item.image || item.poster, emptyImage].filter(Boolean);
  const useFallback = () => setImageIndex((index) => Math.min(index + 1, sources.length - 1));

  return (
    <img
      className="mypage__poster"
      src={getImagePath(sources[imageIndex])}
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
  profileName = "프로필1", avatar = profileImage, passName = "",
  retroCount = 0, historyItems = EMPTY_ITEMS,
  favoriteItems = EMPTY_ITEMS, purchasedItems = EMPTY_ITEMS,
  downloadItems = EMPTY_ITEMS, retroPicks = RETRO_PICKS,
  onAction, onOpenContent,
} = {}) => {
  const {
    profile: selectedProfile, ownerId,
  } = useProfileShorts();
  const { favorites: savedFavorites } = useProfileFavorites();
  const { history: savedWatchHistory } = useProfileWatchHistory();
  const { liked: likedEditorPicks } = useEditorPicks();
  const displayedName = selectedProfile.name || profileName;
  const displayedAvatar = selectedProfile.image || avatar;
  const coinCount = getCoinTotal(selectedProfile.coinRecords); // 선택한 프로필의 총코인
  const couponCount = getOwnedCoupons(selectedProfile.couponRecords).length; // 선택한 프로필의 보유 쿠폰 수
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("history");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingScope, setEditingScope] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [editFeedback, setEditFeedback] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [openedAt] = useState(Date.now);
  const dialogRef = useRef(null);
  const id = useId();
  const { user, isLoggedIn } = useAuthState();
  const location = useLocation();
  const demoPurchases = getDemoVoucherPurchases(user?.uid);
  const activeDemoPass = demoPurchases.find((purchase) => purchase.expiresAt > openedAt);
  const billingFromReceipt = new URLSearchParams(location.search).get("billing") === "1";
  const visibleDialogTitle = billingFromReceipt ? BILLING_TITLE : dialogTitle;
  const notificationButtonRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const [notificationPosition, setNotificationPosition] = useState(null);
  const notificationPanelId = `${id}-notifications`;

  const notifications = useNotificationStore((state) =>
    state.notificationsByUser[user?.uid] ?? EMPTY_ITEMS
  );
  const onReadNotification = useNotificationStore((state) => state.onReadNotification);
  const onReadAllNotifications = useNotificationStore((state) => state.onReadAllNotifications);
  const unreadCount = isLoggedIn
    ? notifications.filter((item) => !item.readAt).length
    : 0;

  useEffect(() => {
    setIsNotificationOpen(false);
    setNotificationPosition(null);
  }, [location.pathname, user?.uid]);

  useLayoutEffect(() => {
    if (!isNotificationOpen) return;

    const updatePosition = () => {
      const button = notificationButtonRef.current;
      const panel = notificationPanelRef.current;
      if (!button || !panel) return;

      const rect = button.getBoundingClientRect();
      if (!button.getClientRects().length) {
        setIsNotificationOpen(false);
        return;
      }
      const width = panel.getBoundingClientRect().width;
      const next = {
        top: rect.bottom + window.scrollY + 12,
        left: window.scrollX + Math.max(
          16,
          Math.min(rect.right - width, window.innerWidth - width - 16)
        ),
      };
      setNotificationPosition((previous) =>
        previous?.top === next.top && previous?.left === next.left
          ? previous
          : next
      );
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsNotificationOpen(false);
      setNotificationPosition(null);
      notificationButtonRef.current?.focus();
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("keydown", handleKeyDown);

    const observer = new ResizeObserver(updatePosition);
    if (notificationButtonRef.current) observer.observe(notificationButtonRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
    };
  }, [isNotificationOpen]);

  // 숏츠 좋아요는 이 목록에 포함하지 않습니다.
  const withoutShorts = (items) => items.filter((item) => item.type !== "shorts");
  const savedPrograms = withoutShorts(savedFavorites);
  const lists = {
    history: [...savedWatchHistory, ...withoutShorts(historyItems).filter((item) =>
      !savedWatchHistory.some((saved) => saved.id === item.id)
    )],
    favorites: [
      ...savedPrograms,
      ...withoutShorts(favoriteItems).filter((item) =>
        !savedPrograms.some((saved) => saved.id === item.id)
      ),
    ],
    purchases: withoutShorts(purchasedItems),
    downloads: withoutShorts(downloadItems),
  };
  // 종류별 구분 없이 최근 담은 순서로 표시합니다.
  const currentItems = (activeTab === "favorites"
    ? [...lists.favorites, ...likedEditorPicks.map((item) => ({ ...item, type: "editor" }))]
    : lists[activeTab]
  ).sort((a, b) => activeTab === "history"
    ? (Number(b.watchedAt) || 0) - (Number(a.watchedAt) || 0)
    : (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0));
  const visibleItems = activeFilter === "all" ? currentItems
    : currentItems.filter((item) => item.type === activeFilter);
  const isEditorFilter = activeTab === "favorites" && activeFilter === "editor";
  const displayCount = visibleItems.length;
  const filterLabel = FILTERS.find(filter => filter.key === activeFilter)?.label;
  const currentTab = TABS.find((tab) => tab.key === activeTab);
  const editScope = JSON.stringify([ownerId, selectedProfile.id, activeTab]);
  const isEditing = editingScope === editScope;
  const canRemove = (item) => {
    if (activeTab === "history") return savedWatchHistory.some((record) => record.id === item.id);
    if (activeTab !== "favorites") return false;
    return item.type === "editor" || savedFavorites.some((record) => record.id === item.id);
  };
  const showEditButton = isEditing || visibleItems.some(canRemove);

  const removeItem = async (item) => {
    if (!isEditing || isRemoving || !canRemove(item)) return;

    setIsRemoving(true);
    setEditFeedback(null);
    const profileId = selectedProfile.id;
    const options = { remove: true };
    try {
      if (activeTab === "history") {
        await saveProfileWatchHistory(profileId, item, ownerId, options);
      } else if (item.type === "editor") {
        await saveEditorPick(profileId, item, "like", ownerId, options);
      } else {
        await saveContentFavorite(profileId, item, ownerId, options);
      }
      setEditFeedback({ scope: editScope, message: "목록에서 삭제했어요." });
    } catch {
      setEditFeedback({ scope: editScope, message: "삭제하지 못했어요. 다시 시도해주세요." });
    } finally {
      setIsRemoving(false);
    }
  };

  const renderRemoveButton = (item) => isEditing && canRemove(item) && (
    <button
      className="mypage__library-remove"
      type="button"
      aria-label={`${item.episodeTitle || item.title} 삭제`}
      disabled={isRemoving}
      onClick={() => void removeItem(item)}
    >
      삭제
    </button>
  );

  useEffect(() => {
    if (visibleDialogTitle && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [visibleDialogTitle]);

  const navigate = useNavigate();
  const isMobile = useMobileLayout();
  const closeDialog = () => {
    setDialogTitle("");
    if (!billingFromReceipt) return;
    const params = new URLSearchParams(location.search);
    params.delete("billing");
    const search = params.toString();
    navigate({ search: search ? `?${search}` : "" }, { replace: true, preventScrollReset: true });
  };

  const requestAction = (action, title) => {
    if (action === "coupon") navigate("/coupon");
    else if (onAction) onAction(action);
    else if (action === "purchase-pass") navigate("/voucher");
    else setDialogTitle(title);
  };
  const changeTab = (key) => {
    setActiveTab(key);
    setActiveFilter("all");
    setEditingScope("");
    setEditFeedback(null);
  };
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
    const className =
      `mypage__content-card${retro ? " mypage__content-card--retro" : ""}`;

    const body = (
      <>
        <div
          className={`mypage__poster-frame${isShorts ? " mypage__poster-frame--shorts" : ""
            }`}
        >
          <MyPagePoster
            key={`${item.id}:${item.image}`}
            item={item}
            isShorts={isShorts}
          />
        </div>

        {!isShorts && !retro && (
          <span className="mypage__card-title">{item.title}</span>
        )}
      </>
    );

    return (
      <li key={item.id} className={retro ? undefined : "mypage__library-item"}>
        {onOpenContent && !isShorts ? (
          <button
            className={className}
            type="button"
            aria-label={item.title}
            onClick={() => onOpenContent(item)}
          >
            {body}
          </button>
        ) : (
          <Link
            className={className}
            aria-label={item.title}
            to={item.to || (retro ? "/retrov" : "/category")}
          >
            {body}
          </Link>
        )}
        {!retro && renderRemoveButton(item)}
      </li>
    );
  };

  return (
    <section className="wavve-mypage" aria-label="마이페이지">
      <div className="mypage__inner">
        <div className="mypage__profile-row">
          <img
            className="mypage__profile-img"
            src={displayedAvatar}
            alt={`${displayedName} 프로필`}
            width="90"
            height="90"
          />

          <div className="mypage__profile-copy">
            <div className="mypage__profile-heading">
              <h1>
                {displayedName}<span>님</span>
              </h1>

              <Link
                className="mypage__edit"
                to="/profileedit"
                aria-label="프로필 수정"
              >
                <picture>
                  <source
                    media="(max-width: 1024px)"
                    srcSet={mobilePencil}
                  />
                  <img src={pencilImage} alt="" width="25" height="25" />
                </picture>
              </Link>
            </div>

            <p>{passName || (activeDemoPass ? `${activeDemoPass.name} (가상결제)` : "보유하신 이용권이 없습니다")}</p>
          </div>

          <div className="mypage__mobile-actions">
            <button
              ref={notificationButtonRef}
              type="button"
              aria-label={
                unreadCount > 0
                  ? `알림, 읽지 않은 알림 ${unreadCount}개`
                  : "알림"
              }
              aria-expanded={isNotificationOpen}
              aria-controls={notificationPanelId}
              style={{ position: "relative", overflow: "visible" }}
              onClick={() => {
                setNotificationPosition(null);
                setIsNotificationOpen((previous) => !previous);
              }}
            >
              <img src={mobileBell} alt="" />

              {isLoggedIn && unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 18,
                    height: 18,
                    padding: "0 4px",
                    boxSizing: "border-box",
                    borderRadius: 999,
                    background: "#f33445",
                    color: "#fff",
                    font: "700 10px/1 Arial, sans-serif",
                    pointerEvents: "none",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <Link
              to="/settings"
              state={{ from: "/mypage" }}
              aria-label="환경설정"
            >
              <img src={mobileSettings} alt="" />
            </Link>
          </div>

          <button
            className="mypage__pass-button"
            type="button"
            onClick={() => requestAction("purchase-pass", "이용권 구매")}
          >
            <span className="mypage__desktop-copy">이용권 구매</span>
            <span className="mypage__mobile-copy">이용권 구매하기</span>
          </button>
        </div>

        <dl className="mypage__summary">
          <div>
            <dt><Link className="mypage__summary-link" to="/coin">보유 코인</Link></dt>
            <dd>{coinCount.toLocaleString("ko-KR")}</dd>
          </div>
          <div>
            <dt><Link className="mypage__summary-link" to="/coupon">보유 쿠폰</Link></dt>
            <dd>{couponCount.toLocaleString("ko-KR")}</dd>
          </div>
          <div>
            <dt>구매 콘텐츠</dt>
            <dd>{purchasedItems.length.toLocaleString("ko-KR")}</dd>
          </div>
          <div className="mypage__retro-summary">
            <dt>레트로 콘텐츠</dt>
            <dd>{retroCount.toLocaleString("ko-KR")}</dd>
          </div>
        </dl>

        <div className="mypage__library">
          <div
            className="mypage__tabs"
            role="tablist"
            aria-label="나의 콘텐츠"
          >
            {TABS.map((tab, index) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`${id}-tab-${tab.key}`}
                aria-selected={activeTab === tab.key}
                aria-controls={`${id}-panel`}
                tabIndex={activeTab === tab.key ? 0 : -1}
                onClick={() => changeTab(tab.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className={`mypage__library-panel${activeTab === "history" ? " mypage__library-panel--history" : ""}`}
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${activeTab}`}
          >
            <div className="mypage__filter-row">
              <div
                className="mypage__filters"
                role="group"
                aria-label="콘텐츠 필터"
              >
                {FILTERS.filter(
                  (filter) => filter.key !== "editor" || activeTab === "favorites"
                ).map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    aria-pressed={activeFilter === filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mypage__library-actions">
                <p className="mypage__total" aria-live="polite">
                  {filterLabel} {displayCount}개
                </p>
                {showEditButton && (
                  <button
                    className="mypage__library-edit"
                    type="button"
                    disabled={isRemoving}
                    onClick={() => {
                      setEditingScope(isEditing ? "" : editScope);
                      setEditFeedback(null);
                    }}
                  >
                    {isEditing ? "편집 완료" : "편집"}
                  </button>
                )}
              </div>
            </div>

            {editFeedback?.scope === editScope && (
              <p className="mypage__library-feedback" role="status">{editFeedback.message}</p>
            )}

            {visibleItems.length ? (
              <section className="mypage__editor-group" aria-label={`${filterLabel} 콘텐츠`}>
                <EditorCollectionSlider
                  key={`${selectedProfile.id}:${activeTab}:${activeFilter}`}
                  collections={visibleItems}
                  renderItem={(item) => activeTab === "history" ? (
                    <li key={`history:${item.id}`} className="mypage__library-item">
                      <WatchHistoryCard key={`${item.id}:${item.thumbnailUrl || item.videoId || item.image}`} item={item} onOpenContent={onOpenContent} />
                      {renderRemoveButton(item)}
                    </li>
                  ) : item.type === "editor" ? (
                    <li key={`editor:${item.id}`} className="mypage__library-editor-item mypage__library-item">
                      <EditorCollectionCard collection={item} />
                      {renderRemoveButton(item)}
                    </li>
                  ) : renderCard(item)}
                  cardType={activeTab === "history" ? "history" : "posters"}
                  label={filterLabel}
                />
              </section>
            ) : (
              <div className="mypage__empty">
                <div className="mypage__empty-group">
                  <picture>
                    <source
                      media="(max-width: 1024px)"
                      srcSet={mobileEmpty}
                    />
                    <img
                      className="mypage__empty-icon"
                      src={emptyImage}
                      alt=""
                      width="40"
                      height="40"
                    />
                  </picture>

                  <h2 className="mypage__empty-message">
                    {isEditorFilter
                      ? "관심 에디터 Pick이 없어요"
                      : activeTab === "favorites"
                        ? {
                          program: "관심 프로그램이 없어요",
                          movie: "관심 영화가 없어요",
                          all: "아직 관심 콘텐츠가 없어요",
                        }[activeFilter]
                        : currentItems.length
                          ? "선택한 종류의 콘텐츠가 없어요"
                          : currentTab.title}
                  </h2>
                </div>

                <Link
                  className="mypage__browse"
                  to={
                    {
                      program: "/entertainment",
                      movie: "/movie",
                      editor: "/entertainment/all",
                    }[activeFilter] || "/entertainment"
                  }
                >
                  {isEditorFilter
                    ? "에디터 Pick 둘러보기"
                    : "콘텐츠 둘러보기"}
                </Link>
              </div>
            )}
          </div>
        </div>

        <section
          className="mypage__management"
          aria-labelledby={`${id}-management`}
        >
          <SectionTitle id={`${id}-management`}>
            계정 · 서비스 관리
          </SectionTitle>

          <div className="mypage__management-grid">
            <button
              type="button"
              onClick={() => setIsMemberInfoOpen(true)}
              aria-haspopup="dialog"
            >
              회원정보 수정<span aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              onClick={() => requestAction("billing", BILLING_TITLE)}
            >
              이용권 · 결제 내역<span aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              onClick={() => requestAction("coupon", "쿠폰 등록")}
            >
              쿠폰 등록<span aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              onClick={() => requestAction("support", "고객센터")}
            >
              고객센터<span aria-hidden="true">›</span>
            </button>
          </div>

          {isMemberInfoOpen && (
            <MemberInfoModal onClose={() => setIsMemberInfoOpen(false)} />
          )}
        </section>

        <section
          className="mypage__retro"
          aria-labelledby={`${id}-retro`}
        >
          <SectionTitle id={`${id}-retro`}>
            <span className="mypage__desktop-copy">레트로 Pick</span>
            <span className="mypage__mobile-copy">
              레트로브 인기회차 픽!
            </span>
          </SectionTitle>

          <EditorCollectionSlider
            collections={retroPicks}
            renderItem={(item) => renderCard(item, true)}
            cardType="retro"
            label="레트로 Pick"
          />
        </section>
      </div>

      {isMobile ? <RetroMobileEventSwiper banners={eventBanners} className="mypage__events" /> : <MyPageEventCarousel
        events={EVENTS}
        renderBanner={(event) => (
          <>
            <img
              className="mypage__banner-art mypage__banner-art--left"
              src={event.image}
              alt=""
            />

            <div className="mypage__banner-copy">
              <p>{event.eyebrow}</p>
              <h2>
                {event.title} <em>{event.accent}</em>
              </h2>
              <p>{event.description}</p>
            </div>

            <picture className="mypage__banner-art-picture">
              {event.id === "next" && (
                <source
                  media="(max-width: 1024px)"
                  srcSet={mobileNextGraphic}
                />
              )}
              <img
                className="mypage__banner-art mypage__banner-art--right"
                src={event.image}
                alt=""
              />
            </picture>

            {[0, 1, 2, 3, 4].map((heart) => (
              <picture key={heart}>
                <source
                  media="(max-width: 1024px)"
                  srcSet={MOBILE_HEARTS[heart]}
                />
                <img
                  className={`mypage__heart mypage__heart--${heart}`}
                  src={heart % 2 ? heartGlowImage : heartImage}
                  alt=""
                />
              </picture>
            ))}
          </>
        )}
      />}

      {isNotificationOpen &&
        createPortal(
          <div
            ref={notificationPanelRef}
            className="header-notification-portal"
            style={{
              position: "absolute",
              top: notificationPosition?.top ?? 0,
              left: notificationPosition?.left ?? 0,
              width: "min(480px, calc(100vw - 32px))",
              visibility: notificationPosition ? "visible" : "hidden",
              zIndex: 1000,
            }}
          >
            <NotificationPanel
              id={notificationPanelId}
              isLoggedIn={isLoggedIn}
              notifications={isLoggedIn ? notifications : EMPTY_ITEMS}
              onRead={(notificationId) =>
                onReadNotification(user?.uid, notificationId)
              }
              onReadAll={() => onReadAllNotifications(user?.uid)}
            />
          </div>,
          document.body
        )}

      <dialog
        className="mypage__dialog"
        ref={dialogRef}
        aria-labelledby={`${id}-dialog-title`}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current.close();
          }
        }}
      >
        <h2 id={`${id}-dialog-title`}>{visibleDialogTitle}</h2>
        {visibleDialogTitle === BILLING_TITLE ? (
          demoPurchases.length ? (
            <ul className="mypage__billing-history">
              {demoPurchases.map((purchase) => (
                <li key={purchase.id}>
                  <strong>{purchase.name} · {purchase.months}개월</strong>
                  <span>{purchase.amount.toLocaleString("ko-KR")}원 · 가상결제 승인</span>
                  <time dateTime={new Date(purchase.purchasedAt).toISOString()}>
                    {new Date(purchase.purchasedAt).toLocaleDateString("ko-KR")}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p>이 브라우저에 저장된 가상결제 내역이 없습니다.</p>
          )
        ) : (
          <p>현재 준비 중인 서비스입니다.</p>
        )}

        {visibleDialogTitle === "고객센터" && (
          <Link to="/notice" onClick={() => dialogRef.current.close()}>
            공지사항 보기
          </Link>
        )}

        <form method="dialog">
          <button type="submit" autoFocus>
            확인
          </button>
        </form>
      </dialog>
    </section>
  );
};

export default MyPage;