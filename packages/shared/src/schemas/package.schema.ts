import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(200, 'Package name is too long').regex(/^[a-zA-Z0-9][a-zA-Z0-9._/-]*[a-zA-Z0-9]$/, 'Invalid package name'),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(['container', 'npm', 'maven', 'pypi', 'rubygems', 'nuget', 'docker', 'deb', 'rpm', 'generic']),
  visibility: z.enum(['public', 'private']).optional().default('private'),
});

export const updatePackageSchema = z.object({
  description: z.string().max(500).optional().nullable(),
  visibility: z.enum(['public', 'private']).optional(),
  isArchived: z.boolean().optional(),
});

export const createPackageVersionSchema = z.object({
  version: z.string().min(1, 'Version string is required').max(100, 'Version string is too long'),
  description: z.string().max(1000).optional().nullable(),
  license: z.string().max(100).optional().nullable(),
  readme: z.string().max(50000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  tags: z.array(z.string().max(50)).optional().default([]),
  isPrerelease: z.boolean().optional().default(false),
  content: z.instanceof(File).optional().or(z.string()),
});
