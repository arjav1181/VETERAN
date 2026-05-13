import { useState, useMemo } from 'react';
import {
  Columns, FileText, ChevronDown, ChevronRight, Plus, Minus,
  Maximize2, Minimize2, Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiffFile, Stats } from '@/types';

interface DiffViewerProps {
  files: DiffFile[];
  stats: Stats;
  className?: string;
}

interface FileDiffProps {
  file: DiffFile;
  defaultExpanded?: boolean;
}

function FileDiff({ file, defaultExpanded = true }: FileDiffProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  if (!file.patch) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface text-sm cursor-pointer hover:bg-surface/80" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <div className={cn(
            'px-1.5 py-0.5 text-2xs font-medium rounded',
            file.status === 'added' && 'bg-success/20 text-success',
            file.status === 'deleted' && 'bg-danger/20 text-danger',
            file.status === 'modified' && 'bg-info/20 text-info',
            file.status === 'renamed' && 'bg-warning/20 text-warning',
          )}>
            {file.status}
          </div>
          <span className="text-sm text-text-primary font-mono">{file.filename}</span>
          <span className="text-xs text-success">+{file.additions}</span>
          <span className="text-xs text-danger">-{file.deletions}</span>
        </div>
        {expanded && file.patch && (
          <div className="overflow-x-auto">
            {!showAll && file.patch.split('\n').length > 100 ? (
              <div className="text-center py-4">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs text-info hover:text-info/80 transition-colors"
                >
                  Show all {file.patch.split('\n').length} lines
                </button>
              </div>
            ) : (
              <pre className="text-xs leading-5 font-mono">
                {file.patch.split('\n').map((line, i) => {
                  const type = line.startsWith('+') ? 'addition' : line.startsWith('-') ? 'deletion' : line.startsWith('@@') ? 'hunk' : 'context';
                  return (
                    <div key={i} className={cn(
                      'flex hover:bg-surface/20',
                      type === 'addition' && 'bg-success/5',
                      type === 'deletion' && 'bg-danger/5',
                      type === 'hunk' && 'bg-info/5',
                    )}>
                      <span className="w-8 text-right px-2 text-text-muted select-none shrink-0 border-r border-border/30">{i + 1}</span>
                      <span className={cn(
                        'flex-1 px-3',
                        type === 'addition' && 'text-success',
                        type === 'deletion' && 'text-danger',
                        type === 'hunk' && 'text-info',
                        type === 'context' && 'text-text-secondary',
                      )}>
                        {line || '\u00A0'}
                      </span>
                    </div>
                  );
                })}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function DiffViewer({ files, stats, className }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [expandedAll, setExpandedAll] = useState(true);

  const collapsedFiles = useMemo(() => files.filter(f => f.changes > 1000), [files]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-primary font-medium">{stats.total} changed files</span>
          <span className="text-success font-medium">+{stats.additions}</span>
          <span className="text-danger font-medium">-{stats.deletions}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandedAll(!expandedAll)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors"
          >
            {expandedAll ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {expandedAll ? 'Collapse all' : 'Expand all'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors',
              viewMode === 'unified' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-surface/80'
            )}
          >
            <Columns size={14} /> {viewMode === 'unified' ? 'Split' : 'Unified'}
          </button>
        </div>
      </div>

      {collapsedFiles.length > 0 && (
        <div className="px-4 py-3 bg-surface border border-border rounded-lg text-sm text-text-muted">
          <span className="font-medium text-text-primary">{collapsedFiles.length} large files</span> are collapsed.{" "}
          <button onClick={() => setExpandedAll(true)} className="text-info hover:underline">
            Expand all
          </button>
        </div>
      )}

      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="text-sm">No files changed</p>
          </div>
        ) : (
          files.map(file => (
            <FileDiff
              key={file.sha + file.filename}
              file={file}
              defaultExpanded={expandedAll && file.changes <= 1000}
            />
          ))
        )}
      </div>
    </div>
  );
}
