import {
  MessageSquare, UserPlus, UserMinus, Tag, Milestone, Lock, Unlock,
  ClosedIssue, IssueOpened, Pin, PinOff, Bookmark, GitCommit,
  ArrowUpFromLine, Pencil, Bell, BellOff, GitPullRequest,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { IssueComment, IssueEvent } from '@/types';

interface IssueTimelineProps {
  comments: IssueComment[];
  events: IssueEvent[];
  loading?: boolean;
  className?: string;
}

function EventIcon({ eventType }: { eventType: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    assigned: <UserPlus size={14} />,
    unassigned: <UserMinus size={14} />,
    labeled: <Tag size={14} />,
    unlabeled: <Tag size={14} />,
    milestoned: <Milestone size={14} />,
    demilestoned: <Milestone size={14} />,
    locked: <Lock size={14} />,
    unlocked: <Unlock size={14} />,
    closed: <ClosedIssue size={14} />,
    reopened: <IssueOpened size={14} />,
    pinned: <Pin size={14} />,
    unpinned: <PinOff size={14} />,
    referenced: <GitCommit size={14} />,
    subscribed: <Bell size={14} />,
    unsubscribed: <BellOff size={14} />,
    renamed: <Pencil size={14} />,
    transferred: <ArrowUpFromLine size={14} />,
  };
  return <>{iconMap[eventType] || <Bookmark size={14} />}</>;
}

function EventRow({ event }: { event: IssueEvent }) {
  const colors: Record<string, string> = {
    closed: 'text-danger', reopened: 'text-success', locked: 'text-warning',
    pinned: 'text-info', assigned: 'text-info', labeled: 'text-success',
    milestoned: 'text-info',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm">
      <div className={cn('shrink-0', colors[event.eventType] || 'text-text-muted')}>
        <EventIcon eventType={event.eventType} />
      </div>
      <div className="flex-1 text-text-muted">
        <span className="font-medium text-text-secondary">{event.actorUsername}</span>{' '}
        {event.eventType === 'assigned' && `assigned ${event.payload?.assignee || ''}`}
        {event.eventType === 'unassigned' && 'unassigned'}
        {event.eventType === 'labeled' && `added ${event.payload?.label || ''} label`}
        {event.eventType === 'unlabeled' && `removed ${event.payload?.label || ''} label`}
        {event.eventType === 'milestoned' && `added to milestone ${event.payload?.milestone || ''}`}
        {event.eventType === 'demilestoned' && `removed from milestone`}
        {event.eventType === 'locked' && 'locked the conversation'}
        {event.eventType === 'unlocked' && 'unlocked the conversation'}
        {event.eventType === 'closed' && 'closed this issue'}
        {event.eventType === 'reopened' && 'reopened this issue'}
        {event.eventType === 'pinned' && 'pinned this issue'}
        {event.eventType === 'unpinned' && 'unpinned this issue'}
        {event.eventType === 'referenced' && 'referenced this issue'}
        {event.eventType === 'subscribed' && 'subscribed'}
        {event.eventType === 'unsubscribed' && 'unsubscribed'}
        {event.eventType === 'renamed' && `changed title from "${event.payload?.from || ''}" to "${event.payload?.to || ''}"`}
        {event.eventType === 'transferred' && `transferred to ${event.payload?.destination || ''}`}
      </div>
      <span className="text-xs text-text-muted shrink-0">{formatRelativeTime(event.createdAt)}</span>
    </div>
  );
}

function CommentCard({ comment }: { comment: IssueComment }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-surface">
        <div className="flex items-center gap-2 text-sm">
          {comment.authorAvatar ? (
            <img src={comment.authorAvatar} alt={comment.authorUsername} className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-white text-2xs font-medium">
              {comment.authorUsername.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-text-primary">{comment.authorUsername}</span>
          {comment.authorIsCollaborator && (
            <span className="px-1.5 py-0.5 text-2xs bg-accent/20 text-accent rounded font-medium">Author</span>
          )}
          <span className="text-text-muted">commented {formatRelativeTime(comment.createdAt)}</span>
          {comment.isEdited && <span className="text-text-muted">(edited)</span>}
        </div>
      </div>
      <div className="px-4 py-3">
        <MarkdownRenderer content={comment.body} />
      </div>
    </div>
  );
}

export function IssueTimeline({ comments, events, loading, className }: IssueTimelineProps) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-surface">
              <div className="h-4 bg-surface rounded animate-pulse w-48" />
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="h-3 bg-surface rounded animate-pulse w-full" />
              <div className="h-3 bg-surface rounded animate-pulse w-3/4" />
              <div className="h-3 bg-surface rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items: { type: 'comment' | 'event'; data: unknown; date: string }[] = [
    ...comments.map(c => ({ type: 'comment' as const, data: c, date: c.createdAt })),
    ...events.map(e => ({ type: 'event' as const, data: e, date: e.createdAt })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={cn('space-y-2', className)}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <MessageSquare size={32} className="mb-2 opacity-50" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        items.map((item, i) => (
          <div key={i}>
            {item.type === 'comment'
              ? <CommentCard comment={item.data as IssueComment} />
              : <EventRow event={item.data as IssueEvent} />
            }
          </div>
        ))
      )}
    </div>
  );
}
