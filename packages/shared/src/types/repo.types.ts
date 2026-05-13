import type { Permission, Visibility } from './common.types';

export interface Repository {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  fullName: string;
  description: string | null;
  homepageUrl: string | null;
  language: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  isDisabled: boolean;
  isMirror: boolean;
  isTemplate: boolean;
  isEmpty: boolean;
  visibility: Visibility;
  defaultBranch: string;
  defaultBranchRef: string | null;
  topics: string[];
  starCount: number;
  forkCount: number;
  watchCount: number;
  openIssueCount: number;
  openPullCount: number;
  diskUsage: number;
  size: number;
  license: string | null;
  codeOfConduct: string | null;
  securityPolicy: string | null;
  allowForking: boolean;
  allowRebaseMerge: boolean;
  allowSquashMerge: boolean;
  allowMergeCommit: boolean;
  deleteBranchOnMerge: boolean;
  hasWiki: boolean;
  hasIssues: boolean;
  hasProjects: boolean;
  hasDiscussions: boolean;
  hasPackages: boolean;
  hasDownloads: boolean;
  parentId: string | null;
  parentFullName: string | null;
  sourceId: string | null;
  sourceFullName: string | null;
  mirrorUrl: string | null;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepoCollaborator {
  id: string;
  repositoryId: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  permission: Permission;
  roleName: string;
  isPending: boolean;
  invitedAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepoTopic {
  id: string;
  repositoryId: string;
  topic: string;
  description: string | null;
  displayName: string | null;
  createdAt: string;
}

export interface Branch {
  id: string;
  repositoryId: string;
  name: string;
  ref: string;
  sha: string;
  commitMessage: string | null;
  committerName: string | null;
  committerAvatar: string | null;
  isProtected: boolean;
  isDefault: boolean;
  behindBy: number;
  aheadBy: number;
  lastCommitAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchProtection {
  id: string;
  repositoryId: string;
  pattern: string;
  requiredStatusChecks: string[];
  requiresApprovals: boolean;
  requiredApprovalCount: number;
  requiresCodeOwnerReview: boolean;
  requiresUpToDate: boolean;
  dismissesStaleReviews: boolean;
  restrictsPushAccess: boolean;
  pushAllowances: string[];
  restrictsMergeAccess: boolean;
  mergeAllowances: string[];
  allowsForcePush: boolean;
  allowsDeletions: boolean;
  requiresConversationResolution: boolean;
  requiresSignedCommits: boolean;
  requiresLinearHistory: boolean;
  isAdminEnforced: boolean;
  lockBranch: boolean;
  lockReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  repositoryId: string;
  name: string;
  ref: string;
  sha: string;
  message: string | null;
  taggerName: string;
  taggerEmail: string;
  taggerAvatar: string | null;
  commitSha: string;
  commitMessage: string;
  createdAt: string;
}

export interface Release {
  id: string;
  repositoryId: string;
  tagName: string;
  targetCommitish: string;
  name: string;
  body: string;
  bodyHtml: string | null;
  isPrerelease: boolean;
  isDraft: boolean;
  isLatest: boolean;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  discussionId: string | null;
  assetCount: number;
  downloadCount: number;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ReleaseAsset {
  id: string;
  releaseId: string;
  name: string;
  label: string | null;
  mimeType: string;
  size: number;
  downloadCount: number;
  state: 'uploaded' | 'pending';
  contentType: string;
  url: string;
  downloadUrl: string;
  uploaderId: string;
  uploaderUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commit {
  id: string;
  repositoryId: string;
  sha: string;
  shortSha: string;
  message: string;
  messageHeadline: string;
  messageBody: string | null;
  authorId: string | null;
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  committerName: string;
  committerEmail: string;
  committerAvatar: string | null;
  authoredAt: string;
  committedAt: string;
  parentShas: string[];
  treeSha: string;
  isVerified: boolean;
  verificationSignature: string | null;
  verificationPayload: string | null;
  verificationSigner: string | null;
  verificationIdentity: string | null;
  additions: number;
  deletions: number;
  totalChanges: number;
  fileCount: number;
  branchNames: string[];
  tagNames: string[];
  createdAt: string;
}

export interface CommitStatus {
  id: string;
  commitId: string;
  repositoryId: string;
  state: 'pending' | 'success' | 'failure' | 'error';
  context: string;
  description: string | null;
  targetUrl: string | null;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckRun {
  id: string;
  repositoryId: string;
  commitSha: string;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  startedAt: string | null;
  completedAt: string | null;
  detailsUrl: string | null;
  externalId: string | null;
  outputTitle: string | null;
  outputSummary: string | null;
  outputText: string | null;
  annotationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckSuite {
  id: string;
  repositoryId: string;
  commitSha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  beforeSha: string | null;
  afterSha: string;
  headBranch: string | null;
  checkRuns: CheckRun[];
  createdAt: string;
  updatedAt: string;
}

export interface Star {
  id: string;
  userId: string;
  repositoryId: string;
  createdAt: string;
}

export interface Watch {
  id: string;
  userId: string;
  repositoryId: string;
  subscriptionType: 'all' | 'participating' | 'ignore';
  createdAt: string;
  updatedAt: string;
}

export interface Fork {
  id: string;
  repositoryId: string;
  forkOwnerId: string;
  forkOwnerUsername: string;
  forkOwnerAvatar: string | null;
  forkName: string;
  forkFullName: string;
  createdAt: string;
}
