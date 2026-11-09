import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { TopButton } from "../../components/layout/TopButton";
import { ScrollToTop } from "../../components/layout/ScrollToTop";

import {
  MobileHeader,
  MobileFooter,
  MobileBottomNav,
} from "../../components/mobile/index";

import "../../styles/layout/PageInner.scss";
import "../../styles/components/mobile/MobileChrome.scss";

export const Layout = () => {
  const { pathname } = useLocation();

  const isLogin = pathname.replace(/\/+$/, "") === "/login";

  const isShorts = ["/shorts", "/retrov/shorts"].includes(
    pathname.replace(/\/+$/, "")
  );

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
      <main className={`site-inner${isLogin ? " login-route" : ""}`}>
        <Outlet />
      </main>

      {/* 숏츠에서는 풋터 숨김 */}
      {!isShorts && (
        <>
          <div className="mobile-chrome-desktop">
            <Footer />
            <TopButton />
          </div>

          <MobileFooter />
        </>
      )}

      {/* 모바일 하단 고정 메뉴 */}
      <MobileBottomNav />
    </>
  );
};

export default Layout;