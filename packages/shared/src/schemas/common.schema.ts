import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int('Page must be an integer').min(1, 'Page must be at least 1').optional().default(1),
  pageSize: z.coerce.number().int('Page size must be an integer').min(1, 'Page size must be at least 1').max(100, 'Page size must be at most 100').optional().default(30),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug is too long').regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, 'Invalid slug format'),
});

export const ownerRepoSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500, 'Search query is too long'),
  type: z.enum(['repositories', 'issues', 'pull_requests', 'users', 'discussions', 'code']).optional().default('repositories'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
});
