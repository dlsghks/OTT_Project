
import { useEffect, useState } from "react";
import { ComingSoonCard } from "./ComingSoonCard";
import { ContentSection } from "./ContentSection";
import { LoginModal } from "../common/LoginModal";
import { useAuthState } from "../../hooks/useAuthState";
import "../../styles/components/home/ComingSoonCard.scss";

export const ComingSoonSection = ({
  title,
  items = [],
  ...props
}) => {
  const { user, isLoggedIn, loading } = useAuthState();

  const [loginOpen, setLoginOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [notice, setNotice] = useState("");

  const storageKey = user
    ? `wavve-coming-soon-favorites-${user.uid}`
    : null;

  useEffect(() => {
    if (!storageKey) {
      setFavorites([]);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      setFavorites(Array.isArray(saved) ? saved : []);
    } catch {
      setFavorites([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [notice]);

  const handleFavoriteClick = (item) => {
    if (loading) return;

    if (!isLoggedIn || !storageKey) {
      setLoginOpen(true);
      return;
    }

    const alreadyFavorite = favorites.includes(item.id);

    const updatedFavorites = alreadyFavorite
      ? favorites.filter((id) => id !== item.id)
      : [...favorites, item.id];

    setFavorites(updatedFavorites);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error("관심 프로그램 저장 실패:", error);
    }

    setNotice(
      alreadyFavorite
        ? "관심 프로그램 등록을 해제했어요."
        : "관심 프로그램으로 등록했어요."
    );
  };

  return (
    <>
      <ContentSection
        title={title}
        items={items}
        cardType="coming-soon"
        {...props}
        renderCard={(item) => (
          <ComingSoonCard
            item={item}
            isFavorite={favorites.includes(item.id)}
            onFavoriteClick={handleFavoriteClick}
          />
        )}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      {notice && (
        <div
          className="coming-soon-notice"
          role="status"
        >
          <p>{notice}</p>

          {notice === "관심 프로그램으로 등록했어요." && (
            <>
              <p>
                새로운 에피소드가 올라오면 모바일 앱
                PUSH 알림으로 알려드릴게요.
              </p>
              <p>
                모바일 앱 설치 및 PUSH 알림 등의
                여부를 꼭 확인해주세요!
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};
