import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import userIcon from "../../assets/myhover/user.svg";
import defaultProfile from "../../assets/myhover/profile.png";
import rightArrow from "../../assets/myhover/right-arrow.svg";
import "../../styles/components/member/MyHover.scss";

const PROFILE_KEY = "wavve-active-profile";

// 프로필 선택 페이지에서 저장한 이름과 이미지를 읽습니다.
const readSelectedProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");

    if (
      !saved ||
      typeof saved.name !== "string" ||
      typeof saved.image !== "string" ||
      !saved.name.trim() ||
      !saved.image.trim()
    ) {
      return null;
    }

    return {
      id: saved.id,
      name: saved.name,
      image: saved.image,
    };
  } catch {
    return null;
  }
};

export const MyHover = ({
  profileName = "프로필1",
  profileImage = defaultProfile,
  onAction,
  onLogout,
}) => {
  const [user, setUser] = useState(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(readSelectedProfile);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({
    top: 96,
    left: 16,
    maxHeight: 500,
  });

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const closeTimer = useRef(null);
  const logoutLock = useRef(false);

  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();

  const loggedIn = authReady && !!user;

  const displayedName = selectedProfile?.name || profileName;
  const displayedImage = loggedIn
    ? selectedProfile?.image || profileImage
    : defaultProfile;

  const isInside = (target) =>
    target instanceof Node &&
    (rootRef.current?.contains(target) ||
      panelRef.current?.contains(target));

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current);
  };

  const close = () => {
    cancelClose();
    setIsOpen(false);
    setMessage("");
  };

  const openOnHover = (event) => {
    if (event.pointerType === "touch") return;

    cancelClose();
    setSelectedProfile(readSelectedProfile());
    setIsOpen(true);
  };

  const closeLater = (event) => {
    if (event.pointerType === "touch") return;

    cancelClose();

    closeTimer.current = window.setTimeout(() => {
      if (!isInside(document.activeElement)) {
        setIsOpen(false);
        setMessage("");
      }
    }, 220);
  };

  const handleBlur = (event) => {
    if (!isInside(event.relatedTarget)) close();
  };

  // 로그인 상태 확인
  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  // 프로필 선택 후 홈으로 돌아오면 새 프로필을 반영합니다.
  useEffect(() => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(false);
    setMessage("");
    setSelectedProfile(readSelectedProfile());
  }, [location.key]);

  // 다른 탭에서 프로필을 변경하거나 창으로 돌아온 경우에도 반영합니다.
  useEffect(() => {
    const refreshProfile = () => {
      setSelectedProfile(readSelectedProfile());
    };

    const handleStorage = (event) => {
      if (event.key === PROFILE_KEY || event.key === null) {
        refreshProfile();
      }
    };

    window.addEventListener("focus", refreshProfile);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshProfile);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  // 메뉴 위치 계산
  useLayoutEffect(() => {
    if (!isOpen) return;

    const placePanel = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const header = trigger.closest("header");
      const width = Math.min(265, window.innerWidth - 32);

      const top = Math.max(
        8,
        header ? header.getBoundingClientRect().bottom : rect.bottom + 12
      );

      const left = Math.max(
        16,
        Math.min(rect.right - width, window.innerWidth - width - 16)
      );

      setPosition({
        top,
        left,
        maxHeight: Math.max(80, window.innerHeight - top - 16),
      });
    };

    placePanel();

    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(placePanel)
        : null;

    const header = triggerRef.current?.closest("header");

    if (header) observer?.observe(header);

    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
      observer?.disconnect();
    };
  }, [isOpen]);

  // 메뉴 바깥 클릭 / ESC 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        window.clearTimeout(closeTimer.current);
        setIsOpen(false);
        setMessage("");
      }
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      window.clearTimeout(closeTimer.current);
      setIsOpen(false);
      setMessage("");
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleAction = async (key, label) => {
    if (!authReady) return;

    if (!user) {
      close();
      navigate("/login");
      return;
    }

    if (!onAction) {
      setMessage(`${label} 기능은 준비 중입니다.`);
      return;
    }

    try {
      await onAction(key);
      close();
    } catch {
      setMessage("요청을 완료하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = async () => {
    if (logoutLock.current) return;

    logoutLock.current = true;
    setIsLoggingOut(true);
    setMessage("");

    try {
      if (onLogout) await onLogout();
      else await signOut(auth);

      close();
      navigate("/login", { replace: true });
    } catch {
      setMessage("로그아웃하지 못했습니다. 다시 시도해주세요.");
    } finally {
      logoutLock.current = false;
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className="my-hover"
      ref={rootRef}
      onPointerEnter={openOnHover}
      onPointerLeave={closeLater}
      onBlur={handleBlur}
    >
      <button
        className="my-hover__trigger"
        type="button"
        ref={triggerRef}
        aria-label="내 계정 메뉴"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          cancelClose();
          setSelectedProfile(readSelectedProfile());
          setIsOpen((open) => !open);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;

          event.preventDefault();
          setSelectedProfile(readSelectedProfile());
          setIsOpen(true);

          window.requestAnimationFrame(() => {
            panelRef.current
              ?.querySelector("a, button:not(:disabled)")
              ?.focus();
          });
        }}
      >
        {loggedIn ? (
          <img
            src={displayedImage}
            alt={`${displayedName} 프로필`}
            width="32"
            height="32"
            style={{
              position: "static",
              display: "block",
              width: "32px",
              height: "32px",
              maxWidth: "none",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <img src={userIcon} alt="" width="19.9" height="23.65" />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="my-hover__panel"
            id={panelId}
            ref={panelRef}
            style={{
              top: position.top,
              left: position.left,
              maxHeight: position.maxHeight,
            }}
            onPointerEnter={openOnHover}
            onPointerLeave={closeLater}
            onBlur={handleBlur}
            onFocus={cancelClose}
          >
            <div className="my-hover__profile">
              <img
                className="my-hover__avatar"
                src={displayedImage}
                alt=""
                width="65"
                height="65"
              />

              <div className="my-hover__account">
                <strong>
                  {!authReady
                    ? "확인 중…"
                    : loggedIn
                      ? displayedName
                      : "로그인"}
                </strong>

                {authReady && (
                  <Link
                    className="my-hover__switch"
                    to={loggedIn ? "/profileselect" : "/member"}
                    onClick={close}
                  >
                    <span>{loggedIn ? "프로필 전환" : "회원가입"}</span>
                    <img src={rightArrow} alt="" width="7" height="13" />
                  </Link>
                )}
              </div>
            </div>

            <div
              className="my-hover__links"
              role="navigation"
              aria-label="내 계정"
            >
              <Link
                to={loggedIn ? "/mypage" : "/login"}
                onClick={close}
                aria-disabled={!authReady}
                onClickCapture={(event) => {
                  if (!authReady) event.preventDefault();
                }}
              >
                MY
              </Link>

              <button
                type="button"
                disabled={!authReady}
                onClick={() => handleAction("pass", "이용권")}
              >
                이용권
              </button>

              <button
                type="button"
                disabled={!authReady}
                onClick={() => handleAction("coin", "코인")}
              >
                코인
              </button>

              <button
                type="button"
                disabled={!authReady}
                onClick={() => handleAction("coupon", "쿠폰 등록")}
              >
                쿠폰 등록
              </button>

              <Link to="/notice" onClick={close}>
                고객센터
              </Link>

              {!authReady ? (
                <span className="my-hover__pending">확인 중…</span>
              ) : loggedIn ? (
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
                </button>
              ) : (
                <Link to="/login" onClick={close}>
                  로그인
                </Link>
              )}
            </div>

            {message && (
              <p className="my-hover__message" role="status">
                {message}
              </p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default MyHover;