import { useState } from "react";
import { WavveAccountModal } from "../common/WavveAccountModal";
import kakaoIcon from "../../assets/share/kakao.svg";
import instagramIcon from "../../assets/share/instagram.png";
import threadsIcon from "../../assets/share/threads.png";
import xIcon from "../../assets/share/x.png";
import "../../styles/pages/member/SnsConnectionModal.scss";

const services = [
  { key: "kakao", name: "카카오", icon: kakaoIcon },
  { key: "instagram", name: "인스타그램", icon: instagramIcon },
  { key: "facebook", name: "페이스북" },
  { key: "threads", name: "스레드", icon: threadsIcon },
  { key: "x", name: "X", icon: xIcon },
];

const readConnections = (storageKey) => {
  try {
    const keys = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(keys) ? services.map(({ key }) => key).filter((key) => keys.includes(key)) : [];
  } catch {
    return [];
  }
};

export function SnsConnectionModal({ user, onClose }) {
  const storageKey = `ott:demo-sns:${encodeURIComponent(user.uid)}`;
  const [linkedKeys, setLinkedKeys] = useState(() => readConnections(storageKey));
  const [notice, setNotice] = useState(null);

  const changeConnection = (service, disconnect) => {
    const previous = readConnections(storageKey);
    const next = disconnect
      ? previous.filter((key) => key !== service.key)
      : [...new Set([...previous, service.key])];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setLinkedKeys(next);
      setNotice({ text: disconnect ? `${service.name} 가상 연동을 해제했어요.` : `${service.name} 가상 연동을 완료했어요.` });
    } catch {
      setNotice({ error: true, text: "이 브라우저에 연동 상태를 저장하지 못했어요." });
    }
  };

  return (
    <WavveAccountModal title="SNS 연결 관리" lockScroll={false} onClose={onClose}>
      {(close) => (
        <div className="wam-body sns-manager">
          <p className="sns-manager__account">아이디 <strong>{user.email || user.displayName || "웨이브 계정"}</strong></p>
          <ul className="sns-manager__list">
            {services.map((service) => {
              const linked = linkedKeys.includes(service.key);
              const action = linked ? "해제하기" : "연동하기";
              return (
                <li key={service.key}>
                  <span className={`sns-manager__icon sns-manager__icon--${service.key}`} aria-hidden="true">
                    {service.icon ? <img src={service.icon} alt="" /> : "f"}
                  </span>
                  <div className="sns-manager__service">
                    <strong>{service.name}</strong>
                    {linked && <span>가상 연동됨</span>}
                  </div>
                  <button
                    type="button"
                    className={`wam-button${linked ? "" : " wam-button--primary"}`}
                    aria-label={`${service.name} ${action}`}
                    onClick={() => changeConnection(service, linked)}
                  >
                    {action}
                  </button>
                </li>
              );
            })}
          </ul>
          {notice && <p className={notice.error ? "sns-manager__error" : ""} role={notice.error ? "alert" : "status"}>{notice.text}</p>}
          <button className="wam-button wam-button--primary" type="button" onClick={close}>확인</button>
          <p className="sns-manager__hint">가상 연동 상태는 이 브라우저에만 저장돼요.</p>
        </div>
      )}
    </WavveAccountModal>
  );
}
