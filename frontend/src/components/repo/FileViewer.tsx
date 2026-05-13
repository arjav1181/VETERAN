import { useState, useMemo, useCallback } from 'react';
import {
  Download, Copy, Eye, FileEdit, Clock, GitBranch, AlertTriangle,
  FileText, Maximize2, Minimize2, Image, Table,
} from 'lucide-react';
import { cn, formatFileSize, getLanguageFromFilename, isBinaryFile } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

interface FileViewerProps {
  filename: string;
  content: string;
  size: number;
  mimeType?: string;
  loading?: boolean;
  error?: string | null;
  onRaw?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onHistory?: () => void;
  onBlame?: () => void;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-16 bg-surface rounded animate-pulse" />
        ))}
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-4 bg-surface rounded animate-pulse shrink-0" />
            <div className="h-4 bg-surface rounded animate-pulse flex-1" style={{ width: `${40 + Math.random() * 60}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BinaryDisplay({ content, filename }: { content: string; filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext);

  if (isImage) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#0d1117]">
        <img
          src={`data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${btoa(content)}`}
          alt={filename}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
      </div>
    );
  }

  if (content.length < 1000) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2 text-warning">
          <AlertTriangle size={16} />
          <span className="text-sm">Binary file</span>
        </div>
        <pre className="font-mono text-xs text-text-muted leading-relaxed">
          {Array.from({ length: Math.min(Math.ceil(content.length / 16), 50) }).map((_, row) => {
            const hex = content.slice(row * 16, row * 16 + 16);
            const hexStr = Array.from(hex).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
            const ascii = Array.from(hex).map(c => c.match(/[ -~]/) ? c : '.').join('');
            return (
              <div key={row} className="flex gap-4 hover:bg-surface/40">
                <span className="text-text-muted w-16 shrink-0">{(row * 16).toString(16).padStart(8, '0')}</span>
                <span className="text-text-secondary font-mono">{hexStr.padEnd(47)}</span>
                <span className="text-text-muted">|{ascii}|</span>
              </div>
            );
          })}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <FileText size={48} className="mb-4 opacity-30" />
      <p className="text-lg font-medium mb-1">{filename}</p>
      <p className="text-sm mb-4">{formatFileSize(content.length)} binary file</p>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface/80 rounded-lg text-sm text-text-primary transition-colors border border-border">
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
}

function CsvTable({ content }: { content: string }) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const lines = useMemo(() => content.trim().split('\n'), [content]);
  const headers = useMemo(() => lines[0]?.split(',').map(h => h.replace(/^"|"$/g, '').trim()) || [], [lines]);
  const rows = useMemo(() => {
    const data = lines.slice(1).map(line => {
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === ',' && !inQuotes) { cols.push(current.replace(/^"|"$/g, '').trim()); current = ''; }
        else current += ch;
      }
      cols.push(current.replace(/^"|"$/g, '').trim());
      return cols;
    });
    if (sortCol !== null) {
      data.sort((a, b) => {
        const va = (a[sortCol] || '').toLowerCase();
        const vb = (b[sortCol] || '').toLowerCase();
        const numA = parseFloat(va);
        const numB = parseFloat(vb);
        if (!isNaN(numA) && !isNaN(numB)) return sortDir === 'asc' ? numA - numB : numB - numA;
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return data;
  }, [lines, sortCol, sortDir]);

  const toggleSort = (col: number) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface">
            {headers.map((h, i) => (
              <th
                key={i}
                onClick={() => toggleSort(i)}
                className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  {h}
                  {sortCol === i && <span className="text-accent">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-surface/40 transition-colors border-b border-border/50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-sm text-text-secondary whitespace-nowrap max-w-[300px] truncate">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FileViewer({
  filename, content, size, mimeType, loading = false, error = null,
  onRaw, onDownload, onCopy, onEdit, onHistory, onBlame, className,
}: FileViewerProps) {
  const [showSource, setShowSource] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());
  const [lineRangeStart, setLineRangeStart] = useState<number | null>(null);

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isMd = ext === 'md' || ext === 'mdx';
  const isCsv = ext === 'csv';
  const binary = isBinaryFile(mimeType, filename);

  const handleLineClick = useCallback((lineNum: number, e: React.MouseEvent) => {
    if (e.shiftKey && lineRangeStart !== null) {
      const start = Math.min(lineRangeStart, lineNum);
      const end = Math.max(lineRangeStart, lineNum);
      const range = new Set<number>();
      for (let i = start; i <= end; i++) range.add(i);
      setHighlightedLines(range);
    } else {
      setLineRangeStart(lineNum);
      setHighlightedLines(prev => {
        const next = new Set(prev);
        if (next.has(lineNum)) next.delete(lineNum);
        else next.add(lineNum);
        return next;
      });
    }
  }, [lineRangeStart]);

  const language = getLanguageFromFilename(filename);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-primary-dark">
        <AlertTriangle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium text-text-primary mb-1">File not found</p>
        <p className="text-sm text-text-muted">{error}</p>
      </div>
    );
  }

  const lines = binary ? [] : content.split('\n');

  const toolbarButtons = [
    { icon: Download, label: 'Raw', onClick: onRaw },
    { icon: Copy, label: 'Copy', onClick: onCopy },
    { icon: FileEdit, label: 'Edit', onClick: onEdit },
    { icon: Clock, label: 'History', onClick: onHistory },
    { icon: GitBranch, label: 'Blame', onClick: onBlame },
  ];

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
          <FileText size={16} className="text-text-muted" />
          {filename}
          {size > 0 && <span className="text-text-muted font-normal">({formatFileSize(size)})</span>}
        </div>
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface/80 rounded-md transition-colors"
              title={label}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
          {!binary && (
            <>
              <div className="w-px h-5 bg-border mx-1" />
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={cn('p-1.5 rounded-md transition-colors', wrapLines ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary')}
                title="Toggle word wrap"
              >
                {wrapLines ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {binary ? (
          <BinaryDisplay content={content} filename={filename} />
        ) : isMd && !showSource ? (
          <div className="p-6">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowSource(true)}
                className="text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-surface transition-colors"
              >
                View source
              </button>
            </div>
            <MarkdownRenderer content={content} />
          </div>
        ) : isCsv ? (
          <CsvTable content={content} />
        ) : (
          <div className="flex">
            <div className="select-none text-right text-xs leading-6 text-text-muted bg-surface/30 py-0 min-w-[50px] shrink-0 border-r border-border/50">
              {lines.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => handleLineClick(i + 1, e)}
                  className={cn(
                    'px-3 cursor-pointer hover:text-text-primary transition-colors',
                    highlightedLines.has(i + 1) && 'text-accent bg-accent/10'
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className={cn(
              'flex-1 text-sm leading-6 py-0 overflow-x-auto',
              wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
            )}>
              <code className="px-4 inline-block min-w-full">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      'hover:bg-surface/20',
                      highlightedLines.has(i + 1) && 'bg-accent/5'
                    )}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
