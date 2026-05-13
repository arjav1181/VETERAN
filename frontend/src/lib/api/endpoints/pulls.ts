import { api } from '../client';
import type { Issue, Comment } from './issues';
import type { Commit } from './repos';

export type PullRequest = {
  id: string;
  repo_id: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  locked: boolean;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  merge_commit_sha: string | null;
  head: {
    ref: string;
    sha: string;
    repo: { full_name: string };
  };
  base: {
    ref: string;
    sha: string;
    repo: { full_name: string };
  };
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  assignees: Issue['assignees'];
  labels: Issue['labels'];
  milestone: Issue['milestone'];
  requested_reviewers: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>;
  comments_count: number;
  review_comments_count: number;
  commits_count: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merged_by: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

export type CreatePullRequest = {
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
};

export type UpdatePullRequest = {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  base?: string;
};

export type Review = {
  id: string;
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
  body: string | null;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  commit_id: string;
  submitted_at: string;
};

export const pullApi = {
  list: (
    owner: string,
    name: string,
    params?: {
      state?: 'open' | 'closed' | 'all';
      head?: string;
      base?: string;
      sort?: 'created' | 'updated' | 'popularity' | 'long-running';
      direction?: 'asc' | 'desc';
      page?: number;
      per_page?: number;
    }
  ) => api.get<PullRequest[]>(`/repos/${owner}/${name}/pulls`, { params }),

  get: (owner: string, name: string, pullNumber: number) =>
    api.get<PullRequest>(`/repos/${owner}/${name}/pulls/${pullNumber}`),

  create: (owner: string, name: string, data: CreatePullRequest) =>
    api.post<PullRequest>(`/repos/${owner}/${name}/pulls`, data),

  update: (owner: string, name: string, pullNumber: number, data: UpdatePullRequest) =>
    api.patch<PullRequest>(`/repos/${owner}/${name}/pulls/${pullNumber}`, data),

  merge: (owner: string, name: string, pullNumber: number, data?: { merge_method?: 'merge' | 'squash' | 'rebase'; commit_title?: string; commit_message?: string }) =>
    api.put<{ merged: boolean; message: string; sha: string }>(`/repos/${owner}/${name}/pulls/${pullNumber}/merge`, data),

  listCommits: (owner: string, name: string, pullNumber: number) =>
    api.get<Commit[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/commits`),

  listFiles: (owner: string, name: string, pullNumber: number) =>
    api.get(`/repos/${owner}/${name}/pulls/${pullNumber}/files`),

  checkMerge: (owner: string, name: string, pullNumber: number) =>
    api.get<{ mergeable: boolean; merge_state: string }>(`/repos/${owner}/${name}/pulls/${pullNumber}/merge`),

  listReviews: (owner: string, name: string, pullNumber: number) =>
    api.get<Review[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/reviews`),

  createReview: (owner: string, name: string, pullNumber: number, data: { body?: string; event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'; commit_id?: string }) =>
    api.post<Review>(`/repos/${owner}/${name}/pulls/${pullNumber}/reviews`, data),

  listReviewComments: (owner: string, name: string, pullNumber: number, reviewId: string) =>
    api.get<Comment[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/reviews/${reviewId}/comments`),

  listComments: (owner: string, name: string, pullNumber: number) =>
    api.get<Comment[]>(`/repos/${owner}/${name}/pulls/${pullNumber}/comments`),

  createComment: (owner: string, name: string, pullNumber: number, data: { body: string; commit_id?: string; path?: string; position?: number }) =>
    api.post<Comment>(`/repos/${owner}/${name}/pulls/${pullNumber}/comments`, data),

  updateComment: (owner: string, name: string, pullNumber: number, commentId: string, body: string) =>
    api.patch<Comment>(`/repos/${owner}/${name}/pulls/${pullNumber}/comments/${commentId}`, { body }),

  deleteComment: (owner: string, name: string, pullNumber: number, commentId: string) =>
    api.delete<void>(`/repos/${owner}/${name}/pulls/${pullNumber}/comments/${commentId}`),

  requestReviewers: (owner: string, name: string, pullNumber: number, reviewers: string[]) =>
    api.post<{ requested_reviewers: PullRequest['requested_reviewers'] }>(
      `/repos/${owner}/${name}/pulls/${pullNumber}/requested_reviewers`,
      { reviewers }
    ),

  removeRequestedReviewers: (owner: string, name: string, pullNumber: number, reviewers: string[]) =>
    api.delete<void>(`/repos/${owner}/${name}/pulls/${pullNumber}/requested_reviewers`, {
      data: { reviewers },
    }),
};
