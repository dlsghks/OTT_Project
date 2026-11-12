import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { MyHover } from '../member/MyHover';
import { NotificationPanel } from '../common/NotificationPanel';

import { useAuthState } from '../../hooks/useAuthState';
import { useNotificationStore } from '../../store/useNotificationStore';

import logo from '../../assets/wavve_logo_w.svg';
import bellIcon from '../../assets/icons/lyra-icon-bell-02.svg';
import searchIcon from '../../assets/icons/lyra-icon-search.svg';

import '../../styles/layout/Header.scss';

import { Link, NavLink, useLocation } from 'react-router-dom';

const EMPTY_NOTIFICATIONS = [];

const mainMenu = [
  { id: 1, menu: '예능', path: '/entertainment' },
  { id: 2, menu: '드라마', path: '/drama' },
  { id: 3, menu: '영화', path: '/movie' },
  { id: 4, menu: '시사교양', path: '/currentaffairs' },
  { id: 5, menu: '애니', path: '/animation' },
  { id: 6, menu: '해외시리즈', path: '/global' },
  { id: 7, menu: '라이브', path: '/live' },
  { id: 8, menu: '쇼츠', path: '/shorts' },
  { id: 9, menu: '레트로브', path: '/retrov' },
];

export const Header = ({
  onNotificationClick,
  onSearchClick,
}) => {
  const { user, isLoggedIn } = useAuthState();
  const location = useLocation();
  const panelId = useId();

  const headerRef = useRef(null);
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [panelPosition, setPanelPosition] = useState(null);

  const notifications = useNotificationStore(
    (state) =>
      state.notificationsByUser[user?.uid] ??
      EMPTY_NOTIFICATIONS
  );

  const onReadNotification = useNotificationStore(
    (state) => state.onReadNotification
  );

  const onReadAllNotifications = useNotificationStore(
    (state) => state.onReadAllNotifications
  );

  const unreadCount = isLoggedIn
    ? notifications.filter((item) => !item.readAt).length
    : 0;

  // body 기준 absolute 좌표 계산
  const updatePanelPosition = useCallback(() => {
    if (
      !headerRef.current ||
      !bellRef.current ||
      !panelRef.current
    ) {
      return;
    }

    const headerRect =
      headerRef.current.getBoundingClientRect();

    const bellRect =
      bellRef.current.getBoundingClientRect();

    const panelWidth =
      panelRef.current.getBoundingClientRect().width;

    // 벨 오른쪽 끝에 패널 오른쪽 끝 정렬
    // 좁은 화면에서는 화면 밖으로 나가지 않도록 보정
    const leftInViewport = Math.max(
      16,
      Math.min(
        bellRect.right - panelWidth,
        window.innerWidth - panelWidth - 16
      )
    );

    const nextPosition = {
      top: headerRect.bottom + window.scrollY + 8,
      left: leftInViewport + window.scrollX,
    };

    setPanelPosition((previous) => {
      if (
        previous?.top === nextPosition.top &&
        previous?.left === nextPosition.left
      ) {
        return previous;
      }

      return nextPosition;
    });
  }, []);

  // 열릴 때 위치 계산, 화면 크기·스크롤 변화 반영
  useLayoutEffect(() => {
    if (!isNotificationOpen) return;

    updatePanelPosition();

    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener(
      'scroll',
      updatePanelPosition,
      true
    );

    const observer = new ResizeObserver(
      updatePanelPosition
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    if (bellRef.current) {
      observer.observe(bellRef.current);
    }

    return () => {
      window.removeEventListener(
        'resize',
        updatePanelPosition
      );

      window.removeEventListener(
        'scroll',
        updatePanelPosition,
        true
      );

      observer.disconnect();
    };
  }, [isNotificationOpen, updatePanelPosition]);

  // 페이지 이동 또는 계정 변경 시 닫기
  useEffect(() => {
    setIsNotificationOpen(false);
    setPanelPosition(null);
  }, [location.pathname, user?.uid]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      setIsNotificationOpen(false);
      setPanelPosition(null);
      bellRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  const handleNotificationClick = (event) => {
    setPanelPosition(null);
    setIsNotificationOpen((previous) => !previous);
    onNotificationClick?.(event);
  };

  return (
    <>
      <header ref={headerRef} className="site-header">
        <div className="inner">
          <div className="header-left">
            <h1>
              <Link to="/" aria-label="웨이브 홈">
                <img
                  src={logo}
                  alt="wavve"
                  width="144"
                  height="40"
                />
              </Link>
            </h1>

            <ul aria-label="메인 메뉴">
              {mainMenu.map((menu) => (
                <li key={menu.id}>
                  <NavLink
                    to={menu.path}
                    className={({ isActive }) =>
                      [menu.path === '/retrov' && 'header-retrov-link', isActive && 'is-active']
                        .filter(Boolean).join(' ')
                    }
                  >
                    {menu.menu}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="header-right">
            <ul>
              <li>
                <button
                  ref={bellRef}
                  type="button"
                  className="header-notification-button"
                  aria-label={
                    unreadCount > 0
                      ? `알림, 읽지 않은 알림 ${unreadCount}개`
                      : '알림'
                  }
                  aria-expanded={isNotificationOpen}
                  aria-controls={panelId}
                  onClick={handleNotificationClick}
                >
                  <img
                    src={bellIcon}
                    alt=""
                    width="28"
                    height="28"
                  />

                  {isLoggedIn && unreadCount > 0 && (
                    <span
                      className="header-notification-badge"
                      aria-hidden="true"
                    >
                      {unreadCount > 99
                        ? '99+'
                        : unreadCount}
                    </span>
                  )}
                </button>
              </li>

              <li>
                <Link
                  to="/search"
                  aria-label="검색"
                  onClick={onSearchClick}
                >
                  <img
                    src={searchIcon}
                    alt=""
                    width="28"
                    height="28"
                  />
                </Link>
              </li>

              <li>
                <MyHover />
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* 헤더 내부가 아니라 body 아래에 렌더링 */}
      {isNotificationOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="header-notification-portal"
            style={{
              position: 'absolute',
              top: panelPosition?.top ?? 0,
              left: panelPosition?.left ?? 0,
              visibility: panelPosition
                ? 'visible'
                : 'hidden',
              zIndex: 1000,
            }}
          >
            <NotificationPanel
              id={panelId}
              isLoggedIn={isLoggedIn}
              notifications={
                isLoggedIn
                  ? notifications
                  : EMPTY_NOTIFICATIONS
              }
              onRead={(notificationId) =>
                onReadNotification(
                  user?.uid,
                  notificationId
                )
              }
              onReadAll={() =>
                onReadAllNotifications(user?.uid)
              }
            />
          </div>,
          document.body
        )}
    </>
  );
};