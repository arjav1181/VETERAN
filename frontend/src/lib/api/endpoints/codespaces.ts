import { api } from '../client';
const apiGet = api.get.bind(api);
const apiPost = api.post.bind(api);
const apiDelete = api.delete.bind(api);
import type { Codespace, CodespaceMachine } from '@/types';

export const codespaceApi = {
  list: () =>
    apiGet<Codespace[]>('/user/codespaces'),

  get: (id: string) =>
    apiGet<Codespace>(`/user/codespaces/${id}`),

  create: (data: {
    repositoryId: string;
    branch?: string;
    machineType?: string;
    displayName?: string;
    idleTimeoutMinutes?: number;
    devcontainerPath?: string;
  }) =>
    apiPost<Codespace>('/user/codespaces', data),

  start: (id: string) =>
    apiPost<Codespace>(`/user/codespaces/${id}/start`),

  stop: (id: string) =>
    apiPost<Codespace>(`/user/codespaces/${id}/stop`),

  delete: (id: string) =>
    apiDelete<void>(`/user/codespaces/${id}`),

  listMachines: (repoId: string, branch?: string) =>
    apiGet<CodespaceMachine[]>(`/repos/${repoId}/codespaces/machines`, { params: { branch } }),

  getRepoStatus: (owner: string, repo: string, branch?: string) =>
    apiGet<{ available: boolean; prebuild: boolean }>(`/repos/${owner}/${repo}/codespaces/new`, { params: { branch } }),
};
