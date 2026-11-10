import { useRef, useState } from "react";
import {
  FacebookAuthProvider, linkWithPopup, OAuthProvider, reload, TwitterAuthProvider, unlink,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { WavveAccountModal } from "../common/WavveAccountModal";
import { getSocialLoginError } from "../../utils/socialLoginError";
import kakaoIcon from "../../assets/login/kakao.svg";
import instagramIcon from "../../assets/share/instagram.png";
import threadsIcon from "../../assets/share/threads.png";
import xIcon from "../../assets/share/x.png";
import "../../styles/pages/member/SnsConnectionModal.scss";

const services = [
  { key: "kakao", name: "카카오", icon: kakaoIcon, provider: new OAuthProvider("oidc.kakao") },
  { key: "instagram", name: "인스타그램", icon: instagramIcon },
  { key: "facebook", name: "페이스북", provider: new FacebookAuthProvider() },
  { key: "threads", name: "스레드", icon: threadsIcon },
  { key: "x", name: "X", icon: xIcon, provider: new TwitterAuthProvider() },
];

const loginProviderIds = new Set(["password", "google.com", "oidc.kakao"]);
const getProviderIds = (user) => user.providerData.map(({ providerId }) => providerId);

const connectionErrors = {
  "auth/operation-not-allowed": "이 SNS는 프로젝트에서 아직 연결이 활성화되지 않았어요.",
  "auth/invalid-provider-id": "이 SNS는 프로젝트에서 아직 연결이 활성화되지 않았어요.",
  "auth/credential-already-in-use": "이미 다른 웨이브 계정에 연결된 SNS예요.",
  "auth/account-exists-with-different-credential": "이미 다른 웨이브 계정에서 사용 중인 SNS예요.",
  "auth/provider-already-linked": "이미 연결된 SNS예요.",
  "auth/requires-recent-login": "다시 로그인한 뒤 SNS 연결을 관리해주세요.",
};

export function SnsConnectionModal({ user, onClose }) {
  const [linkedIds, setLinkedIds] = useState(() => getProviderIds(user));
  const [busyKey, setBusyKey] = useState("");
  const [notice, setNotice] = useState(null);
  const pending = useRef(false);

  const changeConnection = async (service, disconnect) => {
    if (pending.current || !service.provider) return;
    const currentUser = auth.currentUser;
    if (currentUser?.uid !== user.uid) {
      setNotice({ error: true, text: "로그인 계정이 변경됐어요. 다시 열어주세요." });
      return;
    }

    pending.current = true;
    setBusyKey(service.key);
    setNotice(null);
    try {
      const { providerId } = service.provider;
      if (disconnect) {
        await reload(currentUser);
        if (auth.currentUser?.uid !== user.uid) return;
        const latestIds = getProviderIds(currentUser);
        setLinkedIds(latestIds);
        if (!latestIds.includes(providerId)) return;
        // 회원이 현재 로그인 화면에서 다시 로그인할 수 있는 방법을 유지합니다.
        if (!latestIds.some((id) => id !== providerId && loginProviderIds.has(id))) {
          setNotice({ error: true, text: "연결을 해제하기 전에 다시 로그인할 수 있는 다른 방법이 필요해요." });
          return;
        }
        await unlink(currentUser, providerId);
      } else {
        await linkWithPopup(currentUser, service.provider);
      }
      if (auth.currentUser?.uid !== user.uid) return;
      setLinkedIds(getProviderIds(auth.currentUser));
      setNotice({ text: disconnect ? `${service.name} 연결을 해제했어요.` : `${service.name} 연결을 완료했어요.` });
    } catch (error) {
      if (auth.currentUser?.uid !== user.uid || error.code === "auth/popup-closed-by-user") return;
      setLinkedIds(getProviderIds(auth.currentUser));
      const text = connectionErrors[error.code] ??
        (disconnect ? "연결을 해제하지 못했어요. 다시 시도해주세요." : getSocialLoginError(error));
      if (text) setNotice({ error: true, text });
    } finally {
      pending.current = false;
      setBusyKey("");
    }
  };

  return (
    <WavveAccountModal title="SNS 연결 관리" busy={Boolean(busyKey)} lockScroll={false} onClose={onClose}>
      {(close) => (
        <div className="wam-body sns-manager" aria-busy={Boolean(busyKey)}>
          <p className="sns-manager__account">아이디 <strong>{user.email || user.displayName || "웨이브 계정"}</strong></p>
          <ul className="sns-manager__list">
            {services.map((service) => {
              const linked = linkedIds.includes(service.provider?.providerId);
              const action = linked ? "해제하기" : "연동하기";
              return (
                <li key={service.key}>
                  <span className={`sns-manager__icon sns-manager__icon--${service.key}`} aria-hidden="true">
                    {service.icon ? <img src={service.icon} alt="" /> : "f"}
                  </span>
                  <div className="sns-manager__service">
                    <strong>{service.name}</strong>
                    {linked && <span>연동됨</span>}
                    {!service.provider && <span>연동 준비 중</span>}
                  </div>
                  <button
                    type="button"
                    className={`wam-button${linked ? "" : " wam-button--primary"}`}
                    aria-label={`${service.name} ${action}`}
                    disabled={!service.provider || Boolean(busyKey)}
                    onClick={() => changeConnection(service, linked)}
                  >
                    {busyKey === service.key ? "처리 중…" : action}
                  </button>
                </li>
              );
            })}
          </ul>
          {notice && <p className={notice.error ? "sns-manager__error" : ""} role={notice.error ? "alert" : "status"}>{notice.text}</p>}
          <button className="wam-button wam-button--primary" type="button" onClick={close} disabled={Boolean(busyKey)}>확인</button>
          <p className="sns-manager__hint">연결을 해제하면 해당 SNS로 이 계정에 로그인할 수 없어요.</p>
        </div>
      )}
    </WavveAccountModal>
  );
}
