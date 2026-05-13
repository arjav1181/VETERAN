import { useState } from 'react';
import { Columns, FileText, ChevronDown, ChevronRight, Plus, Minus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineComment } from './InlineComment';

interface PRDiffFile {
  sha: string;
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}

interface PRDiffProps {
  files: PRDiffFile[];
  onComment?: (filename: string, line: number, body: string, suggestion?: string) => void;
  className?: string;
}

function FileDiff({ file, onComment }: { file: PRDiffFile; onComment?: PRDiffProps['onComment'] }) {
  const [expanded, setExpanded] = useState(true);

  if (!file.patch) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface text-sm cursor-pointer hover:bg-surface/80" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className={cn(
            'px-1.5 py-0.5 text-2xs font-medium rounded',
            file.status === 'added' && 'bg-success/20 text-success',
            file.status === 'deleted' && 'bg-danger/20 text-danger',
            file.status === 'modified' && 'bg-info/20 text-info',
            file.status === 'renamed' && 'bg-warning/20 text-warning',
          )}>{file.status}</span>
          <span className="text-text-primary font-mono">{file.filename}</span>
          <span className="text-xs text-success">+{file.additions}</span>
          <span className="text-xs text-danger">-{file.deletions}</span>
        </div>
      </div>
    );
  }

  const lines = file.patch.split('\n');

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-surface text-sm cursor-pointer hover:bg-surface/80" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className={cn(
          'px-1.5 py-0.5 text-2xs font-medium rounded',
          file.status === 'added' && 'bg-success/20 text-success',
          file.status === 'deleted' && 'bg-danger/20 text-danger',
          file.status === 'modified' && 'bg-info/20 text-info',
          file.status === 'renamed' && 'bg-warning/20 text-warning',
        )}>{file.status}</span>
        <span className="text-text-primary font-mono">{file.filename}</span>
        <span className="text-xs text-success">+{file.additions}</span>
        <span className="text-xs text-danger">-{file.deletions}</span>
      </div>

      {expanded && (
        <div className="overflow-x-auto">
          <pre className="text-xs leading-5 font-mono">
            {lines.map((line, i) => {
              const lineType = line.startsWith('+') ? 'addition' : line.startsWith('-') ? 'deletion' : line.startsWith('@@') ? 'hunk' : 'context';
              const content = line || '\u00A0';
              return (
                <div key={i} className={cn(
                  'flex group hover:bg-surface/20 relative',
                  lineType === 'addition' && 'bg-success/5',
                  lineType === 'deletion' && 'bg-danger/5',
                  lineType === 'hunk' && 'bg-info/5',
                )}>
                  <span className="w-10 text-right px-1 text-text-muted select-none shrink-0 border-r border-border/30 text-2xs leading-5">{i + 1}</span>
                  <span className={cn(
                    'flex-1 px-2',
                    lineType === 'addition' && 'text-success',
                    lineType === 'deletion' && 'text-danger',
                    lineType === 'hunk' && 'text-info',
                    lineType === 'context' && 'text-text-secondary',
                  )}>{content}</span>
                  {onComment && (lineType === 'addition' || lineType === 'deletion' || lineType === 'context') && (
                    <div className="absolute right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <InlineComment
                        path={file.filename}
                        line={i + 1}
                        onSubmit={(body, suggestion) => onComment(file.filename, i + 1, body, suggestion)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}

export function PRDiff({ files, onComment, className }: PRDiffProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
        <FileText size={48} className="mb-4 opacity-30" />
        <p className="text-sm">No files changed</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg">
        <span className="text-sm text-text-primary">
          <span className="font-medium">{files.length}</span> files changed
        </span>
        <button
          onClick={() => setViewMode(v => v === 'unified' ? 'split' : 'unified')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors"
        >
          <Columns size={14} /> {viewMode === 'unified' ? 'Split' : 'Unified'}
        </button>
      </div>
      <div className="space-y-2">
        {files.map(file => (
          <FileDiff key={file.sha} file={file} onComment={onComment} />
        ))}
      </div>
    </div>
  );
}
