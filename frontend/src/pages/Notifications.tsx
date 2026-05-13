import { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationInbox } from '@/components/notifications/NotificationInbox';
import type { Notification } from '@/types';

const MOCK_NOTIFICATIONS: Notification[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `notif-${i}`,
  userId: 'u1',
  type: (['mention', 'issue_assigned', 'pr_review_requested', 'pr_merged', 'security_alert'] as const)[i % 5],
  title: [
    '@jane-dev mentioned you in issue #101',
    'You were assigned to issue #102',
    'Review requested on PR #201',
    'PR #202 was merged to main',
    'Security alert: Dependabot found vulnerability',
  ][i % 5],
  body: [
    'Hey team, can someone look at this?',
    'Fix login redirect loop',
    'Implement new authentication flow',
    'Update API documentation',
    'lodash prototype pollution',
  ][i % 5],
  bodyHtml: null,
  link: null,
  icon: null,
  isRead: i >= 10,
  isArchived: i >= 20,
  isPinned: false,
  repositoryId: i < 15 ? 'repo-1' : 'repo-2',
  repositoryFullName: i < 15 ? 'owner/repo-1' : 'owner/repo-2',
  senderId: 'u2',
  senderUsername: ['jane-dev', 'john-doe', 'alice'][i % 3],
  senderAvatar: null,
  threadId: null,
  threadType: i % 3 === 0 ? 'issue' : i % 3 === 1 ? 'pull_request' : 'commit',
  action: null,
  metadata: null,
  readAt: i >= 10 ? new Date(Date.now() - i * 3600000).toISOString() : null,
  archivedAt: i >= 20 ? new Date(Date.now() - i * 3600000).toISOString() : null,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export function NotificationsPage() {
  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
        </div>

        <NotificationInbox
          notifications={MOCK_NOTIFICATIONS}
          onMarkRead={(id) => console.log('Mark read:', id)}
          onMarkAllRead={() => console.log('Mark all read')}
          onArchive={(id) => console.log('Archive:', id)}
        />
      </div>
    </div>
  );
}
