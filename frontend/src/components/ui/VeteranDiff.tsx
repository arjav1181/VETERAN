import { useState } from 'react';
import { cn } from '../../lib/utils';
import { FileCode, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';

export interface DiffFile {
  oldPath: string;
  newPath: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'add' | 'del' | 'context';
  content: string;
  oldLineNo: number | null;
  newLineNo: number | null;
}

export interface VeteranDiffProps {
  files: DiffFile[];
  viewType?: 'unified' | 'split';
  className?: string;
}

function DiffHunkView({ hunk, viewType }: { hunk: DiffHunk; viewType: 'unified' | 'split' }) {
  return (
    <div>
      <div className="px-4 py-1 text-xs font-mono text-surface-500 bg-surface-50 dark:bg-surface-800 border-y border-surface-200 dark:border-surface-700">
        {hunk.header}
      </div>
      {viewType === 'unified' ? (
        <div className="font-mono text-sm leading-relaxed">
          {hunk.lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex px-4',
                line.type === 'add' && 'bg-green-50 dark:bg-green-950/30',
                line.type === 'del' && 'bg-red-50 dark:bg-red-950/30'
              )}
            >
              <span className="w-10 text-right text-surface-400 select-none text-xs leading-relaxed">
                {line.type === 'add' ? '' : line.oldLineNo}
              </span>
              <span className="w-10 text-right text-surface-400 select-none text-xs leading-relaxed">
                {line.type === 'del' ? '' : line.newLineNo}
              </span>
              <span className={cn(
                'w-5 flex-shrink-0 select-none',
                line.type === 'add' && 'text-green-600 dark:text-green-400',
                line.type === 'del' && 'text-red-600 dark:text-red-400'
              )}>
                {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
              </span>
              <span className="flex-1 whitespace-pre">{line.content}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex font-mono text-sm leading-relaxed">
          <div className="flex-1 border-r border-surface-200 dark:border-surface-700">
            {hunk.lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  line.type === 'del' && 'bg-red-50 dark:bg-red-950/30'
                )}
              >
                <span className="w-10 text-right text-surface-400 select-none text-xs leading-relaxed">
                  {line.type === 'add' ? '' : line.oldLineNo}
                </span>
                <span className="w-5 flex-shrink-0 select-none text-red-600 dark:text-red-400">
                  {line.type === 'del' ? '-' : ' '}
                </span>
                <span className="flex-1 whitespace-pre">
                  {line.type === 'add' ? '' : line.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex-1">
            {hunk.lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  line.type === 'add' && 'bg-green-50 dark:bg-green-950/30'
                )}
              >
                <span className="w-10 text-right text-surface-400 select-none text-xs leading-relaxed">
                  {line.type === 'del' ? '' : line.newLineNo}
                </span>
                <span className="w-5 flex-shrink-0 select-none text-green-600 dark:text-green-400">
                  {line.type === 'add' ? '+' : ' '}
                </span>
                <span className="flex-1 whitespace-pre">
                  {line.type === 'del' ? '' : line.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DiffFileView({ file, viewType }: { file: DiffFile; viewType: 'unified' | 'split' }) {
  const [expanded, setExpanded] = useState(true);

  const statusIcon = {
    added: <Plus className="w-4 h-4 text-green-500" />,
    removed: <Minus className="w-4 h-4 text-red-500" />,
    modified: <FileCode className="w-4 h-4 text-amber-500" />,
    renamed: <FileCode className="w-4 h-4 text-blue-500" />,
    copied: <FileCode className="w-4 h-4 text-blue-500" />,
  };

  const statusLabel = {
    added: 'A',
    removed: 'D',
    modified: 'M',
    renamed: 'R',
    copied: 'C',
  };

  const statusColor = {
    added: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    removed: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    modified: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    renamed: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    copied: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
  };

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-left',
          statusColor[file.status]
        )}
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {statusIcon[file.status]}
        <span className="flex-1 truncate">
          {file.status === 'renamed' ? `${file.oldPath} → ${file.newPath}` : file.newPath || file.oldPath}
        </span>
        <span className="flex items-center gap-2 text-xs font-mono">
          <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
          <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-700">
          {file.hunks.map((hunk, i) => (
            <DiffHunkView key={i} hunk={hunk} viewType={viewType} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VeteranDiff({ files, viewType: externalViewType, className }: VeteranDiffProps) {
  const [viewType, setViewType] = useState<'unified' | 'split'>(externalViewType || 'unified');

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-surface-500">{files.length} file{files.length !== 1 ? 's' : ''} changed</span>
          <span className="text-green-600 dark:text-green-400 font-mono">+{totalAdditions}</span>
          <span className="text-red-600 dark:text-red-400 font-mono">-{totalDeletions}</span>
        </div>
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
          <button
            onClick={() => setViewType('unified')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              viewType === 'unified'
                ? 'bg-veteran-600 text-white'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            Unified
          </button>
          <button
            onClick={() => setViewType('split')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              viewType === 'split'
                ? 'bg-veteran-600 text-white'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            Split
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file, i) => (
          <DiffFileView key={i} file={file} viewType={viewType} />
        ))}
      </div>
    </div>
  );
}
