import { useState } from 'react';
import {
  Terminal, Play, Square, Trash2, Clock, GitBranch, ExternalLink,
  Loader2, Plus,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Codespace } from '@/types';

interface CodespaceListProps {
  codespaces: Codespace[];
  loading?: boolean;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpen?: (id: string) => void;
  onCreate?: () => void;
  className?: string;
}

const STATE_CONFIG: Record<string, { icon: typeof Terminal; color: string; label: string }> = {
  running: { icon: Terminal, color: 'text-success', label: 'Running' },
  starting: { icon: Loader2, color: 'text-info', label: 'Starting' },
  stopped: { icon: Square, color: 'text-text-muted', label: 'Stopped' },
  stopping: { icon: Loader2, color: 'text-warning', label: 'Stopping' },
  provisioning: { icon: Loader2, color: 'text-info', label: 'Provisioning' },
  deleted: { icon: Trash2, color: 'text-danger', label: 'Deleted' },
  failed: { icon: Trash2, color: 'text-danger', label: 'Failed' },
  shutting_down: { icon: Square, color: 'text-warning', label: 'Shutting down' },
};

export function CodespaceList({ codespaces, loading, onStart, onStop, onDelete, onOpen, onCreate, className }: CodespaceListProps) {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border border-border rounded-lg">
            <div className="w-10 h-10 bg-surface rounded-lg animate-pulse" />
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
    <div className={cn('space-y-3', className)}>
      {onCreate && (
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent/50 hover:bg-accent/5 transition-all"
        >
          <Plus size={18} /> New codespace
        </button>
      )}

      {codespaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
          <Terminal size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium text-text-primary mb-1">No codespaces</p>
          <p className="text-sm mb-4">Create a codespace to start coding in the cloud</p>
          {onCreate && (
            <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm">
              <Plus size={16} /> Create codespace
            </button>
          )}
        </div>
      ) : (
        codespaces.map(cs => {
          const config = STATE_CONFIG[cs.state] || STATE_CONFIG.stopped;
          const Icon = config.icon;
          return (
            <div
              key={cs.id}
              className="flex items-center gap-4 px-4 py-3 border border-border rounded-lg bg-primary-dark hover:bg-surface/20 transition-colors group"
            >
              <div className={cn('w-10 h-10 rounded-lg bg-surface flex items-center justify-center', config.color)}>
                <Icon size={20} className={cs.state === 'starting' || cs.state === 'provisioning' ? 'animate-spin' : ''} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium text-text-primary truncate cursor-pointer hover:text-accent transition-colors"
                    onClick={() => onOpen?.(cs.id)}
                  >
                    {cs.displayName}
                  </span>
                  <span className={cn('px-1.5 py-0.5 text-2xs font-medium rounded-full', config.color.replace('text-', 'bg-').replace('success', 'success/20').replace('info', 'info/20').replace('warning', 'warning/20').replace('muted', 'text-muted/20').replace('danger', 'danger/20'))}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                  <span className="flex items-center gap-1">{cs.repositoryId.substring(0, 8)}</span>
                  <span className="flex items-center gap-1"><GitBranch size={12} />{cs.branchName}</span>
                  {cs.lastActivityAt && <span><Clock size={12} /> {formatRelativeTime(cs.lastActivityAt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {cs.state === 'running' && (
                  <button onClick={() => onOpen?.(cs.id)}
                    className="p-2 text-text-muted hover:text-success rounded-md hover:bg-surface/80 transition-colors" title="Open">
                    <ExternalLink size={16} />
                  </button>
                )}
                {cs.state === 'stopped' && onStart && (
                  <button onClick={() => onStart(cs.id)}
                    className="p-2 text-text-muted hover:text-success rounded-md hover:bg-surface/80 transition-colors" title="Start">
                    <Play size={16} />
                  </button>
                )}
                {(cs.state === 'running' || cs.state === 'starting') && onStop && (
                  <button onClick={() => onStop(cs.id)}
                    className="p-2 text-text-muted hover:text-warning rounded-md hover:bg-surface/80 transition-colors" title="Stop">
                    <Square size={16} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(cs.id)}
                    className="p-2 text-text-muted hover:text-danger rounded-md hover:bg-surface/80 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
