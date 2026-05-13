import { useState } from 'react';
import {
  GitPullRequest, GitMerge, GitPullRequestClosed, MessageSquare,
  CheckCircle, XCircle, AlertTriangle, Clock, User, Tag,
  Milestone, BarChart3, Link,
} from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { MergeBox } from './MergeBox';
import { ReviewBox } from './ReviewBox';
import type { PullRequest, PRReview, PRCommit, PullRequestTimelineItem } from '@/types';
import type { MergeBoxState, PRCheckResult } from '@/types';

interface PRDetailProps {
  pull: PullRequest;
  commits?: PRCommit[];
  reviews?: PRReview[];
  checks?: PRCheckResult[];
  timeline?: PullRequestTimelineItem[];
  onMerge?: (data: MergeBoxState) => void;
  onReview?: (body: string, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT') => void;
  onUpdateBranch?: () => void;
  loading?: boolean;
  className?: string;
}

export function PRDetail({
  pull, commits, reviews, checks, timeline, onMerge, onReview, onUpdateBranch, loading, className,
}: PRDetailProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'commits' | 'checks'>('conversation');

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-8 bg-surface rounded animate-pulse w-3/4" />
        <div className="h-4 bg-surface rounded animate-pulse w-1/2" />
        <div className="h-32 bg-surface rounded animate-pulse" />
      </div>
    );
  }

  const statusIcon = pull.state === 'merged' ? GitMerge :
    pull.state === 'closed' ? GitPullRequestClosed : GitPullRequest;
  const statusColor = pull.state === 'merged' ? 'text-purple-400' :
    pull.state === 'closed' ? 'text-text-muted' : 'text-success';

  const checksPassed = checks?.filter(c => c.conclusion === 'success').length || 0;
  const checksFailed = checks?.filter(c => c.conclusion === 'failure').length || 0;
  const checksPending = checks?.filter(c => c.status !== 'completed').length || 0;

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6', className)}>
      <div className="min-w-0">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <statusIcon size={24} className={cn(statusColor)} />
            <h1 className="text-xl font-semibold text-text-primary">{pull.title}</h1>
            {pull.isDraft && (
              <span className="px-2 py-0.5 text-xs bg-text-muted/20 text-text-muted rounded font-medium">Draft</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-text-muted flex-wrap">
            <span className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              pull.state === 'open' && 'bg-success/20 text-success',
              pull.state === 'merged' && 'bg-purple-500/20 text-purple-400',
              pull.state === 'closed' && 'bg-text-muted/20 text-text-muted',
            )}>
              <statusIcon size={12} />
              {pull.state}
            </span>
            <span>{pull.authorUsername} wants to merge {pull.commitCount} commits into <code className="text-text-secondary">{pull.baseRef}</code> from <code className="text-text-secondary">{pull.headRef}</code></span>
            {pull.createdAt && <span>opened {formatRelativeTime(pull.createdAt)}</span>}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs">
            {checks && checks.length > 0 && (
              <div className="flex items-center gap-2">
                {checksPassed > 0 && <span className="flex items-center gap-1 text-success"><CheckCircle size={12} />{checksPassed} passed</span>}
                {checksFailed > 0 && <span className="flex items-center gap-1 text-danger"><XCircle size={12} />{checksFailed} failed</span>}
                {checksPending > 0 && <span className="flex items-center gap-1 text-warning"><Clock size={12} />{checksPending} pending</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex border-b border-border mb-4">
          {(['conversation', 'commits', 'checks'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors relative capitalize',
                activeTab === tab ? 'text-accent' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {tab}
              {tab === 'conversation' && ` (${pull.commentCount + pull.reviewCommentCount})`}
              {tab === 'commits' && ` (${pull.commitCount})`}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>

        {activeTab === 'conversation' && (
          <div className="space-y-4">
            <div className="bg-primary-dark border border-border rounded-lg p-4">
              <MarkdownRenderer content={pull.body} />
            </div>

            {timeline?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted border border-border rounded-lg bg-surface/30">
                <span className="font-medium text-text-secondary">{item.actorUsername}</span>
                {item.eventType === 'merged' && 'merged this pull request'}
                {item.eventType === 'closed' && 'closed this pull request'}
                {item.eventType === 'reopened' && 'reopened this pull request'}
                {item.eventType === 'review_requested' && `requested review from ${item.payload?.requestedReviewer || ''}`}
                <span>{formatRelativeTime(item.createdAt)}</span>
              </div>
            ))}

            {onReview && (
              <ReviewBox onSubmit={onReview} />
            )}
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="border border-border rounded-lg divide-y divide-border/50">
            {commits?.map(commit => (
              <div key={commit.id} className="flex items-center gap-3 px-4 py-3">
                {commit.authorAvatar ? (
                  <img src={commit.authorAvatar} alt={commit.authorName} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-white text-2xs font-medium">
                    {commit.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary truncate block">{commit.messageHeadline}</span>
                  <span className="text-xs text-text-muted">{commit.authorName} committed {formatRelativeTime(commit.committedAt)}</span>
                </div>
                <span className="text-xs text-text-muted font-mono">{commit.shortSha}</span>
              </div>
            ))}
            {(!commits || commits.length === 0) && (
              <div className="py-8 text-center text-sm text-text-muted">No commits</div>
            )}
          </div>
        )}

        {activeTab === 'checks' && (
          <div className="border border-border rounded-lg divide-y divide-border/50">
            {checks?.map(check => (
              <div key={check.id} className="flex items-center gap-3 px-4 py-3">
                {check.conclusion === 'success' ? <CheckCircle size={16} className="text-success" /> :
                 check.conclusion === 'failure' ? <XCircle size={16} className="text-danger" /> :
                 <Clock size={16} className="text-warning" />}
                <div className="flex-1">
                  <span className="text-sm text-text-primary">{check.name}</span>
                  <span className="text-xs text-text-muted ml-2 capitalize">{check.conclusion || check.status}</span>
                </div>
              </div>
            ))}
            {(!checks || checks.length === 0) && (
              <div className="py-8 text-center text-sm text-text-muted">No checks</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <MergeBox
          mergeable={pull.isMergeable}
          mergeableState={pull.mergeableState}
          mergeMethod={pull.mergeMethod || 'merge'}
          onMerge={(data) => onMerge?.(data)}
          onUpdateBranch={onUpdateBranch}
        />

        <div className="bg-surface border border-border rounded-lg p-4 space-y-4 text-sm">
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Reviewers</h4>
            <span className="text-text-muted">No reviewers requested</span>
          </div>
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Assignees</h4>
            <span className="text-text-muted">None yet</span>
          </div>
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Labels</h4>
            <span className="text-text-muted">None yet</span>
          </div>
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Milestone</h4>
            <span className="text-text-muted">No milestone</span>
          </div>
          <div>
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Linked issues</h4>
            <span className="text-text-muted">None</span>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Additions</span>
              <span className="text-success font-medium">+{pull.additions}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Deletions</span>
              <span className="text-danger font-medium">-{pull.deletions}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Changed files</span>
              <span className="text-text-primary">{pull.changedFiles}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
