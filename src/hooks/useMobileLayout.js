import { useSyncExternalStore } from "react";

// 모바일 레이아웃 기준 (헤더 · 하단 메뉴와 같은 1024px)
const QUERY = "(max-width: 1024px)";

const subscribe = (onChange) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

export const useMobileLayout = () => useSyncExternalStore(subscribe, getSnapshot);
