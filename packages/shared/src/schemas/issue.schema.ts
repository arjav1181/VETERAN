import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  body: z.string().max(50000, 'Body is too long').optional().default(''),
  assigneeIds: z.array(z.string().uuid()).optional().default([]),
  labelIds: z.array(z.string().uuid()).optional().default([]),
  milestoneId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().max(50000).optional(),
  state: z.enum(['open', 'closed']).optional(),
  isLocked: z.boolean().optional(),
  lockedReason: z.enum(['resolved', 'off_topic', 'too_heated', 'spam']).optional().nullable(),
  isPinned: z.boolean().optional(),
  milestoneId: z.string().uuid().optional().nullable(),
});

export const createIssueCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
  replyToId: z.string().uuid().optional().nullable(),
});

export const updateIssueCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
});

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Label name must be at most 50 characters'),
  description: z.string().max(255).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color (e.g., #FF0000)'),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color').optional(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required').max(100, 'Milestone title must be at most 100 characters'),
  description: z.string().max(1000).optional().nullable(),
  dueOn: z.string().datetime().optional().nullable(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  dueOn: z.string().datetime().optional().nullable(),
  state: z.enum(['open', 'closed']).optional(),
});

export const addIssueReactionSchema = z.object({
  reaction: z.enum(['thumbs_up', 'thumbs_down', 'laugh', 'hooray', 'confused', 'heart', 'rocket', 'eyes']),
});

export const addAssigneeSchema = z.object({
  assigneeId: z.string().uuid('Invalid user ID'),
});
