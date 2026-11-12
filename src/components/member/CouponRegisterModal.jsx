import { useId, useState } from "react";

import { WavveAccountModal } from "../common/WavveAccountModal";
import { normalizeCouponCode } from "../../utils/couponRecords";

const NOTES = [
  "쿠폰번호의 숫자 0과 영문 O, 숫자 1과 영문 I를 확인해 주세요.",
  "이미 등록했거나 유효기간이 지난 쿠폰은 사용할 수 없어요.",
  "쿠폰별 이용 조건과 적용 시점은 발급처 안내를 확인해 주세요.",
];

// 쿠폰 등록 팝업: onRegister(번호)가 false 면 번호 오류, 예외면 저장 실패로 표시
export function CouponRegisterModal({ onRegister, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputId = useId();
  const hintId = useId();
  const canSubmit = Boolean(code.trim()) && !busy;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError("");
    try {
      const result = await onRegister(normalizeCouponCode(code));
      if (result === "handled") return;
      if (result) setSuccess(true);
      else setError("쿠폰번호를 확인한 후 다시 입력해 주세요.");
    } catch {
      setError("쿠폰을 등록하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WavveAccountModal
      title="쿠폰 등록"
      busy={busy}
      success={success}
      successMessage="쿠폰이 등록되었어요"
      successLabel="보유 쿠폰 확인"
      onClose={onClose}
    >
      {() => (
        <form className="wam-body coupon-register" onSubmit={handleSubmit}>
          <div>
            <p className="coupon-register__title">쿠폰으로 더 즐거운 웨이브</p>
            <p className="coupon-register__desc">보유하신 쿠폰번호를 입력해 주세요.</p>
          </div>

          <div>
            <label className="coupon-register__label" htmlFor={inputId}>쿠폰번호</label>
            <input
              id={inputId}
              className={`wam-input${error ? " is-error" : ""}`}
              type="text"
              value={code}
              placeholder="쿠폰번호를 입력해 주세요"
              maxLength={30}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={hintId}
              onChange={(event) => {
                setCode(event.target.value);
                setError("");
              }}
            />
            <p id={hintId} className={`coupon-register__hint${error ? " is-error" : ""}`} role={error ? "alert" : undefined}>
              {error || "공백 없이 입력해 주세요."}
            </p>
          </div>

          <button type="submit" className={`wam-button${canSubmit ? " wam-button--primary" : ""}`} disabled={!canSubmit}>
            등록하기
          </button>

          <div className="coupon-register__notes">
            <p className="coupon-register__notes-title">등록 전 확인해 주세요</p>
            <ul>
              {NOTES.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        </form>
      )}
    </WavveAccountModal>
  );
}
