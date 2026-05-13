import { z } from 'zod';

export const createRepoSchema = z.object({
  name: z.string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/, 'Repository name can only contain letters, numbers, dots, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable(),
  homepageUrl: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')),
  isPrivate: z.boolean().optional().default(false),
  isTemplate: z.boolean().optional().default(false),
  defaultBranch: z.string().optional().default('main'),
  allowRebaseMerge: z.boolean().optional().default(true),
  allowSquashMerge: z.boolean().optional().default(true),
  allowMergeCommit: z.boolean().optional().default(true),
  deleteBranchOnMerge: z.boolean().optional().default(false),
  hasWiki: z.boolean().optional().default(true),
  hasIssues: z.boolean().optional().default(true),
  hasProjects: z.boolean().optional().default(true),
  hasDiscussions: z.boolean().optional().default(false),
  hasPackages: z.boolean().optional().default(false),
  gitignoreTemplate: z.string().optional(),
  licenseTemplate: z.string().optional(),
  initializeWithReadme: z.boolean().optional().default(false),
  autoInit: z.boolean().optional().default(false),
  organizationId: z.string().uuid().optional().nullable(),
});

export const updateRepoSchema = z.object({
  name: z.string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/, 'Repository name can only contain letters, numbers, dots, hyphens, and underscores')
    .optional(),
  description: z.string().max(500).optional().nullable(),
  homepageUrl: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')),
  isPrivate: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  allowForking: z.boolean().optional(),
  defaultBranch: z.string().min(1).max(255).optional(),
  allowRebaseMerge: z.boolean().optional(),
  allowSquashMerge: z.boolean().optional(),
  allowMergeCommit: z.boolean().optional(),
  deleteBranchOnMerge: z.boolean().optional(),
  hasWiki: z.boolean().optional(),
  hasIssues: z.boolean().optional(),
  hasProjects: z.boolean().optional(),
  hasDiscussions: z.boolean().optional(),
  hasPackages: z.boolean().optional(),
});

export const createBranchSchema = z.object({
  name: z.string()
    .min(1, 'Branch name is required')
    .max(255, 'Branch name must be at most 255 characters')
    .regex(/^(?!\/|.*\.\.|.*@{|.*\\|.*\s).*[^/.]$/, 'Invalid branch name'),
  ref: z.string().min(1, 'Source branch or SHA is required').optional().default('HEAD'),
});

export const createTagSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(255, 'Tag name must be at most 255 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/, 'Invalid tag name'),
  ref: z.string().min(1, 'Source branch or SHA is required').optional().default('HEAD'),
  message: z.string().max(500).optional().nullable(),
});

export const createReleaseSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required'),
  targetCommitish: z.string().min(1).optional().default('HEAD'),
  name: z.string().min(1, 'Release name is required').max(200, 'Release name is too long'),
  body: z.string().max(10000, 'Release body is too long').optional().default(''),
  isPrerelease: z.boolean().optional().default(false),
  isDraft: z.boolean().optional().default(false),
  discussionId: z.string().uuid().optional().nullable(),
});

export const updateReleaseSchema = z.object({
  tagName: z.string().min(1).optional(),
  targetCommitish: z.string().min(1).optional(),
  name: z.string().min(1).max(200).optional(),
  body: z.string().max(10000).optional(),
  isPrerelease: z.boolean().optional(),
  isDraft: z.boolean().optional(),
});

export const addCollaboratorSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  permission: z.enum(['read', 'write', 'admin', 'maintain', 'triage']).optional().default('write'),
});

export const updateCollaboratorSchema = z.object({
  permission: z.enum(['read', 'write', 'admin', 'maintain', 'triage']),
});

export const createRepoTopicSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(50, 'Topic is too long').regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Invalid topic format'),
});

export const forkRepoSchema = z.object({
  organizationId: z.string().uuid().optional().nullable(),
  name: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/)
    .optional(),
  defaultBranchOnly: z.boolean().optional().default(false),
});

export const transferRepoSchema = z.object({
  newOwner: z.string().min(1, 'New owner is required'),
});

export const createBranchProtectionSchema = z.object({
  pattern: z.string().min(1, 'Branch pattern is required'),
  requiredStatusChecks: z.array(z.string()).optional().default([]),
  requiresApprovals: z.boolean().optional().default(false),
  requiredApprovalCount: z.number().int().min(1).max(10).optional().default(1),
  requiresCodeOwnerReview: z.boolean().optional().default(false),
  requiresUpToDate: z.boolean().optional().default(false),
  dismissesStaleReviews: z.boolean().optional().default(false),
  restrictsPushAccess: z.boolean().optional().default(false),
  pushAllowances: z.array(z.string()).optional().default([]),
  restrictsMergeAccess: z.boolean().optional().default(false),
  mergeAllowances: z.array(z.string()).optional().default([]),
  allowsForcePush: z.boolean().optional().default(false),
  allowsDeletions: z.boolean().optional().default(false),
  requiresConversationResolution: z.boolean().optional().default(false),
  requiresSignedCommits: z.boolean().optional().default(false),
  requiresLinearHistory: z.boolean().optional().default(false),
  isAdminEnforced: z.boolean().optional().default(false),
  lockBranch: z.boolean().optional().default(false),
  lockReason: z.string().max(500).optional().nullable(),
});
