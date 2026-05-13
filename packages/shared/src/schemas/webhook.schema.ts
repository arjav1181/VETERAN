import { z } from 'zod';

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').max(2000, 'URL is too long'),
  contentType: z.enum(['json', 'form']).optional().default('json'),
  secret: z.string().max(500).optional().nullable(),
  events: z.array(z.string()).min(1, 'At least one event is required').max(50, 'Too many events'),
  isActive: z.boolean().optional().default(true),
  isInsecureSsl: z.boolean().optional().default(false),
});

export const updateWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').max(2000).optional(),
  contentType: z.enum(['json', 'form']).optional(),
  secret: z.string().max(500).optional().nullable(),
  events: z.array(z.string()).min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  isInsecureSsl: z.boolean().optional(),
});

export const redeliverWebhookSchema = z.object({
  deliveryId: z.string().uuid('Invalid delivery ID'),
});
