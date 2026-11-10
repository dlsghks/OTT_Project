import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ProfilePinModal } from "../../components/common/ProfilePinModal";
import { useAccountStore, chooseProfile, verifyProfilePin, MAX_PROFILES } from "../../store/useAccountStore";
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

  if (!user) return <p role="status">로그인 후 프로필을 선택해주세요. <Link to="/login">로그인</Link></p>;

  return (
    <main className="profile-select">
      <Link className="profile-select__logo" to="/" aria-label="웨이브 홈"><img src={logo} alt="wavve" /></Link>
      <section className="profile-select__content" aria-labelledby="profile-select-title" aria-busy={busy}>
        <h1 id="profile-select-title">사용자 변경</h1>
        <p className="profile-select__description">시청할 프로필을 선택하세요.</p>
        <ul className="profile-select__list">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button className="profile-select__profile" type="button" disabled={busy}
                aria-label={`${profile.name}${profile.locked ? " · 잠김" : ""}`}
                onClick={() => selectProfile(profile)}>
                <span className={`profile-select__avatar${profile.locked ? " profile-select__avatar--locked" : ""}`}>
                  <img src={profile.image} alt="" />
                  {profile.locked && <span className="profile-select__lock-overlay" aria-hidden="true"><img src={lockIcon} alt="" /></span>}
                </span>
                <span className="profile-select__name">{profile.name}</span>
              </button>
            </li>
          ))}
          {profiles.length < MAX_PROFILES && (
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
        {pendingProfile && <ProfilePinModal key={pendingProfile.id} error={pinError} onConfirm={verifyPin} onClose={cancelPin} />}
        <p className="profile-select__notice">• 이용권 유/무에 상관없이 프로필을 최대 {MAX_PROFILES}개까지 만들 수 있어요.</p>
        {busy && <p role="status">프로필을 확인하고 있어요.</p>}
        {message && <p className="profile-select__message" role="alert">{message}</p>}
      </section>
    </main>
  );
};

export default ProfileSelect;
