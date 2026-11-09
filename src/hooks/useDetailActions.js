import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getImagePath } from '../utils/imagePath';
import { useAuthStore } from '../store/useAuthStore';
import {
  useProfileFavorites,
  saveContentFavorite,
} from '../utils/profileFavorites';

// 상세 페이지 공통 버튼 동작: 로그인 · 관심 · 공유
export const useDetailActions = (item) => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const { favorites, profileId, ownerId } = useProfileFavorites();

  const [loginOpen, setLoginOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [likeError, setLikeError] = useState('');

  const busyRef = useRef(false);

  const isLiked = Boolean(
    item && favorites.some((saved) => saved.id === item.id)
  );

  const onLogin = () => setLoginOpen(true);
  const onCloseLogin = () => setLoginOpen(false);

  const onLike = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    if (!item || busyRef.current) return;

    busyRef.current = true;
    setLikeBusy(true);
    setLikeError('');

    try {
      await saveContentFavorite(
        profileId,
        {
          ...item,
          image: getImagePath(item.image),
          to: pathname,
        },
        ownerId
      );
    } catch {
      setLikeError(
        '관심 콘텐츠를 저장하지 못했어요. 연결을 확인하고 다시 시도해주세요.'
      );
    } finally {
      busyRef.current = false;
      setLikeBusy(false);
    }
  };

  const onShare = async (title) => {
    const onShare = () => setShareOpen(true);
    const onCloseShare = () => setShareOpen(false);
  };

  return {
    historyItem: item ? { ...item, image: getImagePath(item.image), to: pathname } : null,
    user,
    isLiked,
    likeBusy,
    likeError,
    loginOpen,
    onLogin,
    onCloseLogin,
    onLike,
    onShare,
  };
};