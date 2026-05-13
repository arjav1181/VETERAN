import { api } from '../client';

export type PullRequest = {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string | null;
  state: string;
  isDraft: boolean;
  isMerged: boolean;
  mergeCommitSha: string | null;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  baseSha: string;
  authorId: string;
  additions: number;
  deletions: number;
  fileCount: number;
  mergeable: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
};

export type Review = {
  id: string;
  pullRequestId: string;
  reviewerId: string;
  body: string | null;
  state: string;
  commitSha: string | null;
  submittedAt: string;
};

export type ReviewComment = {
  id: string;
  pullRequestId: string;
  reviewId: string | null;
  authorId: string;
  body: string;
  path: string;
  position: number | null;
  line: number | null;
  commitSha: string;
};

export const pullApi = {
  list: (owner: string, name: string, params?: Record<string, string | number | undefined>) =>
    api.get<PullRequest[]>(`/repos/${owner}/${name}/pulls`, { params }),

  get: (owner: string, name: string, pullNumber: number) =>
    api.get<PullRequest>(`/repos/${owner}/${name}/pulls/${pullNumber}`),

  create: (owner: string, name: string, data: { title: string; head: string; base: string; body?: string; draft?: boolean }) =>
    api.post<PullRequest>(`/repos/${owner}/${name}/pulls`, data),

  update: (owner: string, name: string, pullNumber: number, data: Record<string, unknown>) =>
    api.patch<PullRequest>(`/repos/${owner}/${name}/pulls/${pullNumber}`, data),

  merge: (owner: string, name: string, pullNumber: number, data?: { mergeMethod?: string }) =>
    api.put<{ merged: boolean; sha: string }>(`/repos/${owner}/${name}/pulls/${pullNumber}/merge`, data || {}),

  listCommits: (owner: string, name: string, pullNumber: number) =>
    api.get<unknown[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/commits`),

  listFiles: (owner: string, name: string, pullNumber: number) =>
    api.get<unknown[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/files`),

  listReviews: (owner: string, name: string, pullNumber: number) =>
    api.get<Review[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/reviews`),

  createReview: (owner: string, name: string, pullNumber: number, data: { body?: string; state: string }) =>
    api.post<Review>(`/repos/${owner}/${name}/pulls/${pullNumber}/reviews`, data),

  listComments: (owner: string, name: string, pullNumber: number) =>
    api.get<ReviewComment[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/comments`),
};
