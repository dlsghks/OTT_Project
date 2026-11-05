import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccountStore, updateProfile, changeProfileLock } from "../../store/useAccountStore";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/wavve_logo_w.svg";
import "../../styles/pages/member/ProfileEdit.scss";

const profileImages = [1, 2, 3, 4].map(
  (number) =>
    `${import.meta.env.BASE_URL}images/profiles/profile${number}.png`
);

export const ProfileEdit = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAccountStore((state) => state.profiles.find(
    (p) => p.id === state.selectedProfileId
  ));
  if (!user) return <p role="status">로그인 후 프로필을 수정해주세요. <Link to="/login">로그인</Link></p>;
  return <ProfileEditForm key={`${user.uid}:${profile.id}`} profile={profile} ownerId={user.uid} />;
};

const ProfileEditForm = ({ profile, ownerId }) => {
  const navigate = useNavigate();
  const [savedProfile, setSavedProfile] = useState(profile);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [name, setName] = useState(savedProfile.name);
  const [image, setImage] = useState(savedProfile.image);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [message, setMessage] = useState("");

  const locked = profile.locked;

  // null: 닫힘 / setup: PIN 설정 / disable: 잠금 해제
  const [lockMode, setLockMode] = useState(null);
  const lockDialogRef = useRef(null);

  useEffect(() => {
    if (!lockMode) return;

    const previousFocus = document.activeElement;
    const dialog = lockDialogRef.current;

    dialog.showModal();

    return () => {
      dialog.close();

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [lockMode]);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const trimmedName = name.trim();
  const changed =
    trimmedName !== savedProfile.name || image !== savedProfile.image;

  const canSave = trimmedName.length > 0 && changed && !busy;

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!canSave || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const updatedProfile = { ...savedProfile, name: trimmedName, image };
    try {
      await updateProfile(savedProfile.id, trimmedName, image, ownerId);
      setSavedProfile(updatedProfile);
      setName(trimmedName);
      setImagePickerOpen(false);
      setMessage("프로필을 저장했어요.");
    } catch (error) {
      setMessage(error.message || "저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const openLockForm = () => {
    if (busyRef.current) return;
    setLockMode(locked ? "disable" : "setup");
    setPin("");
    setConfirmPin("");
    setPinError("");
    setMessage("");
  };

  const closeLockForm = () => {
    if (busyRef.current) return;
    setLockMode(null);
    setPin("");
    setConfirmPin("");
    setPinError("");
  };

  const saveLock = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    if (!/^\d{4}$/.test(pin)) {
      setPinError("숫자 4자리를 입력해주세요.");
      return;
    }
    if (lockMode === "setup" && pin !== confirmPin) {
      setPinError("PIN이 서로 달라요. 다시 확인해주세요.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await changeProfileLock(savedProfile.id, pin, lockMode, ownerId);
      setMessage(lockMode === "setup" ? "프로필 잠금을 설정했어요." : "프로필 잠금을 해제했어요.");
      setLockMode(null);
      setPin("");
      setConfirmPin("");
      setPinError("");
    } catch (error) {
      setPinError(error.message || "저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <main className="profile-edit">
      <Link className="profile-edit__logo" to="/" aria-label="웨이브 홈">
        <img src={logo} alt="wavve" />
      </Link>

      <section
        className="profile-edit__content"
        aria-labelledby="profile-edit-title"
      >
        <h1 id="profile-edit-title">프로필 설정</h1>

        <form onSubmit={saveProfile} aria-busy={busy}>
          <img className="profile-edit__avatar" src={image} alt="프로필" />

          <button
            className="profile-edit__change"
            type="button"
            aria-expanded={imagePickerOpen}
            aria-controls="profile-image-picker"
            onClick={() => setImagePickerOpen((open) => !open)}
          >
            프로필 이미지 변경 <span aria-hidden="true">›</span>
          </button>

          {imagePickerOpen && (
            <div
              className="profile-edit__images"
              id="profile-image-picker"
              role="group"
              aria-label="프로필 이미지 선택"
            >
              {profileImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`프로필 이미지 ${index + 1}`}
                  aria-pressed={image === src}
                  onClick={() => {
                    setImage(src);
                    setMessage("");
                  }}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="profile-edit__name-row">
            <input
              aria-label="프로필 이름"
              value={name}
              maxLength={12}
              placeholder="프로필 이름"
              onChange={(event) => {
                setName(event.target.value);
                setMessage("");
              }}
            />

            <button type="submit" disabled={!canSave}>
              저장
            </button>
          </div>

          <div className="profile-edit__lock">
            <span>프로필 잠금</span>

            <button
              type="button"
              role="switch"
              aria-checked={locked}
              aria-label="프로필 잠금"
              aria-expanded={lockMode !== null}
              aria-controls="profile-lock-form"
              disabled={busy}
              onClick={openLockForm}
            >
              <span />
            </button>
          </div>
        </form>

        {/* 이름 저장 폼과 분리한 PIN 설정 폼 */}
        {lockMode && (
          <dialog
            className="profile-edit-lock-modal"
            ref={lockDialogRef}
            id="profile-lock-form"
            aria-busy={busy}
            aria-labelledby="profile-lock-title"
            onCancel={(event) => {
              event.preventDefault();
              closeLockForm();
            }}
          >
            <button
              className="profile-edit-lock-modal__close"
              type="button"
              aria-label="프로필 잠금 창 닫기"
              disabled={busy}
              onClick={closeLockForm}
            >
              <span aria-hidden="true">×</span>
            </button>

            <h2 id="profile-lock-title">
              {lockMode === "setup"
                ? "프로필 잠금 설정"
                : "프로필 잠금 해제"}
            </h2>

            <p>
              {lockMode === "setup"
                ? "사용할 숫자 4자리 PIN을 입력해주세요."
                : "기존 PIN을 입력해주세요."}
            </p>

            <form onSubmit={saveLock}>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                aria-label={
                  lockMode === "setup" ? "새 PIN 4자리" : "기존 PIN 4자리"
                }
                placeholder="PIN 4자리"
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
                  setPinError("");
                }}
              />

              {lockMode === "setup" && (
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  aria-label="새 PIN 확인"
                  placeholder="PIN 다시 입력"
                  value={confirmPin}
                  onChange={(event) => {
                    setConfirmPin(
                      event.target.value.replace(/\D/g, "").slice(0, 4)
                    );
                    setPinError("");
                  }}
                />
              )}

              {pinError && (
                <p className="profile-edit-lock-modal__error" role="alert">
                  {pinError}
                </p>
              )}

              <div className="profile-edit-lock-modal__buttons">
                <button type="button" disabled={busy}
              onClick={closeLockForm}>
                  취소
                </button>

                <button type="submit" disabled={busy}>
                  {lockMode === "setup" ? "설정" : "잠금 해제"}
                </button>
              </div>
            </form>
          </dialog>
        )}

        {message && (
          <p className="profile-edit__message" role="status">
            {message}
          </p>
        )}

        <button
          className="profile-edit__exit"
          type="button"
          disabled={busy}
          onClick={() => navigate("/mypage")}
        >
          나가기
        </button>
      </section>
    </main>
  );
};

export default ProfileEdit;