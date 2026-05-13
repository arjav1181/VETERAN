import { api } from '../client';

export type Notification = {
  id: string;
  type: 'issue' | 'pull_request' | 'commit' | 'release' | 'discussion' | 'mention' | 'review' | 'invitation';
  title: string;
  body: string | null;
  read: boolean;
  repository: {
    id: string;
    full_name: string;
    owner: {
      username: string;
      avatar_url: string | null;
    };
  };
  subject: {
    type: string;
    title: string;
    url: string;
    latest_comment_url?: string;
  };
  reason: string;
  unread: boolean;
  updated_at: string;
  created_at: string;
  last_read_at: string | null;
  url: string;
};

export type NotificationCount = {
  total: number;
  unread: number;
};

export const notificationApi = {
  list: (params?: {
    all?: boolean;
    participating?: boolean;
    page?: number;
    per_page?: number;
    since?: string;
    before?: string;
  }) => api.get<Notification[]>('/notifications', { params }),

  get: (id: string) => api.get<Notification>(`/notifications/${id}`),

  markAsRead: (id: string) =>
    api.patch<void>(`/notifications/${id}`, { read: true }),

  markAllAsRead: () =>
    api.put<void>('/notifications', { read: true }),

  markRepoAsRead: (owner: string, name: string) =>
    api.put<void>(`/repos/${owner}/${name}/notifications`, { read: true }),

  getUnreadCount: () =>
    api.get<NotificationCount>('/notifications/count'),

  subscribe: (owner: string, name: string) =>
    api.put<void>(`/repos/${owner}/${name}/subscription`),

  unsubscribe: (owner: string, name: string) =>
    api.delete<void>(`/repos/${owner}/${name}/subscription`),

  getSubscription: (owner: string, name: string) =>
    api.get<{ subscribed: boolean; ignored: boolean; reason: string | null }>(
      `/repos/${owner}/${name}/subscription`
    ),
};
