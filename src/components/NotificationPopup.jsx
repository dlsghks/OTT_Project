import { useEffect } from 'react'
import { AlarmClock, Bell, CircleAlert, X } from 'lucide-react'
import '../styles/components/NotificationPopup.scss'

// 알림함 팝업
export const NotificationPopup = ({ onClose }) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* 화면 전체 딤 (opacity 70%) */}
      <div className="notification-dim" onClick={onClose} />

      <section
        className="notification-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
      >
        <div className="notification-head">
          <h2 id="notification-title">알림함</h2>
          <div className="notification-actions">
            <button type="button">
              <AlarmClock size={16} strokeWidth={1.8} />
              시청예약
            </button>
            <button type="button">
              <Bell size={16} strokeWidth={1.8} />
              알림설정
            </button>
          </div>
        </div>

        <div className="notification-empty">
          <CircleAlert size={52} strokeWidth={1.4} />
          <p>알림내역이 없어요</p>
        </div>

        <button
          type="button"
          className="notification-close"
          aria-label="알림함 닫기"
          onClick={onClose}
        >
          <X size={28} strokeWidth={1.6} />
        </button>
      </section>
    </>
  )
}
