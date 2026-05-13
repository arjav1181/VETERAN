import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().max(100, 'Display name must be at most 100 characters').optional().nullable(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().nullable(),
  pronouns: z.string().max(50, 'Pronouns must be at most 50 characters').optional().nullable(),
  websiteUrl: z.string().url('Invalid URL').max(500, 'URL is too long').optional().nullable().or(z.literal('')),
  location: z.string().max(100, 'Location must be at most 100 characters').optional().nullable(),
  company: z.string().max(100, 'Company must be at most 100 characters').optional().nullable(),
  isAvailableForHire: z.boolean().optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['twitter', 'linkedin', 'mastodon', 'youtube', 'twitch', 'bluesky', 'website']),
    url: z.string().url('Invalid social link URL'),
  })).optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1, 'Timezone is required').optional(),
  tabSize: z.number().int().min(2).max(8).optional(),
  editorFontSize: z.number().int().min(10).max(32).optional(),
  editorFontFamily: z.string().min(1).optional(),
  editorWordWrap: z.boolean().optional(),
  editorMinimap: z.boolean().optional(),
  editorLineNumbers: z.enum(['on', 'off', 'relative']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  preferredGitProtocol: z.enum(['ssh', 'https']).optional(),
  defaultBranch: z.string().min(1).max(255).optional(),
});

export const createApiTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(100, 'Token name must be at most 100 characters'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required').max(50, 'Too many scopes'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const addSshKeySchema = z.object({
  title: z.string().min(1, 'Key title is required').max(100, 'Key title must be at most 100 characters'),
  publicKey: z.string().min(1, 'Public key is required').refine(
    (val) => val.startsWith('ssh-rsa') || val.startsWith('ssh-ed25519') || val.startsWith('ecdsa-sha2-nistp256') || val.startsWith('sk-ssh-ed25519') || val.startsWith('sk-ecdsa-sha2-nistp256'),
    'Invalid SSH public key format'
  ),
  isReadOnly: z.boolean().optional().default(false),
});

export const updateEmailPreferencesSchema = z.object({
  type: z.enum(['notification', 'digest', 'marketing', 'security']),
  enabled: z.boolean(),
  frequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
});

export const updateAvatarSchema = z.object({
  avatar: z.instanceof(File).optional().or(z.string()).refine(
    (val) => {
      if (typeof val === 'string') return true;
      return val instanceof File && val.size <= 5 * 1024 * 1024;
    },
    'Avatar must be less than 5MB'
  ),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', { errorMap: () => ({ message: 'Please type DELETE to confirm' }) }),
  password: z.string().min(1, 'Password is required to delete your account'),
});
