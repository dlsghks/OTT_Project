import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import closeIcon from "../../assets/member-info/close.svg";
import closeMobileIcon from "../../assets/member-info/close-mobile.svg";
import successIcon from "../../assets/member-info/success.svg";
import "../../styles/common/WavveAccountModal.scss";

// 회원정보·쿠폰 등의 폼/완료 화면이 공유하는 모달 틀입니다.
export function WavveAccountModal({ title, busy = false, success = false, successMessage, onClose, children }) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = useId();
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, []);

  useEffect(() => {
    if (success) {
      dialogRef.current.scrollTop = 0;
      confirmRef.current?.focus({ preventScroll: true });
    }
  }, [success]);

  const close = () => { if (!busyRef.current) dialogRef.current?.close(); };
  return createPortal(
    <dialog ref={dialogRef} className={`wavve-account-modal${success ? " wavve-account-modal--success" : ""}`}
      aria-labelledby={titleId} onClose={onClose}
      onCancel={event => { if (busyRef.current) event.preventDefault(); }}>
      <header className="wam-header">
        <h2 id={titleId} className="wam-title">{title}</h2>
        <button type="button" className="wam-close" aria-label="닫기" disabled={busy} onClick={close}>
          <span className="wam-close-pc"><img src={closeIcon} alt="" /></span>
          <span className="wam-close-mobile"><img src={closeMobileIcon} alt="" /></span>
        </button>
      </header>
      {success ? (
        <div className="wam-complete">
          <div role="status" className="wam-complete-message">
            <div className="wam-mark"><span><img src={successIcon} alt="" /></span></div>
            <p>{successMessage}</p>
          </div>
          <button ref={confirmRef} type="button" className="wam-button wam-button--primary wam-confirm" onClick={close}>확인</button>
        </div>
      ) : children(close)}
    </dialog>, document.body
  );
}
