import { useId, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { WavveAccountModal } from "../common/WavveAccountModal";

import "../../styles/pages/member/FindIdModal.scss";
import "../../styles/pages/member/PasswordHelpModal.scss";

function MethodIcon({ type }) {
  if (type === "id") {
    return (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="32" />
        <path d="M29 27v26M39 27h5c15 0 15 26 0 26h-5V27Z" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="8" y="17" width="64" height="46" rx="5" />
        <path d="m10 20 25 23a8 8 0 0 0 10 0l25-23M10 60l20-20M70 60 50 40" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 88" fill="none" aria-hidden="true">
      <rect x="10" y="3" width="44" height="82" rx="7" />
      <path d="M10 16h44M10 68h44" />
      <circle cx="32" cy="77" r="3" />
    </svg>
  );
}

export function AccountHelpModal({ onClose }) {
  const fieldId = useId();
  const busyRef = useRef(false);

  const [tab, setTab] = useState("member");
  const [memberType, setMemberType] = useState(null);
  const [method, setMethod] = useState("phone");

  const [account, setAccount] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setMessage("");
  };

  const chooseMember = (type) => {
    setMemberType(type);
    setMethod("phone");
    setAccount("");
    setContact("");
    setCode("");
    setMessage("");
  };

  const changeMethod = (nextMethod) => {
    setMethod(nextMethod);
    setContact("");
    setCode("");
    setMessage("");
  };

  const validateAccount = () => {
    const value = account.trim();

    if (!value) {
      setMessage(
        memberType === "email"
          ? "가입한 이메일을 입력해주세요."
          : "아이디를 입력해주세요."
      );
      return false;
    }

    if (
      memberType === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      setMessage("이메일 주소를 확인해주세요.");
      return false;
    }

    return true;
  };

  const handleSendCode = () => {
    if (!validateAccount()) return;

    if (!/^01[016789]\d{7,8}$/.test(contact)) {
      setMessage("휴대폰 번호를 확인해주세요.");
      return;
    }

    setMessage(
      "문자 인증 서비스는 아직 연결되지 않았어요. 이메일 회원은 ‘이메일 주소’를 선택해 재설정 메일을 받을 수 있어요."
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busyRef.current || !validateAccount()) return;

    setMessage("");

    if (method === "phone") {
      setMessage(
        "휴대폰 인증번호 확인은 문자 인증 서비스 연결 후 이용할 수 있어요."
      );
      return;
    }

    if (memberType === "id") {
      setMessage(
        "ID 회원의 등록 이메일 조회는 아직 연결되지 않았어요."
      );
      return;
    }

    busyRef.current = true;
    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, account.trim());
      setSent(true);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setSent(true);
      } else if (error.code === "auth/invalid-email") {
        setMessage("이메일 주소를 확인해주세요.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("요청이 많습니다. 잠시 후 다시 시도해주세요.");
      } else if (error.code === "auth/network-request-failed") {
        setMessage("네트워크 연결을 확인해주세요.");
      } else {
        setMessage("메일 발송을 완료하지 못했어요. 다시 시도해주세요.");
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <WavveAccountModal
      title="비밀번호 재설정"
      busy={busy}
      onClose={onClose}
    >
      {(close) =>
        sent ? (
          <div className="wam-body password-help__complete">
            <p role="status">
              비밀번호 재설정 메일을 요청했어요.
            </p>

            <p className="password-help__notice">
              가입된 이메일이라면 재설정 링크가 도착합니다.
              메일함과 스팸함을 확인해주세요.
            </p>

            <button
              type="button"
              className="wam-button wam-button--primary"
              onClick={close}
            >
              로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="find-id password-help">
            <nav
              className="find-id__tabs"
              aria-label="비밀번호 재설정 방식"
            >
              <button
                type="button"
                aria-pressed={tab === "member"}
                disabled={busy}
                onClick={() => changeTab("member")}
              >
                회원등록 정보
              </button>

              <button
                type="button"
                aria-pressed={tab === "verify"}
                disabled={busy}
                onClick={() => changeTab("verify")}
              >
                본인인증
              </button>
            </nav>

            <div className="wam-body">
              {tab === "verify" ? (
                <>
                  <p className="find-id__intro">
                    휴대폰 인증을 통해
                    <br />
                    비밀번호 재설정을 진행해주세요.
                  </p>

                  <button
                    type="button"
                    className="find-id__verify"
                    onClick={() =>
                      setMessage(
                        "PASS 본인인증 서비스는 아직 연결되지 않았어요."
                      )
                    }
                  >
                    <MethodIcon type="phone" />
                    <span>휴대폰 인증</span>
                  </button>

                  <p className="find-id__notice">
                    · 본인 명의의 휴대폰 인증을 진행한 회원만
                    이용이 가능합니다. (간편 가입회원 사용불가)
                  </p>
                </>
              ) : (
                <>
                  <p className="find-id__intro">
                    아래의 비밀번호 재설정 수단 중
                    <br />
                    하나를 선택하여 진행해주세요.
                  </p>

                  {!memberType ? (
                    <div className="password-help__choices">
                      <button
                        type="button"
                        className="password-help__choice"
                        onClick={() => chooseMember("id")}
                      >
                        <MethodIcon type="id" />
                        <strong>ID 회원</strong>
                        <span>2021년 9월 이전 가입</span>
                      </button>

                      <button
                        type="button"
                        className="password-help__choice"
                        onClick={() => chooseMember("email")}
                      >
                        <MethodIcon type="email" />
                        <strong>이메일 회원</strong>
                        <span>2021년 9월 이후 가입</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="password-help__back"
                        disabled={busy}
                        onClick={() => {
                          setMemberType(null);
                          setMessage("");
                        }}
                      >
                        ‹ 회원 유형 다시 선택
                      </button>

                      <form
                        className="find-id__form"
                        onSubmit={handleSubmit}
                      >
                        <fieldset
                          className="find-id__methods"
                          disabled={busy}
                        >
                          <legend className="find-id__sr-only">
                            재설정 수단 선택
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
                          htmlFor={`${fieldId}-account`}
                        >
                          {memberType === "id" ? "아이디" : "이메일"}
                        </label>

                        <input
                          id={`${fieldId}-account`}
                          className="wam-input"
                          type={memberType === "id" ? "text" : "email"}
                          autoComplete="username"
                          placeholder={
                            memberType === "id"
                              ? "아이디"
                              : "이메일 (아이디)"
                          }
                          value={account}
                          onChange={(event) =>
                            setAccount(event.target.value)
                          }
                          disabled={busy}
                          required
                        />

                        {method === "phone" ? (
                          <>
                            <div className="password-help__send-row">
                              <label
                                className="find-id__sr-only"
                                htmlFor={`${fieldId}-phone`}
                              >
                                휴대폰 번호
                              </label>

                              <input
                                id={`${fieldId}-phone`}
                                className="wam-input"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="휴대폰 번호 (번호만 입력)"
                                value={contact}
                                onChange={(event) =>
                                  setContact(
                                    event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 11)
                                  )
                                }
                                required
                              />

                              <button
                                type="button"
                                onClick={handleSendCode}
                              >
                                전송
                              </button>
                            </div>

                            <label
                              className="find-id__sr-only"
                              htmlFor={`${fieldId}-code`}
                            >
                              인증번호
                            </label>

                            <input
                              id={`${fieldId}-code`}
                              className="wam-input"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              placeholder="인증번호"
                              value={code}
                              maxLength={8}
                              onChange={(event) =>
                                setCode(
                                  event.target.value.replace(/\D/g, "")
                                )
                              }
                              required
                            />
                          </>
                        ) : memberType === "id" ? (
                          <>
                            <label
                              className="find-id__sr-only"
                              htmlFor={`${fieldId}-email`}
                            >
                              등록한 이메일 주소
                            </label>

                            <input
                              id={`${fieldId}-email`}
                              className="wam-input"
                              type="email"
                              autoComplete="email"
                              placeholder="등록한 이메일 주소"
                              value={contact}
                              onChange={(event) =>
                                setContact(event.target.value)
                              }
                              required
                            />
                          </>
                        ) : (
                          <p className="password-help__notice">
                            가입한 이메일로 비밀번호 재설정 링크를
                            보내드려요.
                          </p>
                        )}

                        <button
                          type="submit"
                          className="wam-button wam-button--primary"
                          disabled={busy}
                        >
                          {busy
                            ? "발송 중…"
                            : method === "email" && memberType === "email"
                              ? "재설정 메일 보내기"
                              : "확인"}
                        </button>
                      </form>

                      <p className="find-id__notice">
                        · SNS 아이디로 가입하신 경우 각 SNS 홈페이지에서
                        비밀번호 재설정이 가능합니다.
                      </p>
                    </>
                  )}
                </>
              )}

              {message && (
                <p className="find-id__message" role="status">
                  {message}
                </p>
              )}
            </div>
          </div>
        )
      }
    </WavveAccountModal>
  );
}