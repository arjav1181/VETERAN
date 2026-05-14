import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, GitBranch, User, Calendar, Clock, Loader2,
  CheckCircle2, XCircle, SkipForward, Ban, Search, ChevronDown,
} from 'lucide-react';
import { cn, formatRelativeTime, formatShortSha } from '@/lib/utils';
import { actionsApi } from '@lib/api/endpoints/actions';
import { getRepoParams } from '@lib/route-utils';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import type { CIPipeline, CIWorkflow } from '@/types';

function StatusIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
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
  if (status === 'in_progress') {
    return <Loader2 size={16} className="animate-spin text-[#E8B84B]" />;
  }
  if (status === 'completed') {
    if (conclusion === 'success') return <CheckCircle2 size={16} className="text-[#3FB950]" />;
    if (conclusion === 'failure' || conclusion === 'timed_out') return <XCircle size={16} className="text-[#F85149]" />;
    if (conclusion === 'cancelled') return <Ban size={16} className="text-[#484F58]" />;
    if (conclusion === 'skipped') return <SkipForward size={16} className="text-[#484F58]" />;
    return <Clock size={16} className="text-[#484F58]" />;
  }
  if (status === 'cancelled') return <Ban size={16} className="text-[#484F58]" />;
  if (status === 'skipped') return <SkipForward size={16} className="text-[#484F58]" />;
  return <Clock size={16} className="text-[#484F58]" />;
}

const FILTER_OPTIONS = {
  branch: ['main', 'dev', 'feature/*', 'fix/*'],
  event: ['push', 'pull_request', 'tag', 'manual', 'schedule', 'webhook'],
  status: ['all', 'success', 'failure', 'cancelled', 'in_progress', 'queued', 'skipped'],
};

export function RepoActions() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [filterBranch, setFilterBranch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterActor, setFilterActor] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  const { data: workflows, isLoading: wfLoading } = useQuery({
    queryKey: ['actions-workflows', owner, name],
    queryFn: () => actionsApi.listWorkflows(owner!, name!),
    enabled: !!owner && !!name,
  });

  const { data: runs, isLoading, error, refetch } = useQuery({
    queryKey: ['actions', owner, name, activeWorkflow],
    queryFn: () => actionsApi.listPipelines(owner!, name!, {
      ...(filterStatus && filterStatus !== 'all' ? { status: filterStatus } : {}),
      ...(filterBranch ? { branch: filterBranch } : {}),
      ...(filterActor ? { actor: filterActor } : {}),
      ...(filterEvent ? { event: filterEvent } : {}),
    }),
    enabled: !!owner && !!name,
  });

  const filteredRuns = (runs ?? []).filter(run => {
    if (activeWorkflow && run.workflowFile !== activeWorkflow) return false;
    return true;
  });

  const renderSkeleton = () => (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 shrink-0 border-r border-[#21262D] bg-[#0D1117] p-4 space-y-3">
        <div className="h-9 bg-[#1C2128] rounded-lg animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-[#1C2128] animate-pulse" />
            <div className="h-4 flex-1 bg-[#1C2128] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex-1 bg-[#0D1117] p-6 space-y-3">
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-[#1C2128] rounded-lg animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg">
            <div className="w-4 h-4 bg-[#1C2128] rounded animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/3 bg-[#1C2128] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[#1C2128] rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-[#1C2128] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading || wfLoading) return renderSkeleton();

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1C2128] flex items-center justify-center">
            <XCircle size={32} className="text-[#F85149]" />
          </div>
          <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">Failed to load workflows</h3>
          <p className="text-sm text-[#8D96A0] mb-4">There was an error loading the workflow runs.</p>
          <VeteranButton onClick={() => refetch()} variant="primary" size="sm">Retry</VeteranButton>
        </div>
      </div>
    );
  }

  const uniqueActors = [...new Set((runs ?? []).map(r => r.actorUsername))];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className={cn(
        'w-64 shrink-0 border-r border-[#21262D] bg-[#0D1117] flex flex-col transition-all duration-200',
        !sidebarOpen && 'w-0 overflow-hidden border-r-0'
      )}>
        <div className="p-4 border-b border-[#21262D]">
          <VeteranButton
            className="w-full"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate(`/${owner}/${name}/actions/new`)}
          >
            New workflow
          </VeteranButton>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button
            onClick={() => setActiveWorkflow(null)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
              !activeWorkflow
                ? 'bg-[#1C2128] text-[#E6EDF3]'
                : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50'
            )}
          >
            <span>All workflows</span>
            {runs && (
              <span className="text-xs bg-[#21262D] text-[#8D96A0] px-1.5 py-0.5 rounded-full">{runs.length}</span>
            )}
          </button>

          {workflows?.map(wf => (
            <button
              key={wf.id}
              onClick={() => setActiveWorkflow(wf.name)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                activeWorkflow === wf.name
                  ? 'bg-[#1C2128] text-[#E6EDF3]'
                  : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50'
              )}
            >
              <span className={cn(
                'w-2 h-2 rounded-full shrink-0',
                !wf.lastRunStatus && 'bg-[#484F58]',
                wf.lastRunStatus === 'success' && 'bg-[#3FB950]',
                wf.lastRunStatus === 'failure' && 'bg-[#F85149]',
                wf.lastRunStatus === 'cancelled' && 'bg-[#484F58]',
                wf.lastRunStatus === 'skipped' && 'bg-[#484F58]',
              )} />
              <span className="truncate">{wf.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-[#0D1117] overflow-y-auto">
        <div className="p-6 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Play size={20} className="text-[#E8B84B]" />
              <h1 className="text-lg font-bold text-[#E6EDF3]">Actions</h1>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative">
              <select
                value={filterBranch}
                onChange={e => setFilterBranch(e.target.value)}
                className="appearance-none bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 min-w-[110px]"
              >
                <option value="">Branch &#9662;</option>
                {FILTER_OPTIONS.branch.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D96A0] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterEvent}
                onChange={e => setFilterEvent(e.target.value)}
                className="appearance-none bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 min-w-[110px]"
              >
                <option value="">Event &#9662;</option>
                {FILTER_OPTIONS.event.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D96A0] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 min-w-[110px]"
              >
                <option value="">Status &#9662;</option>
                {FILTER_OPTIONS.status.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D96A0] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterActor}
                onChange={e => setFilterActor(e.target.value)}
                className="appearance-none bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 min-w-[110px]"
              >
                <option value="">Actor &#9662;</option>
                {uniqueActors.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D96A0] pointer-events-none" />
            </div>
          </div>

          {filteredRuns.length === 0 ? (
            <VeteranEmptyState
              icon="code"
              title="No workflow runs"
              description={activeWorkflow ? `No runs for "${activeWorkflow}"` : 'This repository has no workflow runs yet.'}
              action={{ label: 'Create a workflow', onClick: () => navigate(`/${owner}/${name}/actions/new`) }}
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredRuns.map((run, idx) => (
                  <motion.div
                    layout
                    key={run.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onClick={() => navigate(`/${owner}/${name}/actions/runs/${run.id}`)}
                    className="flex items-center gap-3 px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg hover:border-[#30363D] transition-colors cursor-pointer group"
                  >
                    <StatusIcon status={run.status} conclusion={run.conclusion} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#E6EDF3] truncate">{run.name}</span>
                        <span className="text-xs text-[#8D96A0] shrink-0">#{run.runNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8D96A0] mt-0.5 flex-wrap">
                        <span className="truncate max-w-[200px]">{run.commitMessage}</span>
                        <span className="text-[#484F58]">&#183;</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1C2128] border border-[#30363D] rounded text-[10px] text-[#8D96A0]">
                          <GitBranch size={10} />{run.branchName}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#1C2128] border border-[#30363D] rounded text-[10px] font-mono text-[#8D96A0]">
                          {formatShortSha(run.commitSha)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VeteranAvatar src={run.actorAvatar} name={run.actorUsername} size="sm" />
                      <div className="text-right">
                        {run.duration != null && (
                          <div className="text-xs text-[#8D96A0]">
                            {run.duration >= 60000
                              ? `${(run.duration / 60000).toFixed(1)}m`
                              : `${(run.duration / 1000).toFixed(0)}s`
                            }
                          </div>
                        )}
                        <div className="text-[10px] text-[#484F58]">{formatRelativeTime(run.createdAt)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
