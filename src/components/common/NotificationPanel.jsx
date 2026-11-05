import { useNavigate } from 'react-router-dom';
import { Bell, CircleAlert } from 'lucide-react';

import '../../styles/components/common/NotificationPanel.scss';

export const NotificationPanel = ({
  id,
  isLoggedIn,
  notifications = [],
  onRead,
  onReadAll,
}) => {
  const navigate = useNavigate();

  const unreadCount = notifications.filter(
    (item) => !item.readAt
  ).length;

  const handleNotificationClick = (item) => {
    onRead?.(item.id);

    if (
      typeof item.link === 'string' &&
      item.link.startsWith('/') &&
      !item.link.startsWith('//')
    ) {
      navigate(item.link);
    }
  };

  return (
    <section
      id={id}
      className="notification-panel"
      role="region"
      aria-label="알림함"
    >
      <div className="notification-panel__head">
        <h2>알림함</h2>

        {isLoggedIn && unreadCount > 0 && (
          <button
            type="button"
            className="notification-panel__read-all"
            onClick={onReadAll}
          >
            모두 읽음
          </button>
        )}
      </div>

      {!isLoggedIn ? (
        <div className="notification-panel__empty notification-panel__guest">
          <Bell
            size={48}
            strokeWidth={1.4}
            aria-hidden="true"
          />

          <strong className="notification-panel__guest-title">
            내 소식을 한곳에서 확인하세요
          </strong>

          <p>
            로그인하면 관심 콘텐츠와
            <br />
            새로운 소식을 확인할 수 있어요.
          </p>

          <button
            type="button"
            className="notification-panel__login"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notification-panel__empty">
          <CircleAlert
            size={48}
            strokeWidth={1.4}
            aria-hidden="true"
          />

          <p>아직 받은 알림이 없어요.</p>
        </div>
      ) : (
        <div
          className="notification-panel__list"
          role="list"
        >
          {notifications.map((item) => (
            <div key={item.id} role="listitem">
              <button
                type="button"
                className={`notification-panel__item ${
                  item.readAt ? 'is-read' : 'is-unread'
                }`}
                onClick={() =>
                  handleNotificationClick(item)
                }
              >
                <span className="notification-panel__item-title">
                  {!item.readAt && (
                    <span className="notification-panel__unread-dot">
                      <span className="notification-panel__sr-only">
                        읽지 않음
                      </span>
                    </span>
                  )}

                  {item.title}
                </span>

                {item.message && (
                  <span className="notification-panel__message">
                    {item.message}
                  </span>
                )}

                <span className="notification-panel__date">
                  {new Date(item.createdAt).toLocaleString(
                    'ko-KR'
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};