import { FindIdModal } from "../../components/member/FindIdModal";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getSocialLoginError } from "../../utils/socialLoginError";
import wavveLogo from "../../assets/login/wavve-logo.png";
import googleIcon from "../../assets/login/googleLogo.png";
import kakaoIcon from "../../assets/login/kakao.png";
import glowLeft from "../../assets/login/glow-left.png";
import glowRight from "../../assets/login/glow-right.png";
import mobileGlowLeft from "../../assets/login/mobile/glow-left.svg";
import mobileGlowRight from "../../assets/login/mobile/glow-right.svg";
import "../../styles/pages/member/Login.scss";
import { AccountHelpModal } from "../../components/member/AccountHelpModal";

const providers = [
  { key: "google", label: "Google로 계속하기", icon: googleIcon },
  { key: "kakao", label: "카카오로 시작하기", icon: kakaoIcon },
];

// 실제 인증 함수를 연결할 수 있도록 콜백으로 분리했습니다.
export const Login = ({ onSocialLogin, onAccountHelp, onServiceInfo } = {}) => {
  const navigate = useNavigate();
  const onLogin = useAuthStore((state) => state.onLogin);
  const signInSocial = useAuthStore((state) => state.onSocialLogin);
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountHelp, setAccountHelp] = useState(null);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setMessage("");
    setIsSubmitting(true);

    try {
      await onLogin(email, password);
      navigate("/profileselect", { replace: true });
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        setMessage("시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else if (error.code === "auth/network-request-failed") {
        setMessage("네트워크 연결을 확인해주세요.");
      } else {
        setMessage("이메일과 비밀번호를 확인해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeSocialLogin = async (provider) => {
    await (onSocialLogin ?? signInSocial)(provider);
    navigate("/profileselect", { replace: true, state: { returnTo } });
  };

  const handleSocialLogin = async (provider) => {
    if (isSubmitting) return;

    setMessage("");
    setIsSubmitting(true);

    try {
      await completeSocialLogin(provider);
    } catch (error) {
      setMessage(getSocialLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountHelp = (type) => {
    setMessage("");
    setAccountHelp(type);
  };

  return (
    <section className={`login-page${emailFormOpen ? " login-page--email-open" : ""}`} aria-label="웨이브 로그인">
      <div className="login-page__glows" aria-hidden="true">
        <picture><source media="(max-width: 600px)" srcSet={mobileGlowLeft} /><img className="login-page__glow login-page__glow--left" src={glowLeft} alt="" /></picture>
        <picture><source media="(max-width: 600px)" srcSet={mobileGlowRight} /><img className="login-page__glow login-page__glow--right" src={glowRight} alt="" /></picture>
      </div>

      <div className="login-page__content">
        <h1 className="login-page__brand">
          <img src={wavveLogo} alt="wavve" width="180" height="39" />
          <span className="login-page__sr-only">로그인</span>
        </h1>

        <div className="login-page__accounts">
          <Link className="login-page__button login-page__button--primary" to="/member">
            웨이브 회원가입
          </Link>
          <button
            className="login-page__button"
            type="button"
            aria-expanded={emailFormOpen}
            aria-controls="wavve-email-form"
            onClick={() => {
              setEmailFormOpen((open) => !open);
              setMessage("");
            }}
          >
            웨이브 아이디로 로그인
          </button>
          {emailFormOpen && (
            <form id="wavve-email-form" className="login-page__email-form" onSubmit={handleEmailLogin}>
              <label htmlFor="wavve-email">이메일</label>
              <input id="wavve-email" type="email" autoComplete="username" value={email}
                onChange={(event) => setEmail(event.target.value)} placeholder="이메일을 입력해주세요" required />
              <label htmlFor="wavve-password">비밀번호</label>
              <input id="wavve-password" type="password" autoComplete="current-password" value={password}
                onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호를 입력해주세요" required />
              <button className="login-page__button login-page__button--primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "로그인 중…" : "로그인"}
              </button>
            </form>
          )}
        </div>

        <div className="login-page__divider"><span>또는</span></div>

        <div className="login-page__social">
          {providers.map(({ key, label, icon }) => (
            <button className="login-page__button login-page__button--social" type="button" key={key}
              disabled={isSubmitting} onClick={() => handleSocialLogin(key)}>
              <img src={icon} alt="" width="22" height="22" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="login-page__help">
          <button type="button" onClick={() => handleAccountHelp("id")}>아이디 찾기</button>
          <span aria-hidden="true">|</span>
          <button type="button" onClick={() => handleAccountHelp("password")}>비밀번호 재설정</button>
        </div>
        {message && <p className="login-page__message" role="status">{message}</p>}
      </div>

      <nav className="login-page__legal" aria-label="서비스 안내">
        <button type="button" onClick={() => onServiceInfo ? onServiceInfo("terms") : setMessage("이용약관 페이지는 아직 연결되지 않았습니다.")}>이용약관</button>
        <button type="button" onClick={() => onServiceInfo ? onServiceInfo("privacy") : setMessage("개인정보 처리방침 페이지는 아직 연결되지 않았습니다.")}>개인정보 처리방침</button>
        <button type="button" onClick={() => onServiceInfo ? onServiceInfo("support") : setMessage("고객센터 페이지는 아직 연결되지 않았습니다.")}>고객센터</button>
      </nav>
      {accountHelp === "id" && (
        <FindIdModal
          onClose={() => setAccountHelp(null)}
          onSocialLogin={completeSocialLogin}
        />
      )}

      {accountHelp === "password" && (
        <AccountHelpModal
          key="password"
          type="password"
          onClose={() => setAccountHelp(null)}
        />
      )}
    </section>
  );
};

export default Login;
