export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  bodyHtml: string | null;
  link: string | null;
  icon: string | null;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  repositoryId: string | null;
  repositoryFullName: string | null;
  senderId: string | null;
  senderUsername: string | null;
  senderAvatar: string | null;
  threadId: string | null;
  threadType: 'issue' | 'pull_request' | 'discussion' | 'commit' | 'release' | null;
  action: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'mention'
  | 'issue_assigned'
  | 'issue_opened'
  | 'issue_closed'
  | 'issue_reopened'
  | 'issue_comment'
  | 'pr_assigned'
  | 'pr_review_requested'
  | 'pr_review_submitted'
  | 'pr_merged'
  | 'pr_comment'
  | 'commit_mention'
  | 'discussion_mention'
  | 'discussion_reply'
  | 'release_published'
  | 'security_alert'
  | 'invitation'
  | 'approval_required'
  | 'deployment'
  | 'workflow_run'
  | 'subscription'
  | 'system'
  | 'admin';

export interface NotificationSubscription {
  id: string;
  userId: string;
  subscribableId: string;
  subscribableType: 'repository' | 'issue' | 'pull_request' | 'discussion' | 'team' | 'organization';
  reason: 'creator' | 'commenter' | 'mentions' | 'assignee' | 'review_requested' | 'security' | 'manual' | 'team_mention';
  isIgnored: boolean;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationBatch {
  id: string;
  userId: string;
  notifications: Notification[];
  type: NotificationType;
  count: number;
  latestAt: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  desktop: boolean;
  digestFrequency: 'immediate' | 'daily' | 'weekly';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  types: Record<NotificationType, boolean>;
}
