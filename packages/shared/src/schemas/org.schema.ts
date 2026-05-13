import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, 'Organization name can only contain letters, numbers, and hyphens'),
  displayName: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  websiteUrl: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')),
  location: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  defaultRepoPermission: z.enum(['read', 'write', 'admin']).optional().default('read'),
});

export const updateOrgSchema = z.object({
  displayName: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  websiteUrl: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')),
  location: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  defaultRepoPermission: z.enum(['read', 'write', 'admin']).optional(),
  billingEmail: z.string().email('Invalid email').optional().nullable(),
});

export const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'Team name is required')
    .max(100, 'Team name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, 'Team name can only contain letters, numbers, and hyphens'),
  description: z.string().max(500).optional().nullable(),
  visibility: z.enum(['public', 'private']).optional().default('private'),
  parentTeamId: z.string().uuid().optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)
    .optional(),
  description: z.string().max(500).optional().nullable(),
  visibility: z.enum(['public', 'private']).optional(),
  parentTeamId: z.string().uuid().optional().nullable(),
});

export const inviteMemberSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['admin', 'member']).optional().default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export const addTeamMemberSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['maintainer', 'member']).optional().default('member'),
});

export const updateTeamMemberSchema = z.object({
  role: z.enum(['maintainer', 'member']),
});

export const addTeamRepoSchema = z.object({
  repositoryId: z.string().uuid('Invalid repository ID'),
  permission: z.enum(['read', 'write', 'admin', 'maintain', 'triage']).optional().default('write'),
});

export const updateTeamRepoSchema = z.object({
  permission: z.enum(['read', 'write', 'admin', 'maintain', 'triage']),
});
