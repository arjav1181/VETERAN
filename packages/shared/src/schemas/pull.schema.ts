import { z } from 'zod';

export const createPRSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  body: z.string().max(50000, 'Body is too long').optional().default(''),
  head: z.string().min(1, 'Head branch is required'),
  base: z.string().min(1, 'Base branch is required'),
  headRepoId: z.string().uuid().optional().nullable(),
  isDraft: z.boolean().optional().default(false),
  maintainerCanModify: z.boolean().optional().default(true),
  assigneeIds: z.array(z.string().uuid()).optional().default([]),
  labelIds: z.array(z.string().uuid()).optional().default([]),
  milestoneId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

export const updatePRSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().max(50000).optional(),
  state: z.enum(['open', 'closed']).optional(),
  isDraft: z.boolean().optional(),
  base: z.string().min(1).optional(),
  labelIds: z.array(z.string().uuid()).optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  milestoneId: z.string().uuid().optional().nullable(),
});

export const submitReviewSchema = z.object({
  body: z.string().max(10000, 'Review body is too long').optional().default(''),
  event: z.enum(['approved', 'changes_requested', 'commented']),
  commitId: z.string().optional(),
});

export const createReviewCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
  path: z.string().min(1, 'File path is required'),
  position: z.number().int().positive().optional(),
  line: z.number().int().positive().optional(),
  side: z.enum(['LEFT', 'RIGHT']).optional().default('RIGHT'),
  startLine: z.number().int().positive().optional(),
  startSide: z.enum(['LEFT', 'RIGHT']).optional(),
  commitId: z.string().min(1, 'Commit ID is required'),
  inReplyToId: z.string().uuid().optional().nullable(),
});

export const updateReviewCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
});

export const mergePRSchema = z.object({
  commitTitle: z.string().max(500).optional(),
  commitMessage: z.string().max(10000).optional(),
  mergeMethod: z.enum(['merge', 'squash', 'rebase']).optional().default('merge'),
  sha: z.string().optional(),
});

export const updatePRReviewSchema = z.object({
  body: z.string().max(10000).optional(),
});

export const dismissReviewSchema = z.object({
  message: z.string().min(1, 'Dismissal message is required').max(10000),
});

export const enableAutoMergeSchema = z.object({
  mergeMethod: z.enum(['merge', 'squash', 'rebase']),
  commitTitle: z.string().max(500).optional(),
  commitMessage: z.string().max(10000).optional(),
});
