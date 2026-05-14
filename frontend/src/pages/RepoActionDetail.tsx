import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Clock, Loader2, CheckCircle2, XCircle, Ban, SkipForward,
  GitBranch, User, Calendar, Copy, Download, ChevronDown, ChevronRight, Search,
} from 'lucide-react';
import { cn, formatRelativeTime, formatShortSha } from '@/lib/utils';
import { actionsApi } from '@lib/api/endpoints/actions';
import { getRepoParams } from '@lib/route-utils';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { JobGraph } from '@/components/actions/JobGraph';
import type { CIPipeline, CIJob } from '@/types';

function JobStatusIcon({ status, conclusion, size = 14 }: { status: string; conclusion: string | null; size?: number }) {
  if (status === 'queued' || status === 'pending') {
    return (
      <motion.span
        className="text-[#484F58] inline-flex"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        &#9679;
      </motion.span>
    );
  }
  if (status === 'in_progress') return <Loader2 size={size} className="animate-spin text-[#E8B84B]" />;
  if (status === 'completed') {
    if (conclusion === 'success') return <CheckCircle2 size={size} className="text-[#3FB950]" />;
    if (conclusion === 'failure' || conclusion === 'timed_out') return <XCircle size={size} className="text-[#F85149]" />;
    if (conclusion === 'cancelled') return <Ban size={size} className="text-[#484F58]" />;
    if (conclusion === 'skipped') return <SkipForward size={size} className="text-[#484F58]" />;
    return <Clock size={size} className="text-[#484F58]" />;
  }
  if (status === 'cancelled') return <Ban size={size} className="text-[#484F58]" />;
  if (status === 'skipped') return <SkipForward size={size} className="text-[#484F58]" />;
  return <Clock size={size} className="text-[#484F58]" />;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '--';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}m ${s}s`;
}

const ANSI_COLORS: Record<string, string> = {
  '30': 'text-[#484F58]', '31': 'text-[#F85149]', '32': 'text-[#3FB950]',
  '33': 'text-[#D29922]', '34': 'text-[#58A6FF]', '35': 'text-[#BC8CFF]',
  '36': 'text-[#39D2C0]', '37': 'text-[#E6EDF3]',
  '90': 'text-[#484F58]', '91': 'text-[#F85149]', '92': 'text-[#3FB950]',
  '93': 'text-[#D29922]', '94': 'text-[#58A6FF]', '95': 'text-[#BC8CFF]',
  '96': 'text-[#39D2C0]', '97': 'text-[#E6EDF3]',
};

function parseAnsi(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+(?:;\d+)*)m/g;
  let lastIndex = 0;
  let currentColor = 'text-[#8D96A0]';
  let match: RegExpExecArray | null;

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
    currentColor = colorCode ? ANSI_COLORS[colorCode] : 'text-[#8D96A0]';
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

interface LogViewerInnerProps {
  jobId: string;
  content?: string;
  loading?: boolean;
}

function LogViewerInner({ jobId, content, loading }: LogViewerInnerProps) {
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const sampleLogs = content || `[2024-01-15T10:30:00Z] \x1b[32mStarting job: ${jobId}\x1b[0m
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sampleLogs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([sampleLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-${jobId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-3 w-8 bg-[#1C2128] rounded animate-pulse" />
            <div className={cn('h-3 bg-[#1C2128] rounded animate-pulse', i % 2 === 0 ? 'w-3/4' : 'w-1/2')} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-sm font-mono">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#21262D] bg-[#161B22] sticky top-0 z-10">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484F58]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-7 pr-2 py-1 text-xs bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:border-[#E8B84B]/50"
          />
        </div>
        <span className="text-xs text-[#484F58]">{filteredLines.length} lines</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            'px-2 py-0.5 text-xs rounded transition-colors',
            autoScroll ? 'text-[#E8B84B] bg-[#E8B84B]/10' : 'text-[#484F58] hover:text-[#8D96A0]'
          )}
        >
          Auto
        </button>
        <button
          onClick={handleCopy}
          className="p-1 text-[#484F58] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#1C2128]"
          title="Copy logs"
        >
          {copied ? <CheckCircle2 size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
        </button>
        <button
          onClick={handleDownload}
          className="p-1 text-[#484F58] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#1C2128]"
          title="Download logs"
        >
          <Download size={14} />
        </button>
      </div>

      <div
        className="overflow-auto p-4 leading-6 max-h-[500px]"
        style={{ minHeight: '200px' }}
      >
        {filteredLines.length === 0 ? (
          <div className="py-8 text-center text-[#484F58] text-xs">No matching log lines</div>
        ) : (
          filteredLines.map((line, i) => (
            <div key={i} className="flex hover:bg-white/[0.02] group">
              <span className="text-[#484F58] w-8 text-right shrink-0 text-[10px] mr-4 select-none">{i + 1}</span>
              <span className="whitespace-pre-wrap break-all">{parseAnsi(line)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function RepoActionDetail() {
  const { owner, repo: name } = getRepoParams();
  const runId = window.location.pathname.split('/').filter(Boolean)[3];
  const navigate = useNavigate();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(true);

  const { data: run, isLoading: runLoading, error: runError, refetch: refetchRun } = useQuery({
    queryKey: ['action-run', owner, name, runId],
    queryFn: () => actionsApi.getPipeline(owner!, name!, runId!),
    enabled: !!owner && !!name && !!runId,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['action-jobs', owner, name, runId],
    queryFn: () => actionsApi.listJobs(owner!, name!, runId!),
    enabled: !!owner && !!name && !!runId,
  });

  const sortedJobs = jobs ?? [];
  const activeJob = sortedJobs.find(j => j.id === activeJobId) ?? sortedJobs[0] ?? null;

  if (activeJob && !activeJobId) {
    setActiveJobId(activeJob.id);
  }

  if (runLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="h-5 w-40 bg-[#1C2128] rounded animate-pulse mb-6" />
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 mb-6 space-y-3">
            <div className="h-6 w-1/3 bg-[#1C2128] rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-[#1C2128] rounded animate-pulse" />
          </div>
          <div className="h-64 bg-[#161B22] border border-[#21262D] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (runError || !run) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/actions`)}
            className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to workflows
          </button>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#1C2128] flex items-center justify-center mb-4">
              <XCircle size={32} className="text-[#F85149]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">Run not found</h3>
            <p className="text-sm text-[#8D96A0] mb-4">The requested workflow run could not be found.</p>
            <VeteranButton onClick={() => refetchRun()} variant="primary" size="sm">Retry</VeteranButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/actions`)}
          className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to workflows
        </button>

        {/* Header */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {run.status === 'completed' && run.conclusion === 'success' && <CheckCircle2 size={22} className="text-[#3FB950]" />}
              {run.status === 'completed' && run.conclusion === 'failure' && <XCircle size={22} className="text-[#F85149]" />}
              {run.status === 'in_progress' && <Loader2 size={22} className="animate-spin text-[#E8B84B]" />}
              {run.status === 'queued' && (
                <motion.span className="text-[#484F58] text-xl" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                  &#9679;
                </motion.span>
              )}
              <div>
                <h2 className="text-lg font-semibold text-[#E6EDF3]">{run.name}</h2>
                <span className="text-sm text-[#8D96A0]">Run #{run.runNumber}</span>
              </div>
              <VeteranBadge variant={
                run.status === 'completed' && run.conclusion === 'success' ? 'success' :
                run.status === 'completed' && run.conclusion === 'failure' ? 'danger' :
                run.status === 'in_progress' ? 'info' : 'default'
              } size="sm">
                {run.conclusion || run.status}
              </VeteranBadge>
            </div>
            <div className="flex items-center gap-2">
              {run.status === 'completed' && (
                <VeteranButton
                  size="sm"
                  variant="secondary"
                  icon={<Loader2 size={14} />}
                  onClick={() => actionsApi.rerun(owner!, name!, runId!).then(() => refetchRun())}
                >
                  Rerun
                </VeteranButton>
              )}
              {(run.status === 'in_progress' || run.status === 'queued') && (
                <VeteranButton
                  size="sm"
                  variant="danger"
                  icon={<Ban size={14} />}
                  onClick={() => actionsApi.cancel(owner!, name!, runId!).then(() => refetchRun())}
                >
                  Cancel
                </VeteranButton>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#8D96A0] flex-wrap">
            <span className="flex items-center gap-1.5">
              <User size={12} />{run.actorUsername}
            </span>
            <span className="text-[#30363D]">|</span>
            <span className="flex items-center gap-1.5">
              <GitBranch size={12} />{run.branchName}
            </span>
            <span className="text-[#30363D]">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />{run.triggerEvent}
            </span>
            <span className="text-[#30363D]">|</span>
            <span>SHA: <code className="text-[#E6EDF3] font-mono">{formatShortSha(run.commitSha)}</code></span>
            <span className="text-[#30363D]">|</span>
            <span>Duration: {formatDuration(run.duration)}</span>
            <span className="text-[#30363D]">|</span>
            <span className="text-[#484F58]">{formatRelativeTime(run.createdAt)}</span>
          </div>
        </div>

        {/* Job graph DAG */}
        <div className="mb-6">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#E6EDF3] hover:bg-[#1C2128] transition-colors w-full"
          >
            {showGraph ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Job Graph
          </button>
          <AnimatePresence>
            {showGraph && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {jobsLoading ? (
                  <div className="h-48 bg-[#161B22] border border-t-0 border-[#21262D] rounded-b-lg flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-[#484F58]" />
                  </div>
                ) : sortedJobs.length > 0 ? (
                  <JobGraph jobs={sortedJobs} onJobClick={setActiveJobId} />
                ) : (
                  <div className="py-8 text-center text-[#484F58] text-sm bg-[#161B22] border border-t-0 border-[#21262D] rounded-b-lg">
                    No jobs to display
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Job sidebar + Log viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-[#21262D] text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
              Jobs ({sortedJobs.length})
            </div>
            <div className="p-1.5 space-y-0.5 max-h-[500px] overflow-y-auto">
              {jobsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2">
                    <div className="w-3 h-3 rounded-full bg-[#1C2128] animate-pulse" />
                    <div className="h-3 flex-1 bg-[#1C2128] rounded animate-pulse" />
                    <div className="h-3 w-8 bg-[#1C2128] rounded animate-pulse" />
                  </div>
                ))
              ) : sortedJobs.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-[#484F58]">No jobs</div>
              ) : (
                sortedJobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setActiveJobId(job.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left group',
                      activeJobId === job.id
                        ? 'bg-[#1C2128] text-[#E6EDF3]'
                        : 'text-[#8D96A0] hover:bg-[#1C2128]/50 hover:text-[#E6EDF3]'
                    )}
                  >
                    <JobStatusIcon status={job.status} conclusion={job.conclusion} size={12} />
                    <span className="truncate flex-1">{job.name}</span>
                    <span className="text-[10px] text-[#484F58] shrink-0">{formatDuration(job.duration)}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#21262D] rounded-lg overflow-hidden">
            {activeJob ? (
              <div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <JobStatusIcon status={activeJob.status} conclusion={activeJob.conclusion} size={14} />
                    <span className="text-sm font-medium text-[#E6EDF3]">{activeJob.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8D96A0]">
                    {activeJob.runnerOs && <span>{activeJob.runnerOs}</span>}
                    {activeJob.duration != null && (
                      <>
                        <span className="text-[#30363D]">|</span>
                        <span>{formatDuration(activeJob.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
                <LogViewerInner jobId={activeJob.id} loading={false} />
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-[#484F58] text-sm">
                Select a job to view logs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
