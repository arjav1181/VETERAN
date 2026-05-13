import { api } from '../client';

export type SystemStats = {
  total_users: number;
  total_repos: number;
  total_orgs: number;
  total_issues: number;
  total_pulls: number;
  active_users_24h: number;
  active_users_7d: number;
  storage_used: number;
  api_requests_24h: number;
};

export type UserAdmin = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  banned: boolean;
  confirmed: boolean;
  created_at: string;
  last_sign_in: string | null;
};

export type AuditLog = {
  id: string;
  action: string;
  actor: { id: string; username: string };
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  created_at: string;
};

export const adminApi = {
  getStats: () => api.get<SystemStats>('/admin/stats'),

  listUsers: (params?: { page?: number; per_page?: number; search?: string; role?: string; banned?: boolean }) =>
    api.get<UserAdmin[]>('/admin/users', { params }),

  getUser: (userId: string) => api.get<UserAdmin>(`/admin/users/${userId}`),

  updateUser: (userId: string, data: { role?: string; banned?: boolean; confirmed?: boolean }) =>
    api.patch<UserAdmin>(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) => api.delete<void>(`/admin/users/${userId}`),

  listRepos: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get(`/admin/repos`, { params }),

  deleteRepo: (owner: string, name: string) =>
    api.delete<void>(`/admin/repos/${owner}/${name}`),

  listOrgs: (params?: { page?: number; per_page?: number }) =>
    api.get(`/admin/orgs`, { params }),

  deleteOrg: (slug: string) => api.delete<void>(`/admin/orgs/${slug}`),

  getAuditLogs: (params?: { page?: number; per_page?: number; action?: string; userId?: string; since?: string }) =>
    api.get<AuditLog[]>('/admin/audit-logs', { params }),

  getServerLogs: (params?: { lines?: number }) =>
    api.get<{ logs: string[] }>('/admin/logs', { params }),

  getSystemHealth: () =>
    api.get<{ status: string; uptime: number; memory: Record<string, unknown>; cpu: Record<string, unknown> }>(
      '/admin/health'
    ),

  getQueueStats: () =>
    api.get<Record<string, { waiting: number; active: number; failed: number; completed: number }>>(
      '/admin/queues'
    ),

  getFeatureFlags: () =>
    api.get<Record<string, boolean>>('/admin/features'),

  toggleFeatureFlag: (flag: string, enabled: boolean) =>
    api.put<void>(`/admin/features/${flag}`, { enabled }),

  getConfig: () =>
    api.get<Record<string, unknown>>('/admin/config'),

  updateConfig: (config: Record<string, unknown>) =>
    api.put<void>('/admin/config', config),
};
