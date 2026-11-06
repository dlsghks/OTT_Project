import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set) => ({
      notificationsByUser: {},

      // 로그인한 사용자의 알림 추가
      onAddNotification: (uid, notification) => {
        if (!uid || !notification) return;

        const item = {
          id: notification.id ?? crypto.randomUUID(),
          title: notification.title || '새로운 알림',
          message: notification.message || '',
          link: notification.link || '',
          createdAt:
            notification.createdAt ??
            new Date().toISOString(),
          readAt: null,
        };

        set((state) => {
          const items = state.notificationsByUser[uid] ?? [];

          // 같은 ID의 알림 중복 등록 방지
          if (items.some((entry) => entry.id === item.id)) {
            return state;
          }

          return {
            notificationsByUser: {
              ...state.notificationsByUser,
              [uid]: [item, ...items],
            },
          };
        });
      },

      // 알림 하나 읽음 처리
      onReadNotification: (uid, notificationId) => {
        if (!uid) return;

        set((state) => ({
          notificationsByUser: {
            ...state.notificationsByUser,
            [uid]: (
              state.notificationsByUser[uid] ?? []
            ).map((item) =>
              item.id === notificationId && !item.readAt
                ? {
                    ...item,
                    readAt: new Date().toISOString(),
                  }
                : item
            ),
          },
        }));
      },

      // 전체 알림 읽음 처리
      onReadAllNotifications: (uid) => {
        if (!uid) return;

        const readAt = new Date().toISOString();

        set((state) => ({
          notificationsByUser: {
            ...state.notificationsByUser,
            [uid]: (
              state.notificationsByUser[uid] ?? []
            ).map((item) =>
              item.readAt ? item : { ...item, readAt }
            ),
          },
        }));
      },
    }),
    {
      name: 'wavve-notifications',
      partialize: (state) => ({
        notificationsByUser: state.notificationsByUser,
      }),
    }
  )
);