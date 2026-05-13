import { api } from '../client';

export type Issue = {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string | null;
  state: string;
  isLocked: boolean;
  authorId: string;
  milestoneId: string | null;
  labelsList: string;
  pullRequestId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type CreateIssueRequest = {
  title: string;
  body?: string;
  labels?: string[];
  milestone?: number;
};

export type Comment = {
  id: string;
  issueId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Label = {
  id: string;
  repositoryId: string;
  name: string;
  color: string;
  description?: string;
};

export type Milestone = {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description: string | null;
  state: string;
  dueOn: string | null;
  closedAt: string | null;
};

export const issueApi = {
  list: (owner: string, name: string, params?: Record<string, string | number | undefined>) =>
    api.get<Issue[]>(`/repos/${owner}/${name}/issues`, { params }),

  get: (owner: string, name: string, issueNumber: number) =>
    api.get<Issue>(`/repos/${owner}/${name}/issues/${issueNumber}`),

  create: (owner: string, name: string, data: CreateIssueRequest) =>
    api.post<Issue>(`/repos/${owner}/${name}/issues`, data),

  update: (owner: string, name: string, issueNumber: number, data: Record<string, unknown>) =>
    api.patch<Issue>(`/repos/${owner}/${name}/issues/${issueNumber}`, data),

  listComments: (owner: string, name: string, issueNumber: number) =>
    api.get<Comment[]>(`/repos/${owner}/${name}/issues/${issueNumber}/comments`),

  createComment: (owner: string, name: string, issueNumber: number, body: string) =>
    api.post<Comment>(`/repos/${owner}/${name}/issues/${issueNumber}/comments`, { body }),
};
