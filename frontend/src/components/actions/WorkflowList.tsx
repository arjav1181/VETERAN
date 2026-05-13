import { useState, useMemo } from 'react';
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle, Loader2,
  GitBranch, User, Calendar, Search, ChevronDown,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import type { CIPipeline } from '@/types';

interface WorkflowListProps {
  runs: CIPipeline[];
  loading?: boolean;
  onRunClick?: (id: string) => void;
  onRerun?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

function StatusIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === 'in_progress') return <Loader2 size={16} className="animate-spin text-info" />;
  if (status === 'queued') return <Clock size={16} className="text-text-muted" />;
  if (status === 'completed') {
    if (conclusion === 'success') return <CheckCircle size={16} className="text-success" />;
    if (conclusion === 'failure') return <XCircle size={16} className="text-danger" />;
    if (conclusion === 'cancelled') return <XCircle size={16} className="text-warning" />;
    return <AlertTriangle size={16} className="text-warning" />;
  }
  if (status === 'cancelled') return <XCircle size={16} className="text-warning" />;
  return <Clock size={16} className="text-text-muted" />;
}

export function WorkflowList({ runs, loading, onRunClick, onRerun, onCancel, className }: WorkflowListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    let result = runs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) || r.branchName.toLowerCase().includes(q) || r.actorUsername.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter || r.conclusion === statusFilter);
    }
    return result;
  }, [runs, search, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg">
            <div className="w-4 h-4 bg-surface rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface rounded animate-pulse w-1/2" />
              <div className="h-3 bg-surface rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workflow runs..." />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="in_progress">In progress</option>
          <option value="queued">Queued</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
          <Play size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium text-text-primary mb-1">No workflow runs</p>
          <p className="text-sm">{search ? 'No matching runs found' : 'This repository has no workflow runs yet'}</p>
        </div>
      ) : (
        filtered.map(run => (
          <div
            key={run.id}
            className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg bg-primary-dark hover:bg-surface/20 transition-colors cursor-pointer"
            onClick={() => onRunClick?.(run.id)}
          >
            <StatusIcon status={run.status} conclusion={run.conclusion} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary truncate">{run.name}</span>
                <span className="text-xs text-text-muted">#{run.runNumber}</span>
                <span className={cn(
                  'px-1.5 py-0.5 text-2xs font-medium rounded',
                  run.status === 'completed' && run.conclusion === 'success' && 'bg-success/20 text-success',
                  run.status === 'completed' && run.conclusion === 'failure' && 'bg-danger/20 text-danger',
                  run.status === 'in_progress' && 'bg-info/20 text-info',
                  run.status === 'queued' && 'bg-text-muted/20 text-text-muted',
                )}>
                  {run.status === 'completed' ? run.conclusion : run.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5 flex-wrap">
                <span className="flex items-center gap-1"><GitBranch size={12} />{run.branchName}</span>
                <span className="flex items-center gap-1">{run.actorUsername}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{formatRelativeTime(run.createdAt)}</span>
                {run.duration && <span>{(run.duration / 1000).toFixed(1)}s</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {run.status === 'completed' && onRerun && (
                <button onClick={(e) => { e.stopPropagation(); onRerun(run.id); }}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface/80 transition-colors" title="Rerun">
                  <Loader2 size={14} />
                </button>
              )}
              {(run.status === 'in_progress' || run.status === 'queued') && onCancel && (
                <button onClick={(e) => { e.stopPropagation(); onCancel(run.id); }}
                  className="p-1.5 text-text-muted hover:text-danger rounded hover:bg-surface/80 transition-colors" title="Cancel">
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
