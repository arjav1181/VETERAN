import { useState, useMemo } from 'react';
import {
  GitCommit, ChevronDown, ChevronRight, Search, User, CheckCircle,
  MessageSquare, ExternalLink,
} from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime, formatShortSha, getCommitDateGroup } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import type { Commit } from '@/types';

interface CommitListProps {
  commits: Commit[];
  loading?: boolean;
  onCommitClick?: (sha: string) => void;
  onAuthorClick?: (author: string) => void;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-surface rounded-full animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface rounded animate-pulse w-3/4" />
            <div className="flex gap-3">
              <div className="h-3 bg-surface rounded animate-pulse w-24" />
              <div className="h-3 bg-surface rounded animate-pulse w-16" />
              <div className="h-3 bg-surface rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <GitCommit size={48} className="mb-4 opacity-30" />
      <p className="text-lg font-medium text-text-primary mb-1">No commits found</p>
      {search ? (
        <p className="text-sm">No commits matching "{search}"</p>
      ) : (
        <p className="text-sm">This repository has no commits yet</p>
      )}
    </div>
  );
}

function CommitRow({
  commit, onCommitClick, onAuthorClick,
}: {
  commit: Commit;
  onCommitClick?: (sha: string) => void;
  onAuthorClick?: (author: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group hover:bg-surface/20 transition-colors">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="pt-0.5 shrink-0">
          {commit.authorAvatar ? (
            <img
              src={commit.authorAvatar}
              alt={commit.authorName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-medium">
              {commit.authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-medium text-text-primary truncate cursor-pointer hover:text-accent transition-colors"
              onClick={() => onCommitClick?.(commit.sha)}
            >
              {commit.messageHeadline}
            </span>
            {commit.isVerified && (
              <span className="shrink-0" title="Verified">
                <CheckCircle size={14} className="text-success" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
            <button
              onClick={() => onAuthorClick?.(commit.authorName)}
              className="hover:text-accent transition-colors font-medium"
            >
              {commit.authorName}
            </button>
            <button
              onClick={() => onCommitClick?.(commit.sha)}
              className="font-mono hover:text-accent transition-colors"
              title={commit.sha}
            >
              {formatShortSha(commit.sha)}
            </button>
            <span
              className="hover:text-text-primary transition-colors cursor-default"
              title={formatAbsoluteTime(commit.committedAt)}
            >
              {formatRelativeTime(commit.committedAt)}
            </span>
            {commit.additions + commit.deletions > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-success">+{commit.additions}</span>
                <span className="text-danger">-{commit.deletions}</span>
              </span>
            )}
          </div>
          {expanded && commit.messageBody && (
            <div className="mt-2 p-3 bg-primary-dark border border-border rounded-lg text-sm text-text-secondary whitespace-pre-wrap">
              {commit.messageBody}
            </div>
          )}
          {commit.coAuthors && commit.coAuthors.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              {commit.coAuthors.map((co, i) => (
                <span key={i} className="flex items-center gap-1">
                  {co.avatar ? (
                    <img src={co.avatar} alt={co.name} className="w-4 h-4 rounded-full" />
                  ) : (
                    <User size={12} />
                  )}
                  {co.name}
                </span>
              ))}
            </div>
          )}
        </div>
        {commit.messageBody && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function CommitList({
  commits, loading = false, onCommitClick, onAuthorClick, className,
}: CommitListProps) {
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState<string>('');

  const filtered = useMemo(() => {
    let result = commits;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        c => c.messageHeadline.toLowerCase().includes(q) ||
          c.messageBody?.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          c.sha.toLowerCase().includes(q)
      );
    }
    if (authorFilter) {
      result = result.filter(c => c.authorName === authorFilter);
    }
    return result;
  }, [commits, search, authorFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; order: number; commits: Commit[] }>();
    filtered.forEach(commit => {
      const { label, order } = getCommitDateGroup(commit.committedAt);
      const key = `${order}-${label}`;
      if (!groups.has(key)) groups.set(key, { label, order, commits: [] });
      groups.get(key)!.commits.push(commit);
    });
    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }, [filtered]);

  const authors = useMemo(() =>
    [...new Set(commits.map(c => c.authorName))],
    [commits]
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-3 border-b border-border space-y-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search commits..." />
        {authors.length > 1 && (
          <div className="flex items-center gap-2">
            <User size={14} className="text-text-muted shrink-0" />
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-primary-dark border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">All authors</option>
              {authors.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="divide-y divide-border/50">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="px-4 py-2 bg-surface/50 text-xs font-medium text-text-muted uppercase tracking-wider">
                {group.label}
              </div>
              <div className="divide-y divide-border/30">
                {group.commits.map(commit => (
                  <CommitRow
                    key={commit.id}
                    commit={commit}
                    onCommitClick={onCommitClick}
                    onAuthorClick={onAuthorClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
