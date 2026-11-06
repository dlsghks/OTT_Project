import { Link, useLocation } from "react-router-dom";
import homeClip from "../../assets/mobile/f6aa3.svg";
import homeIcon from "../../assets/mobile/3fbab.svg";
import liveClip from "../../assets/mobile/5ba48.svg";
import liveIcon from "../../assets/mobile/c81c7.svg";
import shortsIcon from "../../assets/mobile/8fc13.svg";
import searchIcon from "../../assets/mobile/44c9a.svg";
import "../../styles/components/mobile/MobileBottomNav.scss";

const menus = [
  { key: "home", label: "홈", to: "/", icon: homeIcon, clip: homeClip },
  { key: "live", label: "라이브", to: "/live", icon: liveIcon, clip: liveClip },
  { key: "shorts", label: "쇼츠", to: "/shorts", icon: shortsIcon },
  { key: "search", label: "검색", to: "/search", icon: searchIcon },
  { key: "my", label: "MY", to: "/mypage" },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
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
                className={`wavve-mobile-nav__link${activeKey === menu.key ? " is-active" : ""}`}
                aria-current={activeKey === menu.key ? "page" : false}>
                <span className={`wavve-mobile-nav__icon wavve-mobile-nav__icon--${menu.key}`} aria-hidden="true"
                  style={menu.clip ? { maskImage: `url(${menu.clip})` } : undefined}>
                  {menu.icon && <span className="wavve-mobile-nav__glyph" style={{ maskImage: `url(${menu.icon})` }} />}
                </span>
                <span className="wavve-mobile-nav__label">{menu.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileBottomNav;
