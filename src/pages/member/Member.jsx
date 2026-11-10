import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import naverIcon from "../../assets/member/naver.svg";
import kakaoIcon from "../../assets/member/kakao.svg";
import appleIcon from "../../assets/member/apple.svg";
import glowLeft from "../../assets/login/glow-left.png";
import glowRight from "../../assets/login/glow-right.png";
import "../../styles/pages/member/Member.scss";

const providers = [
  { key: "naver", name: "네이버", icon: naverIcon },
  { key: "kakao", name: "카카오", icon: kakaoIcon },
  { key: "apple", name: "Apple", icon: appleIcon },
];

export const Member = ({ onSocialLogin, onServiceInfo } = {}) => {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const groups = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9\s]/]
      .filter((rule) => rule.test(password)).length;
    if (password.length < 8 || password.length > 20 || groups < 3 || /\s/.test(password)) {
      setMessage("비밀번호는 공백 없이 8~20자, 영문 대·소문자·숫자·특수문자 중 3가지 이상을 조합해주세요.");
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setMessage("");
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate("/profileselect", { replace: true, state: { returnTo: "/voucher" } });
    } catch (error) {
      const errors = {
        "auth/email-already-in-use": "이미 가입된 이메일입니다. 로그인해주세요.",
        "auth/invalid-email": "이메일 주소를 확인해주세요.",
        "auth/weak-password": "더 안전한 비밀번호로 다시 입력해주세요.",
        "auth/password-does-not-meet-requirements": "서비스의 비밀번호 조건에 맞춰 다시 입력해주세요.",
        "auth/operation-not-allowed": "Firebase에서 이메일/비밀번호 가입을 활성화해주세요.",
        "auth/network-request-failed": "네트워크 연결을 확인하고 다시 시도해주세요.",
        "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      };
      setMessage(errors[error.code] || "회원가입하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSocial = async (provider) => {
    if (submitting.current) return;
    if (!onSocialLogin) {
      setMessage("소셜 가입은 아직 연결되지 않았습니다. 이메일로 가입해주세요.");
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await onSocialLogin(provider);
      navigate("/profileselect", {
        replace: true,
        state: { returnTo: result?.isNewUser === false ? "/" : "/voucher" },
      });
    } catch {
      setMessage("소셜 가입을 완료하지 못했습니다. 다시 시도해주세요.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="member-page" aria-labelledby="member-heading">
      <div className="member-page__glows" aria-hidden="true">
        <img className="member-page__glow member-page__glow--left" src={glowLeft} alt="" />
        <img className="member-page__glow member-page__glow--right" src={glowRight} alt="" />
      </div>
      <div className="member-page__content">
        <div className="member-page__intro">
          <h1 id="member-heading">이메일과 비밀번호만으로<br />Wavve를 즐길 수 있어요!</h1>
          <p>좋아하는 이야기를 만나는 가장 간단한 시작</p>
        </div>
        <form className="member-page__form" onSubmit={handleSignUp} aria-busy={isSubmitting}>
          <div className="member-page__fields">
            <div className="member-page__field">
              <label htmlFor="member-email">이메일</label>
              <input id="member-email" type="email" autoComplete="email" placeholder="wavve@example.com"
                value={email} onChange={(event) => setEmail(event.target.value)}
                aria-describedby="member-email-help" disabled={isSubmitting} required />
              <p id="member-email-help">로그인과 비밀번호 찾기에 사용할 이메일을 입력해주세요.</p>
            </div>
            <div className="member-page__field">
              <label htmlFor="member-password">비밀번호</label>
              <div className="member-page__password">
                <input id="member-password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" placeholder="Wavve 비밀번호 설정" minLength={8} maxLength={20}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  aria-describedby="member-password-help" disabled={isSubmitting} required />
                <button type="button" aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  aria-pressed={showPassword} aria-controls="member-password"
                  onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
              <p id="member-password-help">8~20자, 영문 대·소문자·숫자·특수문자 중<br className="member-page__desktop-break" /> 3가지 이상을 조합해주세요.</p>
            </div>
          </div>
          <button className="member-page__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "가입 처리 중…" : "웨이브 회원가입"}
          </button>
        </form>
        {message && <p className="member-page__message" role="status">{message}</p>}
        <div className="member-page__divider"><span>또는 다른 계정으로 가입</span></div>
        <div className="member-page__social" aria-label="소셜 계정으로 가입">
          {providers.map(({ key, name, icon }) => (
            <button type="button" key={key} aria-label={`${name}로 가입`} disabled={isSubmitting}
              onClick={() => handleSocial(key)}>
              <img src={icon} alt="" width="22" height="22" />
            </button>
          ))}
        </div>
        <p className="member-page__login">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
      </div>
      <nav className="member-page__legal" aria-label="서비스 안내">
        {[["terms", "이용약관"], ["privacy", "개인정보 처리방침"], ["support", "고객센터"]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => onServiceInfo
            ? onServiceInfo(key) : setMessage(`${label} 페이지는 아직 연결되지 않았습니다.`)}>{label}</button>
        ))}
      </nav>
    </section>
  );
};

export default Member;
