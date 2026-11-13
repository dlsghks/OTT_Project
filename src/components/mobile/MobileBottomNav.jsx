import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LoginModal } from "../common/LoginModal";
import { useProfileShorts } from "../../utils/profileShorts";
import fallbackProfile from "../../assets/mypage/profile.png";
import { Link, useLocation } from "react-router-dom";
import homeIcon from "../../assets/mobile/3fbab.svg";
import liveIcon from "../../assets/mobile/c81c7.svg";
import shortsIcon from "../../assets/mobile/8fc13.svg";
import searchIcon from "../../assets/mobile/44c9a.svg";
import "../../styles/components/mobile/MobileBottomNav.scss";

const menus = [
  { key: "home", label: "홈", to: "/", icon: homeIcon },
  { key: "live", label: "라이브", to: "/live", icon: liveIcon },
  { key: "shorts", label: "쇼츠", to: "/shorts", icon: shortsIcon },
  { key: "search", label: "검색", to: "/search", icon: searchIcon },
  { key: "my", label: "MY", to: "/mypage" },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const [loginOpen, setLoginOpen] = useState(false);
  const { profile } = useProfileShorts();
  const profileImage = profile?.image || `${import.meta.env.BASE_URL}images/profiles/profile1.png`;
  const activeKey = /^\/(live|livechannel|schedule)(\/|$)/.test(pathname) ? "live"
    : /^\/shorts(\/|$)/.test(pathname) ? "shorts"
    : /^\/search(\/|$)/.test(pathname) ? "search"
    : /^\/(mypage|profileselect|profileedit|login|member)(\/|$)/.test(pathname) ? "my"
    : "home";

  return (
    <>
      <div className="wavve-mobile-nav-space" aria-hidden="true" />
      <nav className="wavve-mobile-nav" aria-label="모바일 하단 메뉴">
        <ul className="wavve-mobile-nav__list">
          {menus.map((menu) => (
            <li key={menu.key}>
              <Link to={menu.to}
                onClick={(event) => {
                  if (menu.key !== "my" || user) return;
                  event.preventDefault();
                  setLoginOpen(true);
                }}
                className={`wavve-mobile-nav__link${activeKey === menu.key ? " is-active" : ""}`}
                aria-current={activeKey === menu.key ? "page" : undefined}>
                <span className={`wavve-mobile-nav__icon wavve-mobile-nav__icon--${menu.key}`} aria-hidden="true">
                  {menu.key === 'my' ? (
                    <img className="wavve-mobile-nav__profile" src={profileImage} alt=""
                      width="20" height="20"
                      onError={(event) => {
                        if (event.currentTarget.getAttribute('src') !== fallbackProfile) {
                          event.currentTarget.src = fallbackProfile;
                        }
                      }} />
                  ) : (
                    <img className="wavve-mobile-nav__glyph" src={menu.icon} alt="" width="20" height="20" />
                  )}
                </span>
                <span className="wavve-mobile-nav__label">{menu.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {loginOpen && !user && createPortal(
        <LoginModal isOpen onClose={() => setLoginOpen(false)} returnTo="/mypage" />,
        document.body
      )}
    </>
  );
};

export default MobileBottomNav;
