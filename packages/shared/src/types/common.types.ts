export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMeta {
  cursor: string | null;
  nextCursor: string | null;
  hasNextPage: boolean;
  totalCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: PaginationMeta | CursorPaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string;
}

export type Permission = 'read' | 'write' | 'admin' | 'maintain' | 'triage';

export type Visibility = 'public' | 'private' | 'internal';

export type Role = 'owner' | 'admin' | 'member' | 'collaborator' | 'contributor';

export type SortDirection = 'asc' | 'desc';

export type MergeMethod = 'merge' | 'squash' | 'rebase';

export type LockReason = 'resolved' | 'off_topic' | 'too_heated' | 'spam';

export interface FileUpload {
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface Link {
  rel: string;
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CountByState {
  open: number;
  closed: number;
  merged?: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface Stats {
  additions: number;
  deletions: number;
  total: number;
}
