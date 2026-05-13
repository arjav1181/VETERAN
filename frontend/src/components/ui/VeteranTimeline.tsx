import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/dates';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  author?: {
    name: string;
    avatar_url?: string | null;
  };
  actions?: ReactNode;
}

export interface VeteranTimelineProps {
  events: TimelineEvent[];
  className?: string;
  threadable?: boolean;
}

const dotColors = {
  default: 'bg-surface-400 dark:bg-surface-500',
  success: 'bg-green-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

const iconColors = {
  default: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
};

export function VeteranTimeline({ events, className, threadable }: VeteranTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Line */}
            {!isLast && threadable && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-surface-200 dark:bg-surface-700" />
            )}

            {/* Dot / Icon */}
            <div className="relative flex-shrink-0">
              {event.icon ? (
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    iconColors[event.color || 'default']
                  )}
                >
                  {event.icon}
                </div>
              ) : (
                <div
                  className={cn(
                    'w-[10px] h-[10px] mt-2 rounded-full ring-2 ring-[rgb(var(--veteran-bg))]',
                    dotColors[event.color || 'default']
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[rgb(var(--veteran-fg))]">
                    {event.title}
                  </div>
                  {event.description && (
                    <div className="mt-0.5 text-sm text-surface-500">
                      {event.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-surface-400 whitespace-nowrap">
                    {relativeTime(event.timestamp)}
                  </span>
                  {event.actions}
                </div>
              </div>

              {event.author && (
                <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
                  {event.author.avatar_url ? (
                    <img
                      src={event.author.avatar_url}
                      alt={event.author.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-surface-200 dark:bg-surface-700" />
                  )}
                  <span>{event.author.name}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
