import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import googleIcon from '../../assets/login/googleLogo.png';
import { useAuthStore } from '../../store/useAuthStore';
import { getSocialLoginError } from '../../utils/socialLoginError';
import '../../styles/components/common/LoginModal.scss';

export const LoginModal = ({ isOpen, onClose, returnTo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const signInSocial = useAuthStore((state) => state.onSocialLogin);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState('');

  const loginState = {
    returnTo: returnTo ?? (location.pathname + location.search + location.hash),
  };
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    if (isSigningIn) return;
    setMessage('');
    setIsSigningIn(true);

    try {
      const result = await signInSocial('google');
      onClose();
      navigate('/profileselect', {
        state: result.isNewUser ? { returnTo: '/voucher' } : loginState,
      });
    } catch (error) {
      setMessage(getSocialLoginError(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="login-modal" role="dialog" aria-modal="true" aria-label="회원가입 및 로그인 안내">
        <button type="button" className="login-modal__close" onClick={onClose} aria-label="닫기">×</button>
        <h2>지금 가입하고<br />즐거움에 웨이브 타세요</h2>
        <p>취향에 맞는 이야기를 한곳에서 만나보세요.</p>
        <Link to="/member" className="login-modal__signup" onClick={onClose}>가입하고 시작하기</Link>
        <div className="login-modal__social" aria-label="소셜 로그인">
          <button
            type="button"
            className="login-modal__social-btn"
            aria-label="구글 로그인"
            disabled={isSigningIn}
            onClick={handleGoogleLogin}
          >
            <img src={googleIcon} alt="" width="27" height="27" />
          </button>
          <Link to="/login" state={loginState} onClick={onClose} className="login-modal__social-btn login-modal__social-btn--kakao" aria-label="카카오 로그인"><svg width="27" height="27" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffdf00" d="M12 3C6.48 3 2 6.38 2 10.55c0 2.65 1.81 4.98 4.54 6.32l-.85 3.26 3.75-2.43c.82.19 1.68.29 2.56.29 5.52 0 10-3.38 10-7.55S17.52 3 12 3Z" /></svg></Link>
        </div>
        {message && <div className="login-modal__error" role="alert">{message}</div>}
        <div className="login-modal__bottom">이미 계정이 있나요? <Link to="/login" state={loginState} onClick={onClose}>로그인</Link></div>
      </div>
    </div>
  );
};
