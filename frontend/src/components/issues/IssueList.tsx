import { useState, useMemo } from 'react';
import {
  IssueOpened, IssueClosed, CheckCircle, XCircle, Tag, User, Milestone,
  MessageSquare, ChevronDown, SortAsc, Search, Square, CheckSquare,
} from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import type { Issue, IssueLabel, IssueMilestone } from '@/types';

interface IssueListProps {
  issues: Issue[];
  labels: IssueLabel[];
  milestones: IssueMilestone[];
  loading?: boolean;
  state: 'open' | 'closed';
  onStateChange?: (state: 'open' | 'closed') => void;
  onIssueClick?: (number: number) => void;
  onLabelClick?: (label: string) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
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
            <div className="flex gap-2">
              <div className="h-5 bg-surface rounded animate-pulse w-16" />
              <div className="h-5 bg-surface rounded animate-pulse w-20" />
              <div className="h-5 bg-surface rounded animate-pulse w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ state, search, hasFilters }: { state: string; search: string; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      {state === 'open' ? <IssueOpened size={48} className="mb-4 opacity-30" /> : <IssueClosed size={48} className="mb-4 opacity-30" />}
      <p className="text-lg font-medium text-text-primary mb-1">
        {search || hasFilters ? 'No matching issues found' : `No ${state} issues`}
      </p>
      <p className="text-sm">
        {search || hasFilters ? 'Try adjusting your search or filter criteria' : `There are no ${state} issues in this repository`}
      </p>
    </div>
  );
}

export function IssueList({
  issues, labels, milestones, loading = false, state, onStateChange, onIssueClick,
  onLabelClick, onBulkAction, className,
}: IssueListProps) {
  const [search, setSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [sort, setSort] = useState('created');
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = issues;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.authorUsername.toLowerCase().includes(q));
    }
    if (selectedLabels.length > 0) {
      result = result.filter(i => i.labelIds.some(lid => selectedLabels.includes(lid)));
    }
    if (selectedMilestone) {
      result = result.filter(i => i.milestoneId === selectedMilestone);
    }
    if (selectedAuthor) {
      result = result.filter(i => i.authorUsername === selectedAuthor);
    }
    result.sort((a, b) => {
      if (sort === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === 'comments') return b.commentCount - a.commentCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [issues, search, selectedLabels, selectedMilestone, selectedAuthor, sort]);

  const toggleSelect = (id: string) => {
    setSelectedIssues(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIssues.size === filtered.length) setSelectedIssues(new Set());
    else setSelectedIssues(new Set(filtered.map(i => i.id)));
  };

  if (loading) return <LoadingSkeleton />;

  const hasFilters = selectedLabels.length > 0 || !!selectedMilestone || !!selectedAuthor;

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-3 border-b border-border space-y-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search issues..." />

        <div className="flex items-center gap-2">
          {onStateChange && (
            <div className="flex bg-surface rounded-lg border border-border p-0.5">
              <button
                onClick={() => onStateChange('open')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  state === 'open' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <IssueOpened size={14} /> Open
              </button>
              <button
                onClick={() => onStateChange('closed')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  state === 'closed' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <CheckCircle size={14} /> Closed
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors',
              showFilters ? 'border-accent/30 text-accent bg-accent/10' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface/80'
            )}
          >
            <Tag size={14} /> Filters
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-surface border border-border rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            >
              <option value="created">Newest</option>
              <option value="updated">Recently updated</option>
              <option value="comments">Most comments</option>
            </select>
            <SortAsc size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap p-2 bg-surface rounded-lg border border-border">
            <div className="flex items-center gap-1">
              <Tag size={12} className="text-text-muted" />
              <select
                value={selectedLabels[0] || ''}
                onChange={(e) => setSelectedLabels(e.target.value ? [e.target.value] : [])}
                className="px-2 py-1 text-xs bg-primary-dark border border-border rounded text-text-primary"
              >
                <option value="">All labels</option>
                {labels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Milestone size={12} className="text-text-muted" />
              <select
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
                className="px-2 py-1 text-xs bg-primary-dark border border-border rounded text-text-primary"
              >
                <option value="">All milestones</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {selectedIssues.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 border-b border-border text-sm">
          <span className="text-text-primary">{selectedIssues.size} selected</span>
          {['close', 'open', 'label', 'assign'].map(action => (
            <button
              key={action}
              onClick={() => onBulkAction?.(action, Array.from(selectedIssues))}
              className="px-2 py-1 text-xs rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors capitalize"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState state={state} search={search} hasFilters={hasFilters} />
      ) : (
        <div className="divide-y divide-border/50">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-surface/30">
            <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary">
              {selectedIssues.size === filtered.length ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
            <span className="text-xs text-text-muted">{filtered.length} {filtered.length === 1 ? 'issue' : 'issues'}</span>
          </div>
          {filtered.map(issue => {
            const issueLabels = labels.filter(l => issue.labelIds.includes(l.id));
            return (
              <div
                key={issue.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer group"
                onClick={() => onIssueClick?.(issue.number)}
              >
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(issue.id); }} className="mt-1 text-text-muted hover:text-text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Square size={14} />
                </button>
                {issue.state === 'open' ? (
                  <IssueOpened size={18} className="text-success mt-0.5 shrink-0" />
                ) : (
                  <IssueClosed size={18} className="text-text-muted mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text-primary truncate hover:text-accent transition-colors">
                      {issue.title}
                    </span>
                    {issueLabels.map(label => (
                      <span
                        key={label.id}
                        onClick={(e) => { e.stopPropagation(); onLabelClick?.(label.name); }}
                        className="shrink-0 px-2 py-0.5 text-2xs font-medium rounded-full"
                        style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>#{issue.number}</span>
                    <span>opened {formatRelativeTime(issue.createdAt)} by <span className="hover:text-accent cursor-pointer">{issue.authorUsername}</span></span>
                    {issue.milestoneId && <span>{milestones.find(m => m.id === issue.milestoneId)?.title}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {issue.assigneeIds.length > 0 && (
                    <User size={16} className="text-text-muted" />
                  )}
                  {issue.commentCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <MessageSquare size={14} /> {issue.commentCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
