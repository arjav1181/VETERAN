import { create } from 'zustand';

export type ToastNotification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
};

type NotificationState = {
  unreadCount: number;
  toasts: ToastNotification[];
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  incrementUnread: () => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

let toastId = 0;

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  toasts: [],

  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastNotification = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () =>
    set({ toasts: [] }),
}));
