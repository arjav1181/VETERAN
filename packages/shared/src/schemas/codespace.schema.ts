import { z } from 'zod';

export const createCodespaceSchema = z.object({
  repositoryId: z.string().uuid('Repository ID is required'),
  branchName: z.string().min(1, 'Branch name is required').optional().default('main'),
  commitSha: z.string().optional(),
  displayName: z.string().max(100).optional(),
  machineType: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional().default('basic'),
  location: z.string().optional().default('us-east'),
  idleTimeoutMinutes: z.number().int().min(5).max(240).optional().default(30),
  maxLifetimeMinutes: z.number().int().min(60).max(43200).optional().default(480),
  image: z.string().optional(),
  features: z.record(z.string(), z.string()).optional().default({}),
});

export const updateCodespaceSchema = z.object({
  displayName: z.string().max(100).optional(),
  machineType: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
  idleTimeoutMinutes: z.number().int().min(5).max(240).optional(),
  features: z.record(z.string(), z.string()).optional(),
});

export const startCodespaceSchema = z.object({});

export const stopCodespaceSchema = z.object({});

export const deleteCodespaceSchema = z.object({});

export const addCodespacePortSchema = z.object({
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  protocol: z.enum(['http', 'https']).optional().default('http'),
  visibility: z.enum(['public', 'private', 'org']).optional().default('private'),
  label: z.string().max(100).optional().nullable(),
});

export const updateCodespacePortSchema = z.object({
  visibility: z.enum(['public', 'private', 'org']).optional(),
  label: z.string().max(100).optional().nullable(),
});
