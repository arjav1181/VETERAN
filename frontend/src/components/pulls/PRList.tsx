import { useState, useMemo } from 'react';
import {
  GitPullRequest, GitPullRequestClosed, GitMerge, CheckCircle, XCircle,
  MessageSquare, User, Tag, Search, ChevronDown,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import type { PullRequest } from '@/types';

interface PRListProps {
  pulls: PullRequest[];
  loading?: boolean;
  state: 'open' | 'closed' | 'merged';
  onStateChange?: (state: 'open' | 'closed' | 'merged') => void;
  onPRClick?: (number: number) => void;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <div className="w-4 h-4 bg-surface rounded animate-pulse mt-1 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface rounded animate-pulse w-3/4" />
            <div className="flex gap-3">
              <div className="h-3 bg-surface rounded animate-pulse w-20" />
              <div className="h-3 bg-surface rounded animate-pulse w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ state, search }: { state: string; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <GitPullRequest size={48} className="mb-4 opacity-30" />
      <p className="text-lg font-medium text-text-primary mb-1">
        {search ? 'No matching pull requests' : `No ${state} pull requests`}
      </p>
      <p className="text-sm">{search ? 'Try adjusting your search' : `There are no ${state} pull requests in this repository`}</p>
    </div>
  );
}

export function PRList({ pulls, loading = false, state, onStateChange, onPRClick, className }: PRListProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created');

  const filtered = useMemo(() => {
    let result = pulls;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || p.authorUsername.toLowerCase().includes(q) ||
          p.headRef.toLowerCase().includes(q) || p.baseRef.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sort === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === 'comments') return b.commentCount - a.commentCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [pulls, search, sort]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-3 border-b border-border space-y-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search pull requests..." />
        <div className="flex items-center gap-2">
          {onStateChange && (
            <div className="flex bg-surface rounded-lg border border-border p-0.5">
              {(['open', 'closed', 'merged'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => onStateChange(s)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                    state === s ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {s === 'open' && <GitPullRequest size={14} />}
                  {s === 'closed' && <XCircle size={14} />}
                  {s === 'merged' && <GitMerge size={14} />}
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-md text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="created">Newest</option>
              <option value="updated">Recently updated</option>
              <option value="comments">Most comments</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState state={state} search={search} />
      ) : (
        <div className="divide-y divide-border/50">
          {filtered.map(pr => (
            <div
              key={pr.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer"
              onClick={() => onPRClick?.(pr.number)}
            >
              {pr.state === 'open' ? (
                <GitPullRequest size={18} className="text-success mt-0.5 shrink-0" />
              ) : pr.state === 'merged' ? (
                <GitMerge size={18} className="text-purple-400 mt-0.5 shrink-0" />
              ) : (
                <GitPullRequestClosed size={18} className="text-text-muted mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary truncate hover:text-accent transition-colors">
                    {pr.title}
                  </span>
                  {pr.isDraft && (
                    <span className="shrink-0 px-1.5 py-0.5 text-2xs bg-text-muted/20 text-text-muted rounded font-medium">Draft</span>
                  )}
                  {pr.labelIds.map((_, i) => (
                    <span key={i} className="shrink-0 px-1.5 py-0.5 text-2xs bg-info/20 text-info rounded">{i}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                  <span>#{pr.number}</span>
                  <span>{pr.authorUsername} opened {formatRelativeTime(pr.createdAt)}</span>
                  <span>head: <code className="text-text-secondary">{pr.headRef}</code></span>
                  <span>base: <code className="text-text-secondary">{pr.baseRef}</code></span>
                  {pr.additions + pr.deletions > 0 && (
                    <span>
                      <span className="text-success">+{pr.additions}</span>{' '}
                      <span className="text-danger">-{pr.deletions}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                {pr.commentCount > 0 && (
                  <span className="flex items-center gap-1"><MessageSquare size={14} />{pr.commentCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
