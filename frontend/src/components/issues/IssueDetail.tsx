import { useState } from 'react';
import {
  IssueOpened, IssueClosed, Lock, Unlock, Pin, PinOff, ArrowUpFromLine,
  MessageSquare, Bell, BellOff, Link, SmilePlus, ThumbsUp, ThumbsDown,
  Laugh, Heart, Rocket, Eye, Share2, Edit3, MoreHorizontal,
} from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { Issue, IssueLabel, IssueMilestone, IssueReaction } from '@/types';

interface IssueDetailProps {
  issue: Issue;
  labels: IssueLabel[];
  milestone?: IssueMilestone | null;
  onTitleEdit?: (title: string) => void;
  onStateToggle?: () => void;
  onLockToggle?: () => void;
  onPinToggle?: () => void;
  onTransfer?: () => void;
  onSubscribe?: () => void;
  onReaction?: (reaction: string) => void;
  className?: string;
}

const REACTIONS = [
  { key: 'thumbs_up', icon: ThumbsUp, label: '+1' },
  { key: 'thumbs_down', icon: ThumbsDown, label: '-1' },
  { key: 'laugh', icon: Laugh, label: 'Laugh' },
  { key: 'hooray', icon: Rocket, label: 'Hooray' },
  { key: 'confused', icon: Eye, label: 'Confused' },
  { key: 'heart', icon: Heart, label: 'Heart' },
];

export function IssueDetail({
  issue, labels, milestone, onTitleEdit, onStateToggle,
  onLockToggle, onPinToggle, onTransfer, onSubscribe, onReaction, className,
}: IssueDetailProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(issue.title);
  const [showReactions, setShowReactions] = useState(false);

  const handleTitleSubmit = () => {
    if (titleDraft.trim() && titleDraft !== issue.title) {
      onTitleEdit?.(titleDraft);
    }
    setEditingTitle(false);
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6', className)}>
      <div className="min-w-0">
        <div className="mb-4">
          {editingTitle ? (
            <div className="flex gap-2">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') setEditingTitle(false); }}
                className="flex-1 px-3 py-2 bg-primary-dark border border-border rounded-lg text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
              <button onClick={handleTitleSubmit} className="px-3 py-2 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">Save</button>
              <button onClick={() => { setEditingTitle(false); setTitleDraft(issue.title); }} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface/80 transition-colors">Cancel</button>
            </div>
          ) : (
            <h1
              className="text-xl font-semibold text-text-primary cursor-pointer hover:text-accent transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {issue.title}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
            <span className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              issue.state === 'open' ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'
            )}>
              {issue.state === 'open' ? <IssueOpened size={14} /> : <IssueClosed size={14} />}
              {issue.state}
            </span>
            <span>{issue.authorUsername} opened this issue {formatRelativeTime(issue.createdAt)}</span>
            <span>· {issue.commentCount} comments</span>
          </div>
        </div>

        <div className="bg-primary-dark border border-border rounded-lg p-4 mb-4">
          <MarkdownRenderer content={issue.body} />

          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-text-primary rounded-md hover:bg-surface transition-colors"
              >
                <SmilePlus size={14} /> React
              </button>
              {showReactions && (
                <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-surface border border-border rounded-lg p-1.5 shadow-xl animate-scale-in">
                  {REACTIONS.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => { onReaction?.(key); setShowReactions(false); }}
                      className="p-1.5 rounded-md hover:bg-surface/80 text-text-secondary hover:text-text-primary transition-colors"
                      title={label}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onSubscribe} className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-text-primary rounded-md hover:bg-surface transition-colors">
              <Bell size={14} /> Subscribe
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-text-primary rounded-md hover:bg-surface transition-colors">
              <Link size={14} /> Copy link
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Labels</h4>
            <div className="flex flex-wrap gap-1.5">
              {issue.labelIds.length > 0 ? issue.labelIds.map(lid => {
                const label = labels.find(l => l.id === lid);
                return label ? (
                  <span
                    key={lid}
                    className="px-2 py-0.5 text-2xs font-medium rounded-full"
                    style={{ backgroundColor: `${label.color}20`, color: label.color }}
                  >
                    {label.name}
                  </span>
                ) : null;
              }) : <span className="text-xs text-text-muted">None yet</span>}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Assignees</h4>
            <div className="text-xs text-text-muted">None yet</div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Milestone</h4>
            {milestone ? (
              <div className="text-xs text-text-primary">{milestone.title}</div>
            ) : (
              <span className="text-xs text-text-muted">No milestone</span>
            )}
          </div>

          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Projects</h4>
            <span className="text-xs text-text-muted">None yet</span>
          </div>

          <div className="pt-2 border-t border-border space-y-1">
            <button onClick={onLockToggle} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface/80 rounded-md transition-colors">
              {issue.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              {issue.isLocked ? 'Unlock conversation' : 'Lock conversation'}
            </button>
            <button onClick={onPinToggle} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface/80 rounded-md transition-colors">
              {issue.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
              {issue.isPinned ? 'Unpin issue' : 'Pin issue'}
            </button>
            <button onClick={onTransfer} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface/80 rounded-md transition-colors">
              <ArrowUpFromLine size={12} /> Transfer to repo
            </button>
          </div>

          <div className="pt-2 border-t border-border">
            <button
              onClick={onStateToggle}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                issue.state === 'open'
                  ? 'bg-danger/20 text-danger hover:bg-danger/30'
                  : 'bg-success/20 text-success hover:bg-success/30'
              )}
            >
              {issue.state === 'open' ? <IssueClosed size={16} /> : <IssueOpened size={16} />}
              {issue.state === 'open' ? 'Close issue' : 'Reopen issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
