import { useState } from 'react';
import { useMovieStore } from '../store/useMovieStore';

// 상세 페이지 공통 버튼 동작 (로그인 · 관심 · 공유)
// - 로그인 전에는 관심 · 공유 버튼도 로그인 팝업을 연다
export const useDetailActions = () => {
  const user = useMovieStore((state) => state.user);
  const [isLiked, setIsLiked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const onLogin = () => setLoginOpen(true);
  const onCloseLogin = () => setLoginOpen(false);

  const onLike = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setIsLiked((prev) => !prev);
  };

  // 로그인 전에는 공유 버튼도 로그인 팝업 (레트로브 상세와 같은 동작)
  const onShare = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  };

  return { user, isLiked, loginOpen, onLogin, onCloseLogin, onLike, onShare };
};
