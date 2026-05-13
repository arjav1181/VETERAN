import { api } from '../client';

export type Issue = {
  id: string;
  repo_id: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  locked: boolean;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  assignees: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>;
  labels: Array<{
    id: string;
    name: string;
    color: string;
    description?: string;
  }>;
  milestone: {
    id: string;
    title: string;
    number: number;
  } | null;
  comments_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type CreateIssueRequest = {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
};

export type UpdateIssueRequest = {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  assignees?: string[];
  labels?: string[];
  milestone?: number | null;
};

export type Comment = {
  id: string;
  body: string;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

export type Milestone = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  due_on: string | null;
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
};

export const issueApi = {
  list: (
    owner: string,
    name: string,
    params?: {
      state?: 'open' | 'closed' | 'all';
      labels?: string;
      sort?: 'created' | 'updated' | 'comments';
      direction?: 'asc' | 'desc';
      since?: string;
      page?: number;
      per_page?: number;
      milestone?: number;
      assignee?: string;
    }
  ) => api.get<Issue[]>(`/repos/${owner}/${name}/issues`, { params }),

  get: (owner: string, name: string, issueNumber: number) =>
    api.get<Issue>(`/repos/${owner}/${name}/issues/${issueNumber}`),

  create: (owner: string, name: string, data: CreateIssueRequest) =>
    api.post<Issue>(`/repos/${owner}/${name}/issues`, data),

  update: (owner: string, name: string, issueNumber: number, data: UpdateIssueRequest) =>
    api.patch<Issue>(`/repos/${owner}/${name}/issues/${issueNumber}`, data),

  listComments: (owner: string, name: string, issueNumber: number) =>
    api.get<Comment[]>(`/repos/${owner}/${name}/issues/${issueNumber}/comments`),

  createComment: (owner: string, name: string, issueNumber: number, body: string) =>
    api.post<Comment>(`/repos/${owner}/${name}/issues/${issueNumber}/comments`, { body }),

  updateComment: (owner: string, name: string, issueNumber: number, commentId: string, body: string) =>
    api.patch<Comment>(`/repos/${owner}/${name}/issues/${issueNumber}/comments/${commentId}`, { body }),

  deleteComment: (owner: string, name: string, issueNumber: number, commentId: string) =>
    api.delete<void>(`/repos/${owner}/${name}/issues/${issueNumber}/comments/${commentId}`),

  lock: (owner: string, name: string, issueNumber: number) =>
    api.put<void>(`/repos/${owner}/${name}/issues/${issueNumber}/lock`),

  unlock: (owner: string, name: string, issueNumber: number) =>
    api.delete<void>(`/repos/${owner}/${name}/issues/${issueNumber}/lock`),

  listLabels: (owner: string, name: string) =>
    api.get<Label[]>(`/repos/${owner}/${name}/labels`),

  createLabel: (owner: string, name: string, data: Omit<Label, 'id'>) =>
    api.post<Label>(`/repos/${owner}/${name}/labels`, data),

  updateLabel: (owner: string, name: string, labelId: string, data: Partial<Label>) =>
    api.patch<Label>(`/repos/${owner}/${name}/labels/${labelId}`, data),

  deleteLabel: (owner: string, name: string, labelId: string) =>
    api.delete<void>(`/repos/${owner}/${name}/labels/${labelId}`),

  listMilestones: (owner: string, name: string, state?: 'open' | 'closed' | 'all') =>
    api.get<Milestone[]>(`/repos/${owner}/${name}/milestones`, { params: { state } }),

  createMilestone: (owner: string, name: string, data: Omit<Milestone, 'id' | 'number' | 'open_issues' | 'closed_issues'>) =>
    api.post<Milestone>(`/repos/${owner}/${name}/milestones`, data),

  updateMilestone: (owner: string, name: string, milestoneNumber: number, data: Partial<Milestone>) =>
    api.patch<Milestone>(`/repos/${owner}/${name}/milestones/${milestoneNumber}`, data),

  deleteMilestone: (owner: string, name: string, milestoneNumber: number) =>
    api.delete<void>(`/repos/${owner}/${name}/milestones/${milestoneNumber}`),
};
