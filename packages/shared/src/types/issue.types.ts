import type { LockReason } from './common.types';

export interface Issue {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string;
  bodyHtml: string | null;
  state: 'open' | 'closed';
  isLocked: boolean;
  lockedReason: LockReason | null;
  isPinned: boolean;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  assigneeIds: string[];
  labelIds: string[];
  milestoneId: string | null;
  commentCount: number;
  reactionCount: number;
  closeById: string | null;
  closeByUsername: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  authorIsCollaborator: boolean;
  body: string;
  bodyHtml: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  isMinimized: boolean;
  minimizedReason: string | null;
  reactionCount: number;
  replyToId: string | null;
  editHistory: IssueCommentEdit[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueCommentEdit {
  id: string;
  commentId: string;
  editorId: string;
  editorUsername: string;
  bodyBefore: string;
  bodyAfter: string;
  editedAt: string;
}

export interface IssueReaction {
  id: string;
  issueId: string | null;
  commentId: string | null;
  userId: string;
  username: string;
  avatarUrl: string | null;
  reaction: 'thumbs_up' | 'thumbs_down' | 'laugh' | 'hooray' | 'confused' | 'heart' | 'rocket' | 'eyes';
  createdAt: string;
}

export interface IssueLabel {
  id: string;
  repositoryId: string;
  name: string;
  description: string | null;
  color: string;
  isDefault: boolean;
  issueCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueMilestone {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description: string | null;
  dueOn: string | null;
  state: 'open' | 'closed';
  openIssueCount: number;
  closedIssueCount: number;
  progress: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueAssignee {
  id: string;
  issueId: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  assignedAt: string;
}

export interface IssueEvent {
  id: string;
  issueId: string;
  eventType: 'closed' | 'reopened' | 'assigned' | 'unassigned' | 'labeled' | 'unlabeled' | 'milestoned' | 'demilestoned' | 'locked' | 'unlocked' | 'renamed' | 'transferred' | 'pinned' | 'unpinned' | 'referenced' | 'subscribed' | 'unsubscribed';
  actorId: string;
  actorUsername: string;
  actorAvatar: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
