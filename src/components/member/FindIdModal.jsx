import { useId, useRef, useState } from "react";
import { WavveAccountModal } from "../common/WavveAccountModal";

import kakaoIcon from "../../assets/login/kakao.png";
import naverIcon from "../../assets/login/naver.png";
import appleIcon from "../../assets/login/apple.png";

import "../../styles/pages/member/FindIdModal.scss";

const socialProviders = [
  { key: "kakao", name: "카카오", icon: kakaoIcon },
  { key: "t", name: "T아이디", text: "T" },
  { key: "naver", name: "네이버", icon: naverIcon },
  { key: "facebook", name: "Facebook", text: "f" },
  { key: "apple", name: "Apple", icon: appleIcon },
];

export function FindIdModal({
  onClose,
  onFindId,
  onPhoneVerify,
  onSocialLogin,
}) {
  const fieldId = useId();
  const busyRef = useRef(false);

  const [tab, setTab] = useState("simple");
  const [method, setMethod] = useState("phone");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setMessage("");
  };

  const changeMethod = (nextMethod) => {
    setMethod(nextMethod);
    setContact("");
    setMessage("");
  };

  const runAction = async (action, fallback) => {
    if (busyRef.current) return;

    setMessage("");

    if (!action) {
      setMessage(fallback);
      return;
    }

    busyRef.current = true;
    setBusy(true);

    try {
      await action();
    } catch {
      setMessage("요청을 완료하지 못했어요. 다시 시도해주세요.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const handleFindId = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();

    if (!trimmedName || !trimmedContact) {
      setMessage("이름과 연락처를 입력해주세요.");
      return;
    }

    if (
      method === "phone" &&
      !/^01[016789]\d{7,8}$/.test(trimmedContact)
    ) {
      setMessage("휴대폰 번호를 확인해주세요.");
      return;
    }

    runAction(
      onFindId
        ? () =>
            onFindId({
              method,
              name: trimmedName,
              contact: trimmedContact,
            })
        : null,
      "아이디 조회 기능은 아직 연결되지 않았어요."
    );
  };

  return (
    <WavveAccountModal
      title="아이디 찾기"
      busy={busy}
      onClose={onClose}
    >
      {() => (
        <div className="find-id">
          <nav className="find-id__tabs" aria-label="아이디 찾기 방식">
            <button
              type="button"
              aria-pressed={tab === "simple"}
              disabled={busy}
              onClick={() => changeTab("simple")}
            >
              간편찾기
            </button>

            <button
              type="button"
              aria-pressed={tab === "verify"}
              disabled={busy}
              onClick={() => changeTab("verify")}
            >
              본인인증으로 찾기
            </button>
          </nav>

          <div className="wam-body">
            {tab === "simple" ? (
              <>
                <p className="find-id__intro">
                  아래의 아이디 찾기 수단 중
                  <br />
                  하나를 선택하여 진행해주세요.
                </p>

                <form
                  className="find-id__form"
                  onSubmit={handleFindId}
                >
                  <fieldset
                    className="find-id__methods"
                    disabled={busy}
                  >
                    <legend className="find-id__sr-only">
                      연락처 선택
                    </legend>

                    <label>
                      <input
                        type="radio"
                        name={`${fieldId}-method`}
                        checked={method === "phone"}
                        onChange={() => changeMethod("phone")}
                      />
                      휴대폰 번호
                    </label>

                    <label>
                      <input
                        type="radio"
                        name={`${fieldId}-method`}
                        checked={method === "email"}
                        onChange={() => changeMethod("email")}
                      />
                      이메일 주소
                    </label>
                  </fieldset>

                  <label
                    className="find-id__sr-only"
                    htmlFor={`${fieldId}-name`}
                  >
                    이름
                  </label>

                  <input
                    id={`${fieldId}-name`}
                    className="wam-input"
                    type="text"
                    autoComplete="name"
                    placeholder="이름"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={busy}
                    required
                  />

                  <label
                    className="find-id__sr-only"
                    htmlFor={`${fieldId}-contact`}
                  >
                    {method === "phone" ? "휴대폰 번호" : "이메일 주소"}
                  </label>

                  <input
                    key={method}
                    id={`${fieldId}-contact`}
                    className="wam-input"
                    type={method === "phone" ? "tel" : "email"}
                    inputMode={method === "phone" ? "numeric" : "email"}
                    autoComplete={method === "phone" ? "tel" : "email"}
                    placeholder={
                      method === "phone"
                        ? "휴대폰 번호 (번호만 입력)"
                        : "이메일 주소"
                    }
                    value={contact}
                    onChange={(event) => {
                      const value = event.target.value;

                      setContact(
                        method === "phone"
                          ? value.replace(/\D/g, "").slice(0, 11)
                          : value
                      );
                    }}
                    disabled={busy}
                    required
                  />

                  <button
                    type="submit"
                    className="wam-button wam-button--primary"
                    disabled={busy}
                  >
                    {busy ? "확인 중…" : "확인"}
                  </button>
                </form>

                <div className="find-id__social">
                  <p>
                    <strong>SNS 아이디로 가입</strong>하신 경우
                    <br />
                    <strong>각 SNS 간편 로그인</strong>을 이용해주세요.
                  </p>

                  <div className="find-id__social-buttons">
                    {socialProviders.map((provider) => (
                      <button
                        key={provider.key}
                        type="button"
                        className={`find-id__sns find-id__sns--${provider.key}`}
                        aria-label={`${provider.name} 로그인`}
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            onSocialLogin
                              ? () => onSocialLogin(provider.key)
                              : null,
                            `${provider.name} 로그인은 아직 연결되지 않았어요.`
                          )
                        }
                      >
                        {provider.icon ? (
                          <img src={provider.icon} alt="" />
                        ) : (
                          <span aria-hidden="true">
                            {provider.text}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="find-id__intro">
                  휴대폰 인증을 통해
                  <br />
                  아이디 찾기를 진행해주세요.
                </p>

                <button
                  type="button"
                  className="find-id__verify"
                  disabled={busy}
                  onClick={() =>
                    runAction(
                      onPhoneVerify,
                      "휴대폰 본인인증 서비스는 아직 연결되지 않았어요."
                    )
                  }
                >
                  <svg
                    viewBox="0 0 64 88"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="10"
                      y="3"
                      width="44"
                      height="82"
                      rx="7"
                    />
                    <path d="M10 16h44M10 68h44" />
                    <circle cx="32" cy="77" r="3" />
                  </svg>

                  <span>{busy ? "진행 중…" : "휴대폰 인증"}</span>
                </button>

                <p className="find-id__notice">
                  · 본인 명의의 휴대폰 인증을 진행한 회원만 이용이
                  가능합니다. (간편 가입회원 사용불가)
                </p>
              </>
            )}

            {message && (
              <p className="find-id__message" role="status">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </WavveAccountModal>
  );
}