import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import kakaoIcon from '../../assets/share/kakao.svg';
import xIcon from '../../assets/share/x.png';
import threadsIcon from '../../assets/share/threads.png';
import instagramIcon from '../../assets/share/instagram.png';
import '../../styles/pages/live/LiveChannel.scss';

const messages = {
    success: '링크가 복사되었습니다.',
    instagram: '인스타그램에서 복사한 링크를 붙여넣어 주세요.',
    kakao: '카카오톡 대화방에 복사한 링크를 붙여넣어 주세요.',
    error: '복사하지 못했습니다. 링크를 선택해 직접 복사해 주세요.',
};

export const ShareModal = ({ title, onClose }) => {
    const headingId = useId();
    const [status, setStatus] = useState('');
    const url = window.location.href;
    const services = [
        { name: 'X', icon: xIcon, href: `https://x.com/intent/tweet?${new URLSearchParams({ url, text: title ?? '' })}` },
        { name: 'Threads', icon: threadsIcon, href: `https://www.threads.com/intent/post?${new URLSearchParams({ url, text: title ?? '' })}` },
        { name: '인스타그램', icon: instagramIcon, href: 'https://www.instagram.com/', copyBeforeSharing: true },
    ];

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const copyLink = async (successStatus = 'success') => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus(successStatus);
        } catch {
            setStatus('error');
        }
    };

    const shareKakao = async () => {
        setStatus('');
        const kakao = window.Kakao;
        try {
            if (kakao?.isInitialized?.() && kakao.Share?.sendDefault) {
                await kakao.Share.sendDefault({
                    objectType: 'text',
                    text: title || '웨이브에서 보기',
                    link: { webUrl: url, mobileWebUrl: url },
                    buttonTitle: '웨이브에서 보기',
                });
                return;
            }
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
        } catch (error) {
            if (error?.name === 'AbortError') return;
        }
        await copyLink('kakao');
    };

    return createPortal(
        <div
            className="live-share-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className="live-share-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
            >
                <button
                    type="button"
                    className="live-share-modal__close"
                    onClick={onClose}
                    aria-label="공유 팝업 닫기"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <h2 id={headingId}>공유하기</h2>

                <div className="live-share-modal__sns">
                    <button type="button" className="live-share-modal__kakao" aria-label="카카오톡에 공유" onClick={shareKakao}>
                        <img src={kakaoIcon} alt="" width="48" height="48" />
                    </button>
                    {services.map(({ name, icon, href, copyBeforeSharing }) => (
                        <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={copyBeforeSharing ? `${name}에 공유할 링크 복사 후 열기` : `${name}에 공유`}
                            onClick={copyBeforeSharing ? () => void copyLink('instagram') : undefined}
                        >
                            <img src={icon} alt="" width="48" height="48" />
                        </a>
                    ))}
                </div>

                <div className="live-share-modal__copy">
                    <input
                        type="text"
                        readOnly
                        value={url}
                        aria-label="공유할 링크"
                        onFocus={(event) => event.target.select()}
                    />
                    <button type="button" onClick={() => void copyLink()}>복사</button>
                </div>

                <div className="live-share-modal__feedback" role="status" aria-live="polite">
                    {status && (
                        <p className={`live-share-modal__message${status !== 'error' ? ' is-success' : ''}`}>
                            {status !== 'error' && (
                                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                                    <circle cx="10" cy="10" r="9" fill="#27d34d" />
                                    <path d="M5.5 10L8.5 13L14.5 7" fill="none" stroke="#0b0d18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <span>{messages[status]}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};