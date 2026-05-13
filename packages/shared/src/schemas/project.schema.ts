import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be at most 100 characters'),
  body: z.string().max(5000, 'Body is too long').optional().nullable(),
  state: z.enum(['open', 'closed']).optional().default('open'),
  isTemplate: z.boolean().optional().default(false),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  body: z.string().max(5000).optional().nullable(),
  state: z.enum(['open', 'closed']).optional(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
});

export const createColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(100, 'Column name must be at most 100 characters'),
  position: z.number().int().min(0).optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

export const createCardSchema = z.object({
  note: z.string().max(5000).optional().nullable(),
  contentId: z.string().uuid().optional().nullable(),
  contentType: z.enum(['issue', 'pull_request']).optional().nullable(),
  position: z.number().int().min(0).optional(),
  columnId: z.string().uuid('Column ID is required'),
});

export const updateCardSchema = z.object({
  note: z.string().max(5000).optional().nullable(),
  position: z.number().int().min(0).optional(),
  columnId: z.string().uuid().optional(),
  isArchived: z.boolean().optional(),
});

export const createProjectViewSchema = z.object({
  name: z.string().min(1).max(100),
  layout: z.enum(['board', 'table', 'timeline']),
  groupBy: z.string().optional().nullable(),
  sortBy: z.string().optional().nullable(),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  filterQuery: z.string().optional().nullable(),
  visibleFields: z.array(z.string()).optional().default([]),
});
