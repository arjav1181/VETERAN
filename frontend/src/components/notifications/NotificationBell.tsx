import { useState, useRef, useEffect } from 'react';
import { Bell, BellDot, CheckCheck, Settings } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

interface NotificationBellProps {
  count: number;
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettings?: () => void;
  className?: string;
}

export function NotificationBell({
  count, notifications, onMarkRead, onMarkAllRead, onNotificationClick, onSettings, className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface/80 transition-colors"
      >
        {count > 0 ? <BellDot size={18} className="text-accent" /> : <Bell size={18} />}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-2xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button onClick={onMarkAllRead} className="p-1 text-text-muted hover:text-text-primary rounded transition-colors" title="Mark all as read">
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={onSettings} className="p-1 text-text-muted hover:text-text-primary rounded transition-colors" title="Notification settings">
                <Settings size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-text-muted">
                <Bell size={32} className="mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs">No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notif => (
                <button
                  key={notif.id}
                  onClick={() => { onNotificationClick?.(notif); if (!notif.isRead) onMarkRead?.(notif.id); }}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface/60 transition-colors border-b border-border/50',
                    !notif.isRead && 'bg-accent/5'
                  )}
                >
                  {!notif.isRead && <div className="w-2 h-2 bg-accent rounded-full mt-1.5 shrink-0" />}
                  {notif.isRead && <div className="w-2 h-2 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notif.senderAvatar ? (
                        <img src={notif.senderAvatar} alt={notif.senderUsername || ''} className="w-5 h-5 rounded-full shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-brand-700 shrink-0" />
                      )}
                      <span className={cn('text-xs', !notif.isRead ? 'text-text-primary font-medium' : 'text-text-secondary')}>{notif.title}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{notif.body}</p>
                    <span className="text-2xs text-text-muted mt-0.5 block">{formatRelativeTime(notif.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border text-center">
            <button className="text-xs text-info hover:text-info/80 transition-colors">View all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}
