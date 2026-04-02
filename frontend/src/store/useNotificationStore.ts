import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter((n) => n.id !== id) 
  })),
  markAsRead: (id) => set((state) => ({ 
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n) 
  })),
  clearAll: () => set({ notifications: [] }),
}));
