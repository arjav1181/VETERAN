import { useState } from 'react';
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, GitBranch, User, Calendar, ChevronDown, ChevronRight, FileText,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { JobGraph } from './JobGraph';
import { LogViewer } from './LogViewer';
import type { CIPipeline, CIJob } from '@/types';

interface RunDetailProps {
  run: CIPipeline;
  jobs?: CIJob[];
  loading?: boolean;
  onRerun?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function RunDetail({ run, jobs, loading, onRerun, onCancel, className }: RunDetailProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(jobs?.[0]?.id || null);
  const [showGraph, setShowGraph] = useState(false);

  const activeJob = jobs?.find(j => j.id === activeJobId);

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-8 bg-surface rounded animate-pulse w-1/2" />
        <div className="h-4 bg-surface rounded animate-pulse w-1/3" />
        <div className="h-64 bg-surface rounded animate-pulse" />
      </div>
    );
  }

  const StatusIcon = run.status === 'completed' && run.conclusion === 'success' ? CheckCircle :
    run.status === 'completed' && run.conclusion === 'failure' ? XCircle :
    run.status === 'in_progress' ? Loader2 : Clock;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <StatusIcon size={20} className={cn(
              run.status === 'completed' && run.conclusion === 'success' && 'text-success',
              run.status === 'completed' && run.conclusion === 'failure' && 'text-danger',
              run.status === 'in_progress' && 'text-info animate-spin',
            )} />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{run.name}</h2>
              <span className="text-sm text-text-muted">Run #{run.runNumber}</span>
            </div>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
              run.status === 'completed' && run.conclusion === 'success' && 'bg-success/20 text-success',
              run.status === 'completed' && run.conclusion === 'failure' && 'bg-danger/20 text-danger',
              run.status === 'in_progress' && 'bg-info/20 text-info',
            )}>
              {run.conclusion || run.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onRerun && (
              <button onClick={onRerun} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <Loader2 size={14} /> Rerun
              </button>
            )}
            {(run.status === 'in_progress' || run.status === 'queued') && onCancel && (
              <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-danger/20 text-danger border border-danger/30 rounded-md hover:bg-danger/30 transition-colors">
                <XCircle size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
          <span className="flex items-center gap-1"><User size={12} />{run.actorUsername}</span>
          <span className="flex items-center gap-1"><GitBranch size={12} />{run.branchName}</span>
          <span className="flex items-center gap-1"><Calendar size={12} />Trigger: {run.triggerEvent}</span>
          {run.duration && <span>Duration: {(run.duration / 1000).toFixed(1)}s</span>}
          <span>Commit: <code className="text-text-secondary">{run.commitSha.substring(0, 7)}</code></span>
        </div>
      </div>

      <button
        onClick={() => setShowGraph(!showGraph)}
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary hover:bg-surface/80 transition-colors w-full"
      >
        {showGraph ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Job Graph
      </button>
      {showGraph && jobs && <JobGraph jobs={jobs} onJobClick={setActiveJobId} />}

      {jobs && (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
          <div className="space-y-1">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setActiveJobId(job.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                  activeJobId === job.id ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary hover:bg-surface/60 border border-transparent'
                )}
              >
                {job.status === 'completed' && job.conclusion === 'success' && <CheckCircle size={14} className="text-success" />}
                {job.status === 'completed' && job.conclusion === 'failure' && <XCircle size={14} className="text-danger" />}
                {job.status === 'in_progress' && <Loader2 size={14} className="animate-spin text-info" />}
                {job.status === 'queued' && <Clock size={14} className="text-text-muted" />}
                <span className="truncate">{job.name}</span>
              </button>
            ))}
          </div>

          <div className="bg-primary-dark border border-border rounded-lg overflow-hidden">
            {activeJob ? (
              <div>
                <div className="px-4 py-2 bg-surface border-b border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{activeJob.name}</span>
                    <span className={cn(
                      'px-2 py-0.5 text-2xs font-medium rounded capitalize',
                      activeJob.status === 'completed' && activeJob.conclusion === 'success' && 'bg-success/20 text-success',
                      activeJob.status === 'completed' && activeJob.conclusion === 'failure' && 'bg-danger/20 text-danger',
                      activeJob.status === 'in_progress' && 'bg-info/20 text-info',
                    )}>
                      {activeJob.conclusion || activeJob.status}
                    </span>
                  </div>
                </div>
                <LogViewer jobId={activeJob.id} />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-text-muted text-sm">
                Select a job to view logs
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
