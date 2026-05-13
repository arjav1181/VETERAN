import { useState, useMemo } from 'react';
import {
  Bell, CheckCheck, Archive, ArchiveRestore, Settings, Search,
  Filter, Inbox, Eye, EyeOff, ChevronDown,
} from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import type { Notification } from '@/types';

interface NotificationInboxProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onArchive?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <div className="w-2 h-2 bg-surface rounded-full mt-1.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-surface rounded-full" />
              <div className="h-3 bg-surface rounded animate-pulse w-1/3" />
            </div>
            <div className="h-3 bg-surface rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <Inbox size={48} className="mb-4 opacity-30" />
      <p className="text-lg font-medium text-text-primary mb-1">All caught up!</p>
      <p className="text-sm">No notifications to show</p>
    </div>
  );
}

export function NotificationInbox({
  notifications, loading, onMarkRead, onMarkAllRead, onArchive, onNotificationClick, className,
}: NotificationInboxProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('unread');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = notifications;
    if (filter === 'unread') result = result.filter(n => !n.isRead);
    if (filter === 'archived') result = result.filter(n => n.isArchived);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) ||
        n.repositoryFullName?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, filter, search]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          <div className="flex items-center gap-2">
            {onMarkAllRead && notifications.some(n => !n.isRead) && (
              <button onClick={onMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />

        <div className="flex items-center gap-2">
          <div className="flex bg-surface rounded-lg border border-border p-0.5">
            {(['all', 'unread', 'archived'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                  filter === f ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-border/50">
          {filtered.map(notif => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer group',
                !notif.isRead && 'bg-accent/[0.02]'
              )}
              onClick={() => { onNotificationClick?.(notif); if (!notif.isRead) onMarkRead?.(notif.id); }}
            >
              <div className="pt-1">
                {!notif.isRead ? (
                  <div className="w-2 h-2 bg-accent rounded-full" />
                ) : (
                  <div className="w-2 h-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {notif.senderAvatar ? (
                    <img src={notif.senderAvatar} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-surface" />
                  )}
                  <span className={cn('text-sm', !notif.isRead ? 'text-text-primary font-medium' : 'text-text-secondary')}>
                    {notif.title}
                  </span>
                  {notif.repositoryFullName && (
                    <span className="text-xs text-text-muted">{notif.repositoryFullName}</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.body}</p>
                <span className="text-2xs text-text-muted mt-0.5 block" title={formatAbsoluteTime(notif.createdAt)}>
                  {formatRelativeTime(notif.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!notif.isRead && onMarkRead && (
                  <button onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
                    className="p-1 text-text-muted hover:text-text-primary rounded transition-colors" title="Mark read">
                    <Eye size={14} />
                  </button>
                )}
                {onArchive && (
                  <button onClick={(e) => { e.stopPropagation(); onArchive(notif.id); }}
                    className="p-1 text-text-muted hover:text-text-primary rounded transition-colors" title={notif.isArchived ? 'Unarchive' : 'Archive'}>
                    {notif.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
