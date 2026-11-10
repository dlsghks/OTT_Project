import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/pages/live/LiveChannel.scss';

const messages = {
    success: '링크가 복사되었습니다.',
    error: '복사하지 못했습니다. 링크를 선택해 직접 복사해 주세요.',
};

export const ShareModal = ({ title, onClose }) => {
    const headingId = useId();
    const [status, setStatus] = useState('');
    const url = window.location.href;
    const services = [
        { name: 'X', href: `https://x.com/intent/tweet?${new URLSearchParams({ url, text: title ?? '' })}` },
        { name: 'Threads', href: `https://www.threads.com/intent/post?${new URLSearchParams({ url, text: title ?? '' })}` },
        { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}` },
    ];

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus('success');
        } catch {
            setStatus('error');
        }
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
                    {services.map(({ name, href }) => (
                        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name}에 공유`}>
                            {name}
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
                    <button type="button" onClick={copyLink}>복사</button>
                </div>

                <div className="live-share-modal__feedback" role="status" aria-live="polite">
                    {status && (
                        <p className={`live-share-modal__message${status === 'success' ? ' is-success' : ''}`}>
                            {status === 'success' && (
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