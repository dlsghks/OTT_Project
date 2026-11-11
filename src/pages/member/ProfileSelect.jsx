import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ProfilePinModal } from "../../components/common/ProfilePinModal";
import { useAccountStore, chooseProfile, removeProfile, verifyProfilePin, MAX_PROFILES } from "../../store/useAccountStore";
import { useAuthStore } from "../../store/useAuthStore";
import lockIcon from "../../assets/lock.png";
import logo from "../../assets/wavve_logo_w.svg";
import "../../styles/pages/member/ProfileSelect.scss";

export const ProfileSelect = () => {
  const location = useLocation();

  const requestedPath = location.state?.returnTo;

  const returnTo =
    typeof requestedPath === 'string' &&
      requestedPath.startsWith('/') &&
      !requestedPath.startsWith('//')
      ? requestedPath
      : '/';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profiles = useAccountStore((state) => state.profiles);
  const currentProfileId = useAccountStore((state) => state.currentProfileId);
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePin, setDeletePin] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");
  const deleteDialogRef = useRef(null);
  const [message, setMessage] = useState("");
  const [pendingProfile, setPendingProfile] = useState(null);
  const [pinError, setPinError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const enterProfile = async (profile) => {
  await chooseProfile(profile.id, user.uid);

  if (useAuthStore.getState().user?.uid === user.uid) {
    navigate(returnTo, { replace: true });
  }
};

  const selectProfile = async (profile) => {
    if (busyRef.current || !user) return;
    setMessage("");
    setPinError("");
    const latest = useAccountStore.getState().profiles.find((p) => p.id === profile.id);
    if (!latest) return;
    if (latest.locked) {
      setPendingProfile(latest);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try { await enterProfile(latest); }
    catch { setMessage("프로필을 저장하지 못했어요. 연결을 확인하고 다시 시도해주세요."); }
    finally { busyRef.current = false; setBusy(false); }
  };

  const verifyPin = async (enteredPin) => {
    if (!pendingProfile || !user || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setPinError("");
    try {
      if (!(await verifyProfilePin(pendingProfile.id, enteredPin, user.uid))) {
        setPinError("비밀번호가 맞지 않아요. 다시 입력해주세요.");
        return;
      }
      await enterProfile(pendingProfile);
    } catch {
      setPinError("프로필을 확인하지 못했어요. 연결을 확인하고 다시 시도해주세요.");
    } finally { busyRef.current = false; setBusy(false); }
  };

  const cancelPin = () => {
    if (busyRef.current) return;
    setPendingProfile(null);
    setPinError("");
  };

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (deleteTarget && dialog && !dialog.open) dialog.showModal();
  }, [deleteTarget]);

  const requestDelete = (profile) => {
    setMessage("");
    setDeleteNotice("");
    setDeletePin("");
    setDeleteError("");
    setDeleteTarget(profile);
  };

  const confirmDelete = async (event) => {
    event.preventDefault();
    if (busyRef.current || !deleteTarget || !user) return;
    busyRef.current = true;
    setBusy(true);
    setDeleteError("");
    try {
      await removeProfile(deleteTarget.id, deletePin, user.uid);
      deleteDialogRef.current?.close();
      setDeleteNotice("프로필을 삭제했어요.");
    } catch (error) {
      setDeleteError(error.message || "프로필을 삭제하지 못했어요. 다시 시도해주세요.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (!user) return <p role="status">로그인 후 프로필을 선택해주세요. <Link to="/login">로그인</Link></p>;

  return (
    <main className="profile-select">
      <Link className="profile-select__logo" to="/" aria-label="웨이브 홈"><img src={logo} alt="wavve" /></Link>
      <section className="profile-select__content" aria-labelledby="profile-select-title" aria-busy={busy}>
        <h1 id="profile-select-title">사용자 변경</h1>
        <p className="profile-select__description">
          {editing ? "삭제할 프로필을 선택하세요. 프로필은 하나 이상 남겨야 해요." : "시청할 프로필을 선택하세요."}
        </p>
        <button
          className="profile-select__edit"
          type="button"
          disabled={busy}
          aria-pressed={editing}
          onClick={() => { setEditing((value) => !value); setMessage(""); setDeleteNotice(""); }}
        >
          {editing ? "편집 완료" : "프로필 편집"}
        </button>
        <ul className="profile-select__list">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button className="profile-select__profile" type="button" disabled={busy || editing}
                aria-current={profile.id === currentProfileId ? "true" : undefined}
                aria-label={`${profile.name}${profile.locked ? " · 잠김" : ""}`}
                onClick={() => selectProfile(profile)}>
                <span className={`profile-select__avatar${profile.locked ? " profile-select__avatar--locked" : ""}`}>
                  <img src={profile.image} alt="" />
                  {profile.locked && <span className="profile-select__lock-overlay" aria-hidden="true"><img src={lockIcon} alt="" /></span>}
                </span>
                <span className="profile-select__name">
                  {profile.name}
                  {profile.id === currentProfileId && (
                    <span className="profile-select__current">현재 프로필</span>
                  )}
                </span>
              </button>
              {editing && profiles.length > 1 && (
                <button
                  className="profile-select__remove"
                  type="button"
                  disabled={busy}
                  aria-label={`${profile.name} 프로필 삭제`}
                  onClick={() => requestDelete(profile)}
                >
                  삭제
                </button>
              )}
            </li>
          ))}
          {!editing && profiles.length < MAX_PROFILES && (
            <li>
              <button
                className="profile-select__profile"
                type="button"
                disabled={busy}
                onClick={() => navigate("/profileadd")}
              >
                <span className="profile-select__avatar profile-select__avatar--add">
                  <Plus aria-hidden="true" />
                </span>
                <span className="profile-select__name">프로필 추가</span>
              </button>
            </li>
          )}
        </ul>
        <dialog
          className="profile-pin-modal profile-select__delete-dialog"
          ref={deleteDialogRef}
          aria-labelledby="profile-delete-title"
          aria-describedby="profile-delete-description"
          onClose={() => { setDeleteTarget(null); setDeletePin(""); }}
          onCancel={(event) => { if (busyRef.current) event.preventDefault(); }}
        >
          {deleteTarget && (
            <>
              <h2 id="profile-delete-title">프로필을 삭제할까요?</h2>
              <p id="profile-delete-description">
                {deleteTarget.name} 프로필의 시청 기록, 관심 콘텐츠, 코인과 쿠폰이 함께 삭제되며 복구할 수 없어요.
              </p>
              <form onSubmit={confirmDelete} aria-busy={busy}>
                {deleteTarget.locked && (
                  <label>
                    프로필 PIN
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      autoComplete="off"
                      value={deletePin}
                      onChange={(event) => setDeletePin(event.target.value)}
                      required
                    />
                  </label>
                )}
                {deleteError && <p className="profile-select__message" role="alert">{deleteError}</p>}
                <div className="profile-select__delete-actions">
                  <button type="button" disabled={busy} onClick={() => deleteDialogRef.current?.close()} autoFocus>취소</button>
                  <button type="submit" disabled={busy}>{busy ? "삭제 중…" : "삭제하기"}</button>
                </div>
              </form>
            </>
          )}
        </dialog>
        {pendingProfile && <ProfilePinModal key={pendingProfile.id} error={pinError} onConfirm={verifyPin} onClose={cancelPin} />}
        <p className="profile-select__notice">• 이용권 유/무에 상관없이 프로필을 최대 {MAX_PROFILES}개까지 만들 수 있어요.</p>
        {busy && <p role="status">프로필을 확인하고 있어요.</p>}
        {deleteNotice && <p role="status">{deleteNotice}</p>}
        {message && <p className="profile-select__message" role="alert">{message}</p>}
      </section>
    </main>
  );
};

export default ProfileSelect;
