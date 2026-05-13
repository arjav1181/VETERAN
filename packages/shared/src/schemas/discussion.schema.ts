import { z } from 'zod';

export const createDiscussionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  body: z.string().max(50000, 'Body is too long').optional().default(''),
  categoryId: z.string().uuid('Category is required'),
});

export const updateDiscussionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().max(50000).optional(),
  categoryId: z.string().uuid().optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const createDiscussionCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
  replyToId: z.string().uuid().optional().nullable(),
});

export const updateDiscussionCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required').max(50000, 'Comment is too long'),
});

export const markAnswerSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

export const voteDiscussionSchema = z.object({
  vote: z.enum(['up', 'down', 'none']),
});

export const createDiscussionCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
  emoji: z.string().min(1, 'Emoji is required').max(10),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional().default('#0366d6'),
});
