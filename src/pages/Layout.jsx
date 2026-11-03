
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TopButton } from "../components/TopButton";
import { ScrollToTop } from "../components/ScrollToTop";

import "../styles/layout/PageInner.scss";

export const Layout = () => {
  const { pathname } = useLocation();

  // Shorts 페이지 여부 확인
  const isShorts = pathname.replace(/\/$/, "") === "/shorts";

  // Shorts 페이지에서는 전체 스크롤 차단
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
      {/* 페이지 이동 시 스크롤 최상단 */}
      <ScrollToTop />

      {/* 공통 헤더 */}
      <Header />

      {/* 페이지 콘텐츠 */}
      <main className="site-inner">
        <Outlet />
      </main>

      {/* Shorts 페이지에서는 Footer, TopButton 숨김 */}
      {!isShorts && <Footer />}
      {!isShorts && <TopButton />}
    </>
  );
};
