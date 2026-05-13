import { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationInbox } from '@/components/notifications/NotificationInbox';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@hooks/useNotifications';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

function mapNotification(n: any): any {
  return {
    id: n.id,
    userId: n.userId || n.user_id || '',
    type: n.type || 'mention',
    title: n.subject?.title || n.title || '',
    body: n.body || n.subject?.title || '',
    bodyHtml: n.bodyHtml || n.body_html || null,
    link: n.url || n.link || null,
    icon: n.icon || null,
    isRead: n.read ?? n.isRead ?? !n.unread ?? false,
    isArchived: n.isArchived || n.archived || false,
    isPinned: n.isPinned || false,
    repositoryId: n.repository?.id || n.repositoryId || null,
    repositoryFullName: n.repository?.full_name || n.repositoryFullName || null,
    senderId: n.senderId || n.sender_id || null,
    senderUsername: n.senderUsername || n.sender?.username || null,
    senderAvatar: n.senderAvatar || n.sender?.avatar_url || null,
    threadId: n.threadId || n.thread_id || null,
    threadType: n.threadType || n.subject?.type || null,
    action: n.action || null,
    metadata: n.metadata || null,
    readAt: n.readAt || n.read_at || null,
    archivedAt: n.archivedAt || n.archived_at || null,
    createdAt: n.created_at || n.updatedAt || n.updated_at || '',
    updatedAt: n.updated_at || n.updatedAt || '',
  };
}

export function NotificationsPage() {
  const { data: notifications, isLoading, error } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-accent" />
            <div className="h-7 w-40 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load notifications" description="There was an error loading your notifications." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
        </div>

        <NotificationInbox
          notifications={(notifications ?? []).map(mapNotification)}
          onMarkRead={(id) => markAsRead.mutate(id)}
          onMarkAllRead={() => markAllAsRead.mutate()}
          onArchive={(id) => console.log('Archive:', id)}
        />
      </div>
    </div>
  );
}
