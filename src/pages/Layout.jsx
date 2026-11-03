import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TopButton } from "../components/TopButton";
import "../styles/layout/PageInner.scss";

export const Layout = () => {
  const { pathname } = useLocation();
  const isShorts = pathname.replace(/\/$/, "") === "/shorts";

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
      <Header />

      <main className="site-inner">
        <Outlet />
      </main>

      {!isShorts && <Footer />}
      {!isShorts && <TopButton />}
    </>
  );
};