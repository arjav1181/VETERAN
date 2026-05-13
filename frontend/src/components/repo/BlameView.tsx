import { useState, useMemo } from 'react';
import { GitCommit, User, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime, formatShortSha } from '@/lib/utils';
import type { BlameLine } from '@/types';

interface BlameViewProps {
  lines: BlameLine[];
  onCommitClick?: (sha: string) => void;
  onAuthorClick?: (author: string) => void;
  className?: string;
}

function getHeatColor(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  const opacity = Math.max(0, Math.min(1, 1 - diffDays / 365));
  return `rgba(232, 184, 75, ${opacity * 0.15})`;
}

export function BlameView({ lines, onCommitClick, onAuthorClick, className }: BlameViewProps) {
  const [expandedShas, setExpandedShas] = useState<Set<string>>(new Set());
  const [hoveredSha, setHoveredSha] = useState<string | null>(null);

  const groupedBlocks = useMemo(() => {
    const blocks: { sha: string; lines: BlameLine[]; author: string; date: string }[] = [];
    let currentBlock: typeof blocks[0] | null = null;

    lines.forEach(line => {
      if (!currentBlock || currentBlock.sha !== line.sha) {
        currentBlock = { sha: line.sha, lines: [], author: line.authorName, date: line.authoredAt };
        blocks.push(currentBlock);
      }
      currentBlock.lines.push(line);
    });

    return blocks;
  }, [lines]);

  const toggleBlock = (sha: string) => {
    setExpandedShas(prev => {
      const next = new Set(prev);
      if (next.has(sha)) next.delete(sha);
      else next.add(sha);
      return next;
    });
  };

  const firstLine = lines[0];
  const hoveredCommit = hoveredSha ? lines.find(l => l.sha === hoveredSha) : null;

  return (
    <div className={cn('relative border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="flex">
        <div className="min-w-[320px] max-w-[320px] border-r border-border/50 divide-y divide-border/20">
          {groupedBlocks.map((block) => {
            const isExpanded = expandedShas.has(block.sha);
            return (
              <div
                key={block.sha}
                className="relative"
                style={{ backgroundColor: getHeatColor(block.date) }}
              >
                <div
                  className="px-3 py-1 text-xs cursor-pointer hover:bg-surface/40 transition-colors group"
                  onMouseEnter={() => setHoveredSha(block.sha)}
                  onMouseLeave={() => setHoveredSha(null)}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onCommitClick?.(block.sha); }}
                      className="font-mono text-info hover:text-info/80 transition-colors"
                    >
                      {formatShortSha(block.sha)}
                    </button>
                    <span className="text-text-muted truncate flex-1">{block.author}</span>
                    <span
                      className="text-text-muted shrink-0 hidden sm:inline cursor-default"
                      title={formatAbsoluteTime(block.date)}
                    >
                      {formatRelativeTime(block.date)}
                    </span>
                    {block.lines.length > 1 && (
                      <button
                        onClick={() => toggleBlock(block.sha)}
                        className="p-0.5 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {isExpanded ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 py-2 bg-primary-dark border-t border-border/30 space-y-1 text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      <User size={12} />
                      <button
                        onClick={() => onAuthorClick?.(block.author)}
                        className="text-text-secondary hover:text-accent"
                      >
                        {block.author}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span title={formatAbsoluteTime(block.date)}>{formatRelativeTime(block.date)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <GitCommit size={12} className="mt-0.5 shrink-0" />
                      <span>{block.lines[0].message}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-x-auto">
          <pre className="text-sm leading-6 font-mono">
            {lines.map((line, i) => (
              <div
                key={i}
                className="flex hover:bg-surface/20 transition-colors"
                style={{ backgroundColor: hoveredSha === line.sha ? 'rgba(88, 166, 255, 0.04)' : undefined }}
              >
                <span className="w-10 text-right px-2 text-text-muted select-none shrink-0 border-r border-border/30 text-xs">
                  {line.lineNumber}
                </span>
                <span className="px-3 text-text-primary whitespace-pre">
                  {line.content || '\u00A0'}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {hoveredCommit && (
        <div className="fixed z-50 bg-surface border border-border rounded-lg shadow-xl px-3 py-2 text-sm pointer-events-none animate-fade-in" style={{
          left: 340,
          top: 0,
          transform: 'translateY(-100%)',
        }}>
          <p className="font-medium text-text-primary">{hoveredCommit.message}</p>
          <p className="text-text-muted text-xs mt-1">{hoveredCommit.authorName} committed {formatRelativeTime(hoveredCommit.committedAt)}</p>
        </div>
      )}
    </div>
  );
}
