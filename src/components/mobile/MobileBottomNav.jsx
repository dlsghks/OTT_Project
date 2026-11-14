import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LoginModal } from "../common/LoginModal";
import { useProfileShorts } from "../../utils/profileShorts";
import fallbackProfile from "../../assets/mypage/profile.png";
import { Link, useLocation } from "react-router-dom";
import "../../styles/components/mobile/MobileBottomNav.scss";

// 기존 아이콘 모양을 유지하며 외부 이미지/필터 없이 직접 렌더링합니다.
const navIcons = {
  home: { viewBox: "0 0 15 15.6106", paths: [
    "M15 14.7773C15 14.9983 14.9122 15.2102 14.7559 15.3665C14.5997 15.5228 14.3877 15.6106 14.1667 15.6106H0.833333C0.612317 15.6106 0.400359 15.5228 0.244075 15.3665C0.0878003 15.2102 2.17072e-07 14.9983 2.17072e-07 14.7773V6.01891C-9.14496e-05 5.89192 0.0288503 5.76659 0.0846003 5.65249C0.140342 5.53839 0.221433 5.43855 0.321667 5.36057L6.98833 0.175575C7.13458 0.0617834 7.31467 0 7.5 0C7.68533 0 7.86542 0.0617834 8.01167 0.175575L14.6783 5.36057C14.7786 5.43855 14.8597 5.53839 14.9154 5.65249C14.9712 5.76659 15.0001 5.89192 15 6.01891V14.7773ZM13.3333 13.9439V6.42557L7.5 1.88891L1.66667 6.42557V13.9439H13.3333Z",
  ] },
  live: { viewBox: "0 0 15.8329 11.6676", paths: [
    "M2.7906 0.685608C0.252292 5.07166 1.51074 8.79708 2.78908 10.9797L2.22158 11.3232L1.65483 11.6674C0.229575 9.23399 -1.21613 4.95983 1.65255 0.00325012L2.7906 0.685608Z",
    "M5.335 2.95882C3.7991 5.40841 4.55304 7.46732 5.33273 8.68941L4.22427 9.42116C3.27926 7.93991 2.30853 5.28799 4.22199 2.23632L5.335 2.95882Z",
    "M14.1785 0C15.6037 2.43342 17.0488 6.70758 14.18 11.6642L13.042 10.9826C15.5805 6.59649 14.3218 2.8712 13.0435 0.688533L14.1785 0Z",
    "M11.5697 2.23958C12.5147 3.72076 13.4862 6.37274 11.5728 9.42441L10.459 8.70191C11.9949 6.25241 11.2417 4.19341 10.462 2.97134L11.5697 2.23958Z",
    "M7.87825 7.19741C8.64633 7.19741 9.26892 6.56391 9.26892 5.78249C9.26892 5.00116 8.64633 4.36766 7.87825 4.36766C7.11025 4.36766 6.48767 5.00116 6.48767 5.78249C6.48767 6.56391 7.11025 7.19741 7.87825 7.19741Z",
  ] },
  shorts: { viewBox: "0 0 20 20", paths: [
    "M15.4502 7.50023L7.40017 2.88356C6.96458 2.63203 6.47018 2.50026 5.96718 2.50164C5.46417 2.50302 4.97049 2.6375 4.53628 2.89143C4.10208 3.14535 3.74281 3.50967 3.49497 3.94738C3.24713 4.38508 3.11954 4.88058 3.12517 5.38356V14.6503C3.12517 15.4061 3.42544 16.131 3.95993 16.6655C4.4944 17.1999 5.21931 17.5003 5.97517 17.5003C6.47554 17.4994 6.96692 17.3672 7.40017 17.1169L15.4502 12.5003C15.8827 12.2499 16.2418 11.8902 16.4915 11.4573C16.7412 11.0243 16.8726 10.5333 16.8726 10.0336C16.8726 9.53375 16.7412 9.04283 16.4915 8.60983C16.2418 8.17692 15.8827 7.81723 15.4502 7.56689V7.50023ZM14.6168 10.9919L6.56684 15.6753C6.38642 15.7775 6.18257 15.8313 5.97517 15.8313C5.76779 15.8313 5.56394 15.7775 5.38351 15.6753C5.20359 15.5713 5.05419 15.4219 4.95033 15.242C4.84647 15.0621 4.79181 14.858 4.79184 14.6503V5.35023C4.79181 5.14248 4.84647 4.93838 4.95033 4.75844C5.05419 4.57852 5.20359 4.4291 5.38351 4.32523C5.56468 4.22453 5.76792 4.17013 5.97517 4.16689C6.18229 4.17114 6.38529 4.22547 6.56684 4.32523L14.6168 8.97525C14.7968 9.07908 14.9463 9.22842 15.0503 9.40842C15.1542 9.58833 15.2088 9.79242 15.2088 10.0003C15.2088 10.208 15.1542 10.4122 15.0503 10.5921C14.9463 10.772 14.7968 10.9214 14.6168 11.0253V10.9919Z",
  ] },
  search: { viewBox: "0 0 20 20", paths: [
    "M8.73283 3.33333C6.06482 3.33333 3.90196 5.57191 3.90196 8.33333C3.90196 11.0948 6.06482 13.3333 8.73283 13.3333C11.4008 13.3333 13.5638 11.0948 13.5638 8.33333C13.5638 5.57191 11.4008 3.33333 8.73283 3.33333ZM2.29167 8.33333C2.29167 4.65143 5.17548 1.66667 8.73283 1.66667C12.2902 1.66667 15.174 4.65143 15.174 8.33333C15.174 12.0152 12.2902 15 8.73283 15C5.17548 15 2.29167 12.0152 2.29167 8.33333Z",
    "M12.1893 11.9107C12.5037 11.5853 13.0135 11.5853 13.3279 11.9107L18.1588 16.9107C18.4733 17.2362 18.4733 17.7638 18.1588 18.0892C17.8443 18.4147 17.3346 18.4147 17.0202 18.0892L12.1893 13.0892C11.8748 12.7638 11.8748 12.2362 12.1893 11.9107Z",
  ] },
};

const menus = [
  { key: "home", label: "홈", to: "/", icon: "home" },
  { key: "live", label: "라이브", to: "/live", icon: "live" },
  { key: "shorts", label: "쇼츠", to: "/shorts", icon: "shorts" },
  { key: "search", label: "검색", to: "/search", icon: "search" },
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
                    <svg className="wavve-mobile-nav__glyph" viewBox={navIcons[menu.icon].viewBox}
                      width="20" height="20" fill="currentColor" focusable="false">
                      {navIcons[menu.icon].paths.map((path, index) => (
                        <path key={index} d={path} fillRule={menu.key === "search" ? "evenodd" : "nonzero"} clipRule="evenodd" />
                      ))}
                    </svg>
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
