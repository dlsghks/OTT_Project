import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    console.log("페이지 이동:", pathname);
    console.log("스크롤 초기화:", window.scrollY);
  }, [pathname]);

  return null;
};