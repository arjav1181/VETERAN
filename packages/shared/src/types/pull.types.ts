import type { MergeMethod } from './common.types';

export interface PullRequest {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string;
  bodyHtml: string | null;
  state: 'open' | 'closed' | 'merged';
  isDraft: boolean;
  isLocked: boolean;
  isMergeable: boolean | null;
  mergeableState: 'clean' | 'unstable' | 'has_hooks' | 'unknown' | null;
  mergeCommitSha: string | null;
  mergeMethod: MergeMethod | null;
  mergedById: string | null;
  mergedByUsername: string | null;
  mergedByAvatar: string | null;
  mergedAt: string | null;
  closedById: string | null;
  closedByUsername: string | null;
  closedAt: string | null;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  headRef: string;
  headSha: string;
  headRepoId: string;
  headRepoFullName: string;
  baseRef: string;
  baseSha: string;
  baseRepoId: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commentCount: number;
  reviewCommentCount: number;
  commitCount: number;
  labelIds: string[];
  assigneeIds: string[];
  milestoneId: string | null;
  autoMergeEnabled: boolean;
  autoMergeMethod: MergeMethod | null;
  draftAt: string | null;
  readyForReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PRReview {
  id: string;
  pullRequestId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  body: string;
  bodyHtml: string | null;
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
  commitId: string;
  commitSha: string;
  submittedAt: string | null;
  dismissedAt: string | null;
  dismissedBy: string | null;
  dismissedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PRReviewComment {
  id: string;
  pullRequestId: string;
  reviewId: string | null;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  body: string;
  bodyHtml: string | null;
  path: string;
  position: number | null;
  line: number | null;
  side: 'LEFT' | 'RIGHT';
  startLine: number | null;
  startSide: 'LEFT' | 'RIGHT' | null;
  commitId: string;
  originalCommitId: string;
  inReplyToId: string | null;
  isEdited: boolean;
  isOutdated: boolean;
  isMinimized: boolean;
  minimizedReason: string | null;
  diffHunk: string;
  createdAt: string;
  updatedAt: string;
}

export interface PRReviewEvent {
  id: string;
  reviewId: string;
  eventType: 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
  actorId: string;
  actorUsername: string;
  body: string | null;
  createdAt: string;
}

export interface PRCommit {
  id: string;
  pullRequestId: string;
  commitId: string;
  sha: string;
  shortSha: string;
  message: string;
  messageHeadline: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  authoredAt: string;
  committerName: string;
  committerEmail: string;
  committedAt: string;
  additions: number;
  deletions: number;
  totalChanges: number;
  parentShas: string[];
  order: number;
}

export interface PRCheckResult {
  id: string;
  pullRequestId: string;
  checkRunId: string;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  url: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PullRequestTimelineItem {
  id: string;
  pullRequestId: string;
  eventType: 'review_requested' | 'review_request_removed' | 'ready_for_review' | 'converted_to_draft' | 'auto_merge_enabled' | 'auto_merge_disabled' | 'head_ref_deleted' | 'head_ref_restored' | 'merged' | 'closed' | 'reopened' | 'labeled' | 'unlabeled' | 'assigned' | 'unassigned' | 'milestoned' | 'demilestoned' | 'locked' | 'unlocked' | 'referenced' | 'subscribed' | 'unsubscribed' | 'renamed' | 'transferred';
  actorId: string;
  actorUsername: string;
  actorAvatar: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
