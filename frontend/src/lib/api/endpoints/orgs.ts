import { api } from '../client';
import type { Repo } from './repos';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  email: string | null;
  verified: boolean;
  public_members: number;
  private_members: number;
  repos_count: number;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  description: string | null;
  permission: 'pull' | 'push' | 'admin';
  members_count: number;
  repos_count: number;
  created_at: string;
};

export const orgApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<Organization[]>('/orgs', { params }),

  get: (slug: string) => api.get<Organization>(`/orgs/${slug}`),

  create: (data: { name: string; description?: string; email?: string }) =>
    api.post<Organization>('/orgs', data),

  update: (slug: string, data: Partial<Organization>) =>
    api.patch<Organization>(`/orgs/${slug}`, data),

  delete: (slug: string) => api.delete<void>(`/orgs/${slug}`),

  listRepos: (slug: string, params?: { type?: string; page?: number; per_page?: number }) =>
    api.get<Repo[]>(`/orgs/${slug}/repos`, { params }),

  listMembers: (slug: string, params?: { role?: string; page?: number; per_page?: number }) =>
    api.get<Member[]>(`/orgs/${slug}/members`, { params }),

  getMember: (slug: string, username: string) =>
    api.get<Member>(`/orgs/${slug}/members/${username}`),

  addMember: (slug: string, username: string, role?: string) =>
    api.put<Member>(`/orgs/${slug}/members/${username}`, { role }),

  updateMember: (slug: string, username: string, role: string) =>
    api.patch<Member>(`/orgs/${slug}/members/${username}`, { role }),

  removeMember: (slug: string, username: string) =>
    api.delete<void>(`/orgs/${slug}/members/${username}`),

  listTeams: (slug: string) =>
    api.get<Team[]>(`/orgs/${slug}/teams`),

  createTeam: (slug: string, data: { name: string; description?: string; permission?: string }) =>
    api.post<Team>(`/orgs/${slug}/teams`, data),

  updateTeam: (slug: string, teamId: string, data: Partial<Team>) =>
    api.patch<Team>(`/orgs/${slug}/teams/${teamId}`, data),

  deleteTeam: (slug: string, teamId: string) =>
    api.delete<void>(`/orgs/${slug}/teams/${teamId}`),

  listTeamMembers: (slug: string, teamId: string) =>
    api.get<Member[]>(`/orgs/${slug}/teams/${teamId}/members`),

  addTeamMember: (slug: string, teamId: string, username: string) =>
    api.put<void>(`/orgs/${slug}/teams/${teamId}/members/${username}`),

  removeTeamMember: (slug: string, teamId: string, username: string) =>
    api.delete<void>(`/orgs/${slug}/teams/${teamId}/members/${username}`),

  listTeamRepos: (slug: string, teamId: string) =>
    api.get<Repo[]>(`/orgs/${slug}/teams/${teamId}/repos`),

  addTeamRepo: (slug: string, teamId: string, owner: string, repo: string) =>
    api.put<void>(`/orgs/${slug}/teams/${teamId}/repos/${owner}/${repo}`),

  removeTeamRepo: (slug: string, teamId: string, owner: string, repo: string) =>
    api.delete<void>(`/orgs/${slug}/teams/${teamId}/repos/${owner}/${repo}`),

  checkMembership: (slug: string) =>
    api.get<{ role: string; state: string }>(`/orgs/${slug}/membership`),
};
