import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TopButton } from "../components/TopButton";
import { ScrollToTop } from "../components/ScrollToTop";

import {
  MobileHeader,
  MobileFooter,
  MobileBottomNav,
} from "../components/mobile";

import "../styles/layout/PageInner.scss";
import "../styles/components/MobileChrome.scss";

export const Layout = () => {
  const { pathname } = useLocation();

  const isShorts = pathname.replace(/\/+$/, "") === "/shorts";

  // 숏츠에서는 영상 피드 내부만 스크롤
  useEffect(() => {
    if (!isShorts) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isShorts]);

  return (
    <>
      <ScrollToTop />

      {/* PC 헤더 */}
      <div className="mobile-chrome-desktop">
        <Header />
      </div>

      {/* 모바일 헤더 */}
      <MobileHeader />

      {/* 공통 본문 */}
      <main className="site-inner">
        <Outlet />
      </main>

      {/* 숏츠에서는 풋터 숨김 */}
      {!isShorts && (
        <>
          <div className="mobile-chrome-desktop">
            <Footer />
          </div>

          <MobileFooter />
          <TopButton />
        </>
      )}

      {/* 모바일 하단 고정 메뉴 */}
      <MobileBottomNav />
    </>
  );
};

export default Layout;