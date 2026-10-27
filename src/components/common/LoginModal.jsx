import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/LoginModal.scss';

export const LoginModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          <Link to="/login" onClick={onClose} className="login-modal__social-btn login-modal__social-btn--naver" aria-label="네이버 로그인">N</Link>
          <Link to="/login" onClick={onClose} className="login-modal__social-btn login-modal__social-btn--kakao" aria-label="카카오 로그인"><svg width="27" height="27" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffdf00" d="M12 3C6.48 3 2 6.38 2 10.55c0 2.65 1.81 4.98 4.54 6.32l-.85 3.26 3.75-2.43c.82.19 1.68.29 2.56.29 5.52 0 10-3.38 10-7.55S17.52 3 12 3Z"/></svg></Link>
          <Link to="/login" onClick={onClose} className="login-modal__social-btn login-modal__social-btn--apple" aria-label="애플 로그인"><svg width="27" height="29" viewBox="0 0 24 24" aria-hidden="true"><path fill="white" d="M17.05 12.54c.02 2.1 1.84 2.8 1.86 2.81-.02.05-.29 1.02-.96 2.02-.58.87-1.19 1.74-2.15 1.76-.95.02-1.25-.56-2.34-.56-1.09 0-1.43.54-2.33.58-.94.04-1.65-.95-2.24-1.81-1.22-1.77-2.15-5-.9-7.17.62-1.08 1.73-1.76 2.93-1.78.91-.02 1.77.62 2.33.62.55 0 1.59-.77 2.68-.66.46.02 1.76.19 2.6 1.41-.07.04-1.55.9-1.53 2.78ZM15.26 5.19c.49-.6.82-1.43.73-2.26-.71.03-1.58.47-2.09 1.06-.46.53-.86 1.38-.75 2.19.79.06 1.6-.4 2.11-.99Z"/></svg></Link>
        </div>
        <div className="login-modal__bottom">이미 계정이 있나요? <Link to="/login" onClick={onClose}>로그인</Link></div>
      </div>
    </div>
  );
};
