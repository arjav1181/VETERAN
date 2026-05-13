import { z } from 'zod';

export const updateAdminSettingsSchema = z.object({
  platformName: z.string().min(1).max(100).optional(),
  platformUrl: z.string().url('Invalid URL').max(500).optional(),
  platformEmail: z.string().email('Invalid email').optional(),
  allowRegistrations: z.boolean().optional(),
  allowPasswordAuth: z.boolean().optional(),
  allowOAuth: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  requireTwoFactor: z.boolean().optional(),
  defaultRepoVisibility: z.enum(['public', 'private']).optional(),
  defaultUserRole: z.enum(['user', 'admin']).optional(),
  maxReposPerUser: z.number().int().min(-1).max(100000).optional(),
  maxOrgsPerUser: z.number().int().min(-1).max(1000).optional(),
  maxTeamSize: z.number().int().min(1).max(10000).optional(),
  maxUploadSize: z.number().int().min(1).max(1073741824).optional(),
  maxFileSize: z.number().int().min(1).max(524288000).optional(),
  allowedFileExtensions: z.string().optional().nullable(),
  blockedFileExtensions: z.array(z.string()).optional(),
  allowedDomains: z.array(z.string()).optional(),
  blockedDomains: z.array(z.string()).optional(),
  sessionTimeout: z.number().int().min(60).max(86400 * 30).optional(),
  rateLimitEnabled: z.boolean().optional(),
  rateLimitRequests: z.number().int().min(1).max(100000).optional(),
  rateLimitWindow: z.number().int().min(1).max(3600).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(1000).optional().nullable(),
  termsOfServiceUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
  privacyPolicyUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
  customCss: z.string().max(50000).optional().nullable(),
  customJs: z.string().max(50000).optional().nullable(),
  registrationMessage: z.string().max(1000).optional().nullable(),
  signInMessage: z.string().max(1000).optional().nullable(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body must be at most 10000 characters'),
  severity: z.enum(['info', 'warning', 'danger', 'success']).optional().default('info'),
  isDismissible: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  severity: z.enum(['info', 'warning', 'danger', 'success']).optional(),
  isActive: z.boolean().optional(),
  isDismissible: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Action is required').max(500),
  resourceType: z.string().min(1).max(100),
  resourceId: z.string().min(1),
  resourceName: z.string().max(500).optional().nullable(),
  targetId: z.string().optional().nullable(),
  targetType: z.string().max(100).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional().default('info'),
});

export const auditLogSearchSchema = z.object({
  actorUsername: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
});
