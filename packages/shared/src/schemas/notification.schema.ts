import { z } from 'zod';

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const markAllReadSchema = z.object({
  beforeId: z.string().uuid().optional(),
  type: z.string().optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
  desktop: z.boolean().optional(),
  digestFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format').optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format').optional(),
});

export const subscribeSchema = z.object({
  subscribableId: z.string().uuid('Invalid subscribable ID'),
  subscribableType: z.enum(['repository', 'issue', 'pull_request', 'discussion', 'team', 'organization']),
  reason: z.enum(['creator', 'commenter', 'mentions', 'assignee', 'review_requested', 'security', 'manual', 'team_mention']).optional().default('manual'),
});

export const unsubscribeSchema = z.object({
  subscribableId: z.string().uuid('Invalid subscribable ID'),
  subscribableType: z.enum(['repository', 'issue', 'pull_request', 'discussion', 'team', 'organization']),
});
