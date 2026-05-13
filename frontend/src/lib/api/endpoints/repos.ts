import { api } from '../client';

export type Repo = {
  id: string;
  owner_id: string;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  default_branch: string;
  language: string | null;
  topics: string[];
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
};

export type CreateRepoRequest = {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  readme?: boolean;
};

export type UpdateRepoRequest = {
  name?: string;
  description?: string;
  private?: boolean;
  default_branch?: string;
  topics?: string[];
};

export type Branch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
};

export type FileEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink';
  size: number;
  sha: string;
  content?: string;
  encoding?: string;
  target?: string;
};

export type Commit = {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: FileEntry[];
};

export const repoApi = {
  list: (params?: { page?: number; per_page?: number; sort?: string; type?: string }) =>
    api.get<Repo[]>('/repos', { params }),

  get: (owner: string, name: string) => api.get<Repo>(`/repos/${owner}/${name}`),

  create: (data: CreateRepoRequest) => api.post<Repo>('/repos', data),

  fork: (owner: string, name: string, organization?: string) =>
    api.post<Repo>(`/repos/${owner}/${name}/forks`, { organization }),

  update: (owner: string, name: string, data: UpdateRepoRequest) =>
    api.patch<Repo>(`/repos/${owner}/${name}`, data),

  delete: (owner: string, name: string) => api.delete<void>(`/repos/${owner}/${name}`),

  getBranches: (owner: string, name: string) =>
    api.get<Branch[]>(`/repos/${owner}/${name}/branches`),

  getBranch: (owner: string, name: string, branch: string) =>
    api.get<Branch>(`/repos/${owner}/${name}/branches/${branch}`),

  getContents: (owner: string, name: string, path: string, ref?: string) =>
    api.get<FileEntry | FileEntry[]>(`/repos/${owner}/${name}/contents/${path}`, {
      params: { ref },
    }),

  createOrUpdateFile: (
    owner: string,
    name: string,
    path: string,
    data: { message: string; content: string; branch?: string; sha?: string }
  ) => api.put<{ content: FileEntry; commit: Commit }>(`/repos/${owner}/${name}/contents/${path}`, data),

  deleteFile: (
    owner: string,
    name: string,
    path: string,
    data: { message: string; sha: string; branch?: string }
  ) => api.delete<{ commit: Commit }>(`/repos/${owner}/${name}/contents/${path}`, { data }),

  getCommits: (owner: string, name: string, params?: { sha?: string; path?: string; page?: number; per_page?: number }) =>
    api.get<Commit[]>(`/repos/${owner}/${name}/commits`, { params }),

  getCommit: (owner: string, name: string, sha: string) =>
    api.get<Commit>(`/repos/${owner}/${name}/commits/${sha}`),

  getReadme: (owner: string, name: string, ref?: string) =>
    api.get<FileEntry>(`/repos/${owner}/${name}/readme`, { params: { ref } }),

  getLanguages: (owner: string, name: string) =>
    api.get<Record<string, number>>(`/repos/${owner}/${name}/languages`),

  getContributors: (owner: string, name: string, params?: { page?: number; per_page?: number }) =>
    api.get(`/repos/${owner}/${name}/contributors`, { params }),

  getTags: (owner: string, name: string) =>
    api.get(`/repos/${owner}/${name}/tags`),

  getReleases: (owner: string, name: string) =>
    api.get(`/repos/${owner}/${name}/releases`),

  getRelease: (owner: string, name: string, tag: string) =>
    api.get(`/repos/${owner}/${name}/releases/tags/${tag}`),

  star: (owner: string, name: string) =>
    api.put<void>(`/repos/${owner}/${name}/star`),

  unstar: (owner: string, name: string) =>
    api.delete<void>(`/repos/${owner}/${name}/star`),

  checkStar: (owner: string, name: string) =>
    api.get<{ starred: boolean }>(`/repos/${owner}/${name}/star`),

  watch: (owner: string, name: string) =>
    api.put<void>(`/repos/${owner}/${name}/watch`),

  unwatch: (owner: string, name: string) =>
    api.delete<void>(`/repos/${owner}/${name}/watch`),
};
