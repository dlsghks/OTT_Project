import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const ProfilePinModal = ({ error, onConfirm, onClose }) => {
  const dialogRef = useRef(null);
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(["", "", "", ""]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;

    dialog.showModal();
    inputsRef.current[0]?.focus();

    return () => {
      dialog.close();

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  const updateDigits = (index, text) => {
    const numbers = text.replace(/\D/g, "");
    const next = [...digits];

    if (!numbers) {
      next[index] = "";
      setDigits(next);
      return;
    }

    // 붙여넣기 또는 여러 자리 자동 입력 지원
    const start = numbers.length >= 4 ? 0 : index;

    numbers
      .slice(0, 4 - start)
      .split("")
      .forEach((number, offset) => {
        next[start + offset] = number;
      });

    setDigits(next);

    const nextIndex = Math.min(start + numbers.length, 3);
    inputsRef.current[nextIndex]?.focus();
  };

  const submit = (event) => {
    event.preventDefault();

    const value = digits.join("");
    if (!/^\d{4}$/.test(value)) return;

    onConfirm(value);
  };

  return createPortal(
    <dialog
      className="profile-pin-modal"
      ref={dialogRef}
      aria-labelledby="profile-pin-modal-title"
      aria-describedby="profile-pin-modal-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        className="profile-pin-modal__close"
        type="button"
        aria-label="비밀번호 입력 닫기"
        onClick={onClose}
      >
        <span aria-hidden="true">×</span>
      </button>

      <h2 id="profile-pin-modal-title">
        프로필 비밀번호 입력
      </h2>

      <p id="profile-pin-modal-description">
        설정하신 프로필 비밀번호 4자리를 입력해주세요.
      </p>

      <form onSubmit={submit}>
        <div className="profile-pin-modal__inputs">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              aria-label={`비밀번호 ${index + 1}번째 자리`}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "profile-pin-modal-error" : undefined
              }
              value={digit}
              onChange={(event) => {
                updateDigits(index, event.target.value);
              }}
              onPaste={(event) => {
                event.preventDefault();
                updateDigits(
                  index,
                  event.clipboardData.getData("text")
                );
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digit && index > 0) {
                  event.preventDefault();
                  const next = [...digits];
                  next[index - 1] = "";
                  setDigits(next);
                  inputsRef.current[index - 1]?.focus();
                }

                if (event.key === "ArrowLeft" && index > 0) {
                  event.preventDefault();
                  inputsRef.current[index - 1]?.focus();
                }

                if (event.key === "ArrowRight" && index < 3) {
                  event.preventDefault();
                  inputsRef.current[index + 1]?.focus();
                }
              }}
              onFocus={(event) => event.target.select()}
            />
          ))}
        </div>

        <p
          className="profile-pin-modal__error"
          id="profile-pin-modal-error"
          role="alert"
        >
          {error}
        </p>

        <button
          className="profile-pin-modal__confirm"
          type="submit"
          disabled={digits.some((digit) => digit === "")}
        >
          확인
        </button>
      </form>
    </dialog>,
    document.body
  );
};