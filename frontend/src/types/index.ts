export type {
  PaginationMeta,
  CursorPaginationMeta,
  ApiResponse,
  ApiError,
  Permission,
  Visibility,
  Role,
  SortDirection,
  MergeMethod,
  LockReason,
  FileUpload,
  Stats,
  CountByState,
  DateRange,
  SearchResult,
} from '@veteran/shared/types/common.types';

export type {
  User,
  UserProfile,
  UserSettings,
  Session,
  SSHKey,
  ApiToken,
  SocialLink,
  EmailPreference,
} from '@veteran/shared/types/user.types';

export type {
  Repository,
  RepoCollaborator,
  Branch,
  BranchProtection,
  Tag,
  Release,
  ReleaseAsset,
  Commit,
  CommitStatus,
  CheckRun,
  CheckSuite,
  Star,
  Watch,
  Fork,
} from '@veteran/shared/types/repo.types';

export type {
  Issue,
  IssueComment,
  IssueReaction,
  IssueLabel,
  IssueMilestone,
  IssueAssignee,
  IssueEvent,
} from '@veteran/shared/types/issue.types';

export type {
  PullRequest,
  PRReview,
  PRReviewComment,
  PRReviewEvent,
  PRCommit,
  PRCheckResult,
  PullRequestTimelineItem,
} from '@veteran/shared/types/pull.types';

export type {
  CIPipeline,
  CIJob,
  CIJobLog,
  CIArtifact,
  CIWorkflow,
  CIRunner,
  PipelineStatus,
  PipelineConclusion,
} from '@veteran/shared/types/ci.types';

export type {
  Project,
  ProjectColumn,
  ProjectCard,
  ProjectView,
} from '@veteran/shared/types/project.types';

export type {
  Discussion,
  DiscussionCategory,
  DiscussionComment,
  DiscussionVote,
} from '@veteran/shared/types/discussion.types';

export type {
  Codespace,
  CodespacePort,
  CodespaceGitStatus,
  CodespaceMachine,
  CodespacePrebuild,
  CodespaceState,
} from '@veteran/shared/types/codespace.types';

export type {
  Notification,
  NotificationSubscription,
  NotificationBatch,
  NotificationPreferences,
  NotificationType,
} from '@veteran/shared/types/notification.types';

export type {
  Organization,
  OrgMember,
  Team,
  TeamMember,
  TeamRepo,
} from '@veteran/shared/types/org.types';

export type {
  SecurityAdvisory,
  SecurityVulnerability,
  SecurityAlert,
  SecretScanningAlert,
  CodeScanningAlert,
  DependabotAlert,
} from '@veteran/shared/types/security.types';

export type {
  WikiPage,
  WikiPageRevision,
} from '@veteran/shared/types/wiki.types';

export type {
  Package,
  PackageVersion,
} from '@veteran/shared/types/package.types';

export type {
  Webhook,
  WebhookDelivery,
} from '@veteran/shared/types/webhook.types';

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  mode: string;
  sha: string;
  content?: string;
  target?: string;
}

export interface DiffFile {
  sha: string;
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'changed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  blobUrl: string;
  rawUrl: string;
  contentsUrl: string;
  previousFilename?: string;
}

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
  mode: string;
}

export interface BlameLine {
  sha: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  authoredAt: string;
  committerName: string;
  committerEmail: string;
  committedAt: string;
  message: string;
  lineNumber: number;
  content: string;
}

export interface CommitGroup {
  date: string;
  label: string;
  commits: import('@veteran/shared/types/repo.types').Commit[];
}

export interface MergeBoxState {
  mergeMethod: 'merge' | 'squash' | 'rebase';
  commitMessage: string;
  commitDescription: string;
  deleteBranch: boolean;
  autoMerge: boolean;
  mergeTitle: string;
  mergeBody: string;
}
