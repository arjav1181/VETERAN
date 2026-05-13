import { useState } from 'react';
import {
  GitMerge, GitPullRequest, GitBranch, CheckCircle, AlertTriangle,
  XCircle, Loader2, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MergeBoxState } from '@/types';

interface MergeBoxProps {
  mergeable: boolean | null;
  mergeableState: string | null;
  mergeMethod: 'merge' | 'squash' | 'rebase';
  onMerge: (data: MergeBoxState) => void;
  onUpdateBranch?: () => void;
  merging?: boolean;
  className?: string;
}

export function MergeBox({ mergeable, mergeableState, mergeMethod: initialMethod, onMerge, onUpdateBranch, merging = false, className }: MergeBoxProps) {
  const [state, setState] = useState<MergeBoxState>({
    mergeMethod: initialMethod,
    commitMessage: '',
    commitDescription: '',
    deleteBranch: true,
    autoMerge: false,
    mergeTitle: '',
    mergeBody: '',
  });

  const canMerge = mergeable === true;

  return (
    <div className={cn('border border-border rounded-lg bg-surface p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitMerge size={18} className="text-text-primary" />
          <h3 className="text-base font-semibold text-text-primary">Merge</h3>
        </div>
        {mergeable === null && (
          <div className="flex items-center gap-1.5 text-text-muted text-sm">
            <Loader2 size={14} className="animate-spin" /> Checking mergeability...
          </div>
        )}
        {mergeable === false && (
          <div className="flex items-center gap-1.5 text-danger text-sm">
            <XCircle size={14} /> Can't merge automatically
          </div>
        )}
        {canMerge && (
          <div className="flex items-center gap-1.5 text-success text-sm">
            <CheckCircle size={14} /> Able to merge
          </div>
        )}
      </div>

      {mergeable === false && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
          <AlertTriangle size={16} />
          <span>Merge conflicts detected. Resolve them before merging.</span>
        </div>
      )}

      <div className="flex items-center gap-1 bg-primary-dark rounded-lg p-0.5 border border-border">
        {(['merge', 'squash', 'rebase'] as const).map(method => (
          <button
            key={method}
            onClick={() => setState(s => ({ ...s, mergeMethod: method }))}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors capitalize',
              state.mergeMethod === method ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {method === 'merge' && <GitMerge size={14} />}
            {method === 'squash' && <GitPullRequest size={14} />}
            {method === 'rebase' && <GitBranch size={14} />}
            {method}
          </button>
        ))}
      </div>

      <textarea
        value={state.commitMessage}
        onChange={(e) => setState(s => ({ ...s, commitMessage: e.target.value }))}
        placeholder="Merge commit message..."
        rows={2}
        className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
      />

      <textarea
        value={state.commitDescription}
        onChange={(e) => setState(s => ({ ...s, commitDescription: e.target.value }))}
        placeholder="Description (optional)..."
        rows={2}
        className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
      />

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={state.deleteBranch}
            onChange={(e) => setState(s => ({ ...s, deleteBranch: e.target.checked }))}
            className="rounded border-border bg-primary-dark text-accent focus:ring-accent"
          />
          Delete head branch after merge
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={state.autoMerge}
            onChange={(e) => setState(s => ({ ...s, autoMerge: e.target.checked }))}
            className="rounded border-border bg-primary-dark text-accent focus:ring-accent"
          />
          Auto-merge when all requirements are met
        </label>
      </div>

      {onUpdateBranch && !canMerge && mergeable !== null && (
        <button
          onClick={onUpdateBranch}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-surface border border-border text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface/80 transition-colors"
        >
          <GitBranch size={14} /> Update branch
        </button>
      )}

      <button
        onClick={() => onMerge(state)}
        disabled={!canMerge || merging}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
          canMerge
            ? 'bg-success text-white hover:bg-success/90'
            : 'bg-surface text-text-muted border border-border cursor-not-allowed'
        )}
      >
        {merging ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GitMerge size={16} />
        )}
        {merging ? 'Merging...' : `Merge ${state.mergeMethod}`}
      </button>
    </div>
  );
}
