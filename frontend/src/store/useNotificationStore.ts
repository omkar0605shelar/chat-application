import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;

    addNotification: (notification: Notification) => void;
    markRead: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + 1,
        })),

    markRead: (id) =>
        set((state) => {
            const notif = state.notifications.find((n) => n.id === id);
            return {
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                ),
                unreadCount: notif && !notif.read
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        }),

    clearAll: () =>
        set({ notifications: [], unreadCount: 0 }),
}));
