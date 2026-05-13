import { api } from '../client';
import type { Repo } from './repos';
import type { Issue } from './issues';
import type { PullRequest } from './pulls';

export type SearchResult<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

export type SearchParams = {
  q: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
};

export const searchApi = {
  repos: (params: SearchParams) =>
    api.get<SearchResult<Repo>>('/search/repos', { params }),

  issues: (params: SearchParams & { state?: 'open' | 'closed' }) =>
    api.get<SearchResult<Issue>>('/search/issues', { params }),

  pulls: (params: SearchParams & { state?: 'open' | 'closed' | 'merged' }) =>
    api.get<SearchResult<PullRequest>>('/search/pulls', { params }),

  code: (params: SearchParams & { repo?: string; path?: string; language?: string }) =>
    api.get<SearchResult<{ name: string; path: string; repo: string; content: string }>>('/search/code', { params }),

  users: (params: SearchParams) =>
    api.get<SearchResult<{ id: string; username: string; name: string; avatar_url: string | null; bio: string | null }>>('/search/users', { params }),

  topics: (params: SearchParams) =>
    api.get<SearchResult<{ name: string; display_name: string; description: string; count: number }>>('/search/topics', { params }),

  labels: (params: SearchParams & { repo?: string }) =>
    api.get<SearchResult<{ id: string; name: string; color: string; description?: string }>>('/search/labels', { params }),

  suggestions: (query: string) =>
    api.get<Array<{ text: string; type: 'repo' | 'user' | 'issue' | 'topic' }>>('/search/suggestions', {
      params: { q: query },
    }),
};
