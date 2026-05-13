import { useState, useEffect, useRef } from 'react';
import { Download, Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogViewerProps {
  jobId: string;
  logs?: string;
  loading?: boolean;
  streaming?: boolean;
  className?: string;
}

const ANSI_COLORS: Record<string, string> = {
  '30': 'text-gray-500', '31': 'text-danger', '32': 'text-success',
  '33': 'text-warning', '34': 'text-info', '35': 'text-purple-400',
  '36': 'text-cyan-400', '37': 'text-text-primary',
  '90': 'text-text-muted', '91': 'text-red-400', '92': 'text-green-400',
  '93': 'text-yellow-400', '94': 'text-blue-400', '95': 'text-pink-400',
  '96': 'text-cyan-400', '97': 'text-text-primary',
};

function parseAnsi(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+(?:;\d+)*)m/g;
  let lastIndex = 0;
  let currentColor = 'text-text-secondary';
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={parts.length} className={currentColor}>
          {str.slice(lastIndex, match.index)}
        </span>
      );
    }
    const codes = match[1].split(';');
    const colorCode = codes.find(c => ANSI_COLORS[`${c}`]);
    currentColor = colorCode ? ANSI_COLORS[colorCode] : 'text-text-secondary';
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(
      <span key={parts.length} className={currentColor}>
        {str.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}

export function LogViewer({ jobId, logs, loading, streaming, className }: LogViewerProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!logContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const sampleLogs = logs || `[2024-01-15T10:30:00Z] \x1b[32mStarting job: build (job-id: ${jobId})\x1b[0m
[2024-01-15T10:30:01Z] \x1b[36mCloning repository...\x1b[0m
[2024-01-15T10:30:02Z] Cloning into '.'...
[2024-01-15T10:30:03Z] \x1b[90mremote: Enumerating objects: 1234\x1b[0m
[2024-01-15T10:30:04Z] \x1b[90mremote: Counting objects: 100% (1234/1234)\x1b[0m
[2024-01-15T10:30:05Z] \x1b[90mremote: Compressing objects: 100% (567/567)\x1b[0m
[2024-01-15T10:30:06Z] Receiving objects: 100% (1234/1234), 2.5 MiB
[2024-01-15T10:30:07Z] Resolving deltas: 100% (567/567)
[2024-01-15T10:30:08Z] \x1b[36mInstalling dependencies...\x1b[0m
[2024-01-15T10:30:09Z] npm install
[2024-01-15T10:30:10Z] \x1b[33mWARN: deprecated package lodash@4.17.21\x1b[0m
[2024-01-15T10:30:11Z] added 1234 packages in 3s
[2024-01-15T10:30:12Z] \x1b[36mRunning build...\x1b[0m
[2024-01-15T10:30:13Z] npm run build
[2024-01-15T10:30:14Z] \x1b[32m> project@1.0.0 build\x1b[0m
[2024-01-15T10:30:15Z] \x1b[32m> vite build\x1b[0m
[2024-01-15T10:30:16Z] \x1b[90mvite v5.2.0 building for production...\x1b[0m
[2024-01-15T10:30:17Z] transforming...
[2024-01-15T10:30:18Z] \x1b[32m✓ 123 modules transformed.\x1b[0m
[2024-01-15T10:30:19Z] rendering chunks...
[2024-01-15T10:30:20Z] computing hashes...
[2024-01-15T10:30:21Z] \x1b[32m✓ built in 2.5s\x1b[0m
[2024-01-15T10:30:22Z] \x1b[32mBuild completed successfully\x1b[0m
[2024-01-15T10:30:23Z] \x1b[90mJob finished with status: success\x1b[0m`;

  const logLines = sampleLogs.split('\n');
  const filteredLines = search
    ? logLines.filter(l => l.toLowerCase().includes(search.toLowerCase()))
    : logLines;

  return (
    <div className={cn('bg-[#0d1117] text-sm font-mono', className)}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface sticky top-0 z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-7 pr-2 py-1 text-xs bg-primary-dark border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <span className="text-xs text-text-muted">{filteredLines.length} lines</span>
        {streaming && <Loader2 size={12} className="animate-spin text-info" />}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn('p-1 rounded text-xs transition-colors', autoScroll ? 'text-accent' : 'text-text-muted hover:text-text-primary')}
          title="Auto-scroll"
        >
          Auto
        </button>
        <button className="p-1 text-text-muted hover:text-text-primary transition-colors" title="Download logs">
          <Download size={14} />
        </button>
      </div>

      {!collapsed && (
        <div
          ref={logContainerRef}
          onScroll={handleScroll}
          className="overflow-auto p-3 leading-6 max-h-[500px]"
          style={{ minHeight: '200px' }}
        >
          {filteredLines.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">No matching log lines</div>
          ) : (
            filteredLines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/[0.02]">
                <span className="text-text-muted w-8 text-right shrink-0 text-2xs mr-3 select-none">{i + 1}</span>
                <span className="whitespace-pre-wrap break-all">{parseAnsi(line)}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
