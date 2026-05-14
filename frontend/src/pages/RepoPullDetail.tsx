import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { pullApi } from '@lib/api/endpoints/pulls';
import { getApiError } from '@lib/api/client';
import { getRepoParams, getPullNumber } from '@lib/route-utils';
import {
  ArrowLeft,
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  GitBranch,
  GitCommit,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Check,
  Plus,
  Minus,
  FileCode,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime, formatShortSha } from '@/lib/utils';

/* ───────── helpers ───────── */

function formatDuration(start: string, end?: string | null) {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const ms = e - s;
  if (ms < 1000) return '<1s';
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function plural(n: number, w: string) {
  return `${n} ${w}${n !== 1 ? 's' : ''}`;
}

/* ───────── loading ───────── */

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="h-5 w-32 bg-[#1C2128] rounded animate-pulse" />
        <div className="h-7 w-3/4 bg-[#1C2128] rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-[#1C2128] rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mt-4">
          <div className="space-y-3">
            <div className="h-10 bg-[#1C2128] rounded animate-pulse" />
            <div className="h-40 bg-[#1C2128] rounded animate-pulse" />
          </div>
          <div className="h-60 bg-[#1C2128] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ───────── error ───────── */

function ErrorState({
  owner,
  repo,
  message,
}: {
  owner: string;
  repo: string;
  message?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${repo}/pulls`)}
          className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to pull requests
        </button>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-[#F85149]" />
          </div>
          <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">
            Pull request not found
          </h3>
          <p className="text-sm text-[#8D96A0] max-w-md">
            {message || 'The requested pull request could not be found.'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────── merge dropdown ───────── */

type MergeMethod = 'merge' | 'squash' | 'rebase';

function MergeMethodDropdown({
  method,
  onChange,
  autoMerge,
  onAutoMergeChange,
  onMerge,
  merging,
  canMerge,
}: {
  method: MergeMethod;
  onChange: (m: MergeMethod) => void;
  autoMerge: boolean;
  onAutoMergeChange: (v: boolean) => void;
  onMerge: () => void;
  merging: boolean;
  canMerge: boolean;
}) {
  const [open, setOpen] = useState(false);

  const label: Record<MergeMethod, string> = {
    merge: 'Create a merge commit',
    squash: 'Squash and merge',
    rebase: 'Rebase and merge',
  };

  const desc: Record<MergeMethod, string> = {
    merge: 'All commits will be added to the target branch via a merge commit.',
    squash: 'All commits will be squashed into a single commit.',
    rebase: 'All commits will be rebased onto the target branch.',
  };

  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={onMerge}
          disabled={!canMerge || merging}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-l-lg transition-colors',
            canMerge
              ? 'bg-[#E8B84B] text-[#0D1117] hover:bg-[#E8B84B]/90 active:bg-[#E8B84B]/80'
              : 'bg-[#21262D] text-[#484F58] border border-[#30363D] cursor-not-allowed',
          )}
        >
          {merging ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GitMerge size={16} />
          )}
          {merging ? 'Merging...' : `Merge pull request`}
        </button>
        <button
          onClick={() => setOpen(!open)}
          disabled={!canMerge || merging}
          className={cn(
            'flex items-center justify-center px-3 rounded-r-lg border-l transition-colors',
            canMerge
              ? 'bg-[#E8B84B] text-[#0D1117] hover:bg-[#E8B84B]/90 active:bg-[#E8B84B]/80'
              : 'bg-[#21262D] text-[#484F58] border border-[#30363D] cursor-not-allowed',
          )}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-1">
              {(['merge', 'squash', 'rebase'] as MergeMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-md transition-colors',
                    method === m
                      ? 'bg-[#E8B84B]/10'
                      : 'hover:bg-[#1C2128]',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                      method === m
                        ? 'border-[#E8B84B]'
                        : 'border-[#484F58]',
                    )}
                  >
                    {method === m && (
                      <span className="w-2 h-2 rounded-full bg-[#E8B84B]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        method === m ? 'text-[#E8B84B]' : 'text-[#E6EDF3]',
                      )}
                    >
                      {label[m]}
                    </span>
                    <p className="text-xs text-[#8D96A0] mt-0.5">
                      {desc[m]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-[#30363D] px-3 py-2">
              <label className="flex items-center gap-2 text-sm text-[#8D96A0] cursor-pointer hover:text-[#E6EDF3] transition-colors">
                <input
                  type="checkbox"
                  checked={autoMerge}
                  onChange={(e) => onAutoMergeChange(e.target.checked)}
                  className="rounded border-[#30363D] bg-[#0D1117] text-[#E8B84B] focus:ring-[#E8B84B] focus:ring-offset-0"
                />
                Enable auto-merge
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── merge status card ───────── */

function MergeStatusCard({
  pull,
  mergeMethod,
  onMergeMethodChange,
  autoMerge,
  onAutoMergeChange,
  onMerge,
  merging,
}: {
  pull: any;
  mergeMethod: MergeMethod;
  onMergeMethodChange: (m: MergeMethod) => void;
  autoMerge: boolean;
  onAutoMergeChange: (v: boolean) => void;
  onMerge: () => void;
  merging: boolean;
}) {
  const isMerged = pull.state === 'merged';
  const isClosed = pull.state === 'closed' && !isMerged;
  const isOpen = pull.state === 'open';
  const isDraft = pull.isDraft;
  const canMerge =
    isOpen && !isDraft && pull.isMergeable !== false;

  const items = [
    { label: 'Review required', ok: false },
    { label: 'All checks passed', ok: true },
    { label: 'No merge conflicts', ok: pull.isMergeable !== false },
    { label: 'Branch is up to date', ok: true },
  ];

  if (isMerged) {
    return (
      <div className="border border-[#30363D] rounded-lg bg-[#161B22] p-4">
        <div className="flex items-center gap-2 text-[#BC8CFF]">
          <GitMerge size={20} />
          <span className="font-semibold text-sm">Pull request successfully merged</span>
        </div>
        {pull.mergedAt && (
          <p className="text-xs text-[#8D96A0] mt-1">
            Merged {formatRelativeTime(pull.mergedAt)}
            {pull.mergedByUsername ? ` by ${pull.mergedByUsername}` : ''}
          </p>
        )}
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="border border-[#30363D] rounded-lg bg-[#161B22] p-4">
        <div className="flex items-center gap-2 text-[#8D96A0]">
          <GitPullRequestClosed size={20} />
          <span className="font-semibold text-sm">Pull request closed</span>
        </div>
        {pull.closedAt && (
          <p className="text-xs text-[#8D96A0] mt-1">
            Closed {formatRelativeTime(pull.closedAt)}
            {pull.closedByUsername ? ` by ${pull.closedByUsername}` : ''}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[#30363D] rounded-lg bg-[#161B22] p-4 space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm">
          {item.ok ? (
            <CheckCircle size={14} className="text-[#3FB950] shrink-0" />
          ) : (
            <XCircle size={14} className="text-[#F85149] shrink-0" />
          )}
          <span
            className={item.ok ? 'text-[#E6EDF3]' : 'text-[#F85149]'}
          >
            {item.label}
          </span>
        </div>
      ))}

      {isDraft && (
        <div className="flex items-center gap-2 p-2.5 bg-[#21262D] border border-[#30363D] rounded-lg text-sm text-[#8D96A0]">
          <AlertTriangle size={14} className="shrink-0" />
          <span>This pull request is still a work in progress.</span>
        </div>
      )}

      <MergeMethodDropdown
        method={mergeMethod}
        onChange={onMergeMethodChange}
        autoMerge={autoMerge}
        onAutoMergeChange={onAutoMergeChange}
        onMerge={onMerge}
        merging={merging}
        canMerge={canMerge}
      />

      <p className="text-xs text-[#8D96A0]">
        You can also open this in a{' '}
        <button className="text-[#4493F8] hover:underline">Codespace</button>.
      </p>
    </div>
  );
}

/* ───────── commit row ───────── */

function CommitRow({ commit }: { commit: any }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#1C2128] transition-colors">
      {commit.authorAvatar ? (
        <img
          src={commit.authorAvatar}
          alt=""
          className="w-6 h-6 rounded-full mt-0.5 shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] text-[#8D96A0] font-medium shrink-0 mt-0.5">
          {(commit.authorName || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#E6EDF3] truncate">
            {commit.messageHeadline || commit.message || ''}
          </span>
          <span className="text-xs text-[#3FB950] shrink-0">
            +{commit.additions || 0}
          </span>
          <span className="text-xs text-[#F85149] shrink-0">
            -{commit.deletions || 0}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8D96A0] mt-0.5">
          <span>{commit.authorName}</span>
          <span>committed {formatRelativeTime(commit.committedAt || commit.authoredAt)}</span>
        </div>
      </div>
      <button className="text-xs text-[#8D96A0] font-mono hover:text-[#4493F8] transition-colors shrink-0 px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
        {commit.shortSha || formatShortSha(commit.sha)}
      </button>
    </div>
  );
}

/* ───────── diff file accordion ───────── */

function DiffFileAccordion({
  file,
  viewType,
}: {
  file: any;
  viewType: 'unified' | 'split';
}) {
  const [expanded, setExpanded] = useState(true);
  const [viewed, setViewed] = useState(false);

  const statusColor =
    file.status === 'added'
      ? 'text-[#3FB950] bg-[#3FB950]/10'
      : file.status === 'removed' || file.status === 'deleted'
        ? 'text-[#F85149] bg-[#F85149]/10'
        : 'text-[#E8B84B] bg-[#E8B84B]/10';

  const filename = file.newPath || file.filename || file.new_name || file.old_name || '';

  return (
    <div className="border border-[#30363D] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-left transition-colors',
          statusColor,
        )}
      >
        {expanded ? (
          <ChevronDown size={14} className="shrink-0" />
        ) : (
          <ChevronRight size={14} className="shrink-0" />
        )}
        <FileCode size={14} className="shrink-0" />
        <span className="flex-1 truncate font-mono text-xs">{filename}</span>
        <span className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="text-[#3FB950]">+{file.additions || 0}</span>
          <span className="text-[#F85149]">-{file.deletions || 0}</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewed(!viewed);
          }}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors',
            viewed
              ? 'text-[#3FB950] bg-[#3FB950]/10'
              : 'text-[#8D96A0] hover:text-[#E6EDF3]',
          )}
        >
          {viewed ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{viewed ? 'Viewed' : 'View'}</span>
        </button>
      </button>

      {expanded && (
        <div className="border-t border-[#30363D]">
          {file.patch && (
            <div className="font-mono text-xs leading-relaxed overflow-x-auto">
              {file.patch.split('\n').map((line: string, i: number) => {
                const type =
                  line.startsWith('+')
                    ? 'add'
                    : line.startsWith('-')
                      ? 'del'
                      : line.startsWith('@@')
                        ? 'hunk'
                        : 'context';
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex px-4',
                      type === 'add' && 'bg-[#3FB950]/10',
                      type === 'del' && 'bg-[#F85149]/10',
                      type === 'hunk' && 'bg-[#4493F8]/10',
                    )}
                  >
                    <span className="w-10 text-right text-[#484F58] select-none shrink-0">
                      {type === 'add' ? '' : i}
                    </span>
                    <span className="w-10 text-right text-[#484F58] select-none shrink-0">
                      {type === 'del' ? '' : i}
                    </span>
                    <span
                      className={cn(
                        'w-5 shrink-0 select-none text-center',
                        type === 'add' && 'text-[#3FB950]',
                        type === 'del' && 'text-[#F85149]',
                        type === 'hunk' && 'text-[#4493F8]',
                      )}
                    >
                      {line.charAt(0)}
                    </span>
                    <span className="flex-1 whitespace-pre text-[#E6EDF3]">
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {!file.patch && (
            <div className="px-4 py-6 text-center text-sm text-[#8D96A0]">
              Diff not available for this file
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── check suite ───────── */

function CheckSuiteCard({ suite }: { suite: any }) {
  const [expanded, setExpanded] = useState(false);

  const conclusion = suite.conclusion || suite.status;
  const isPass =
    conclusion === 'success' || conclusion === 'neutral';
  const isFail =
    conclusion === 'failure' || conclusion === 'cancelled' ||
    conclusion === 'timed_out' || conclusion === 'action_required';
  const isPending =
    !conclusion || conclusion === 'queued' || conclusion === 'in_progress';

  return (
    <div className="border border-[#30363D] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#1C2128]',
        )}
      >
        {isPass ? (
          <CheckCircle size={16} className="text-[#3FB950] shrink-0" />
        ) : isFail ? (
          <XCircle size={16} className="text-[#F85149] shrink-0" />
        ) : (
          <Loader2 size={16} className="text-[#E8B84B] animate-spin shrink-0" />
        )}
        <span className="text-sm font-medium text-[#E6EDF3] flex-1 truncate">
          {suite.name || suite.external_id || 'Check suite'}
        </span>
        <span className="text-xs text-[#8D96A0] shrink-0">
          {formatDuration(suite.startedAt || suite.started_at, suite.completedAt || suite.completed_at)}
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-[#8D96A0] shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-[#8D96A0] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#30363D] divide-y divide-[#30363D]/50">
          {(suite.jobs || suite.steps || []).map((job: any, i: number) => {
            const jPass =
              job.conclusion === 'success' || job.conclusion === 'neutral';
            const jFail =
              job.conclusion === 'failure' || job.conclusion === 'cancelled';
            const jPending =
              !job.conclusion || job.conclusion === 'queued' ||
              job.conclusion === 'in_progress';
            return (
              <div
                key={job.id || i}
                className="flex items-center gap-3 px-4 py-2.5 pl-10 hover:bg-[#1C2128] transition-colors"
              >
                {jPass ? (
                  <CheckCircle size={12} className="text-[#3FB950] shrink-0" />
                ) : jFail ? (
                  <XCircle size={12} className="text-[#F85149] shrink-0" />
                ) : (
                  <Clock size={12} className="text-[#E8B84B] shrink-0" />
                )}
                <span className="text-sm text-[#E6EDF3] flex-1 truncate">
                  {job.name}
                </span>
                <span className="text-xs text-[#8D96A0] shrink-0">
                  {formatDuration(job.startedAt || job.started_at, job.completedAt || job.completed_at)}
                </span>
                <span className="text-xs text-[#8D96A0] capitalize shrink-0">
                  {job.conclusion || job.status || 'pending'}
                </span>
              </div>
            );
          })}
          {(!suite.jobs || suite.jobs.length === 0) &&
            (!suite.steps || suite.steps.length === 0) && (
              <div className="px-4 py-3 pl-10 text-sm text-[#8D96A0]">
                No job details available
              </div>
            )}
        </div>
      )}
    </div>
  );
}

/* ───────── main component ───────── */

export function RepoPullDetail() {
  const { owner, repo } = getRepoParams();
  const pullNumber = Number(getPullNumber());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    'conversation' | 'commits' | 'checks' | 'files'
  >('conversation');
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>('merge');
  const [autoMerge, setAutoMerge] = useState(false);
  const [viewType, setViewType] = useState<'unified' | 'split'>('unified');

  const {
    data: pull,
    isLoading: pullLoading,
    error: pullError,
  } = useQuery({
    queryKey: ['pull', owner, repo, pullNumber],
    queryFn: () => pullApi.get(owner!, repo!, pullNumber),
    enabled: !!owner && !!repo && !!pullNumber,
    staleTime: 15_000,
  });

  const { data: commits } = useQuery({
    queryKey: ['pull-commits', owner, repo, pullNumber],
    queryFn: () => pullApi.listCommits(owner!, repo!, pullNumber),
    enabled: !!owner && !!repo && !!pullNumber,
  });

  const { data: files } = useQuery({
    queryKey: ['pull-files', owner, repo, pullNumber],
    queryFn: () => pullApi.listFiles(owner!, repo!, pullNumber),
    enabled: !!owner && !!repo && !!pullNumber,
  });

  const { data: reviews } = useQuery({
    queryKey: ['pull-reviews', owner, repo, pullNumber],
    queryFn: () => pullApi.listReviews(owner!, repo!, pullNumber),
    enabled: !!owner && !!repo && !!pullNumber,
  });

  const mergeMutation = useMutation({
    mutationFn: (data?: { merge_method?: string }) =>
      pullApi.merge(owner!, repo!, pullNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pull', owner, repo, pullNumber] });
      queryClient.invalidateQueries({ queryKey: ['pulls', owner, repo] });
    },
    onError: (err) => {
      const apiError = getApiError(err);
      alert(apiError.message);
    },
  });

  const handleMerge = useCallback(() => {
    mergeMutation.mutate({ merge_method: mergeMethod });
  }, [mergeMethod, mergeMutation]);

  const mappedPull = pull
    ? {
        id: (pull as any).id,
        number: (pull as any).number,
        title: (pull as any).title,
        body: (pull as any).body || '',
        bodyHtml: (pull as any).bodyHtml || (pull as any).body_html || null,
        state: (pull as any).state || 'open',
        isDraft: (pull as any).draft || (pull as any).isDraft || false,
        isMergeable: (pull as any).mergeable ?? (pull as any).isMergeable ?? null,
        mergeableState: (pull as any).mergeableState || (pull as any).mergeable_state || 'unknown',
        mergeMethod: (pull as any).mergeMethod || (pull as any).merge_method || null,
        mergedAt: (pull as any).merged_at || (pull as any).mergedAt || null,
        mergedByUsername:
          (pull as any).mergedBy?.username ||
          (pull as any).mergedByUsername ||
          (pull as any).merged_by_username ||
          null,
        closedAt: (pull as any).closed_at || (pull as any).closedAt || null,
        closedByUsername:
          (pull as any).closedBy?.username ||
          (pull as any).closedByUsername ||
          (pull as any).closed_by_username ||
          null,
        authorUsername:
          (pull as any).author?.username || (pull as any).authorUsername || '',
        authorAvatar:
          (pull as any).author?.avatar_url || (pull as any).authorAvatar || null,
        headRef: (pull as any).head?.ref || (pull as any).headRef || '',
        baseRef: (pull as any).base?.ref || (pull as any).baseRef || '',
        additions: (pull as any).additions || 0,
        deletions: (pull as any).deletions || 0,
        changedFiles:
          (pull as any).changed_files ?? (pull as any).changedFiles ?? 0,
        commitCount:
          (pull as any).commits_count ?? (pull as any).commitCount ?? 0,
        commentCount:
          (pull as any).comments_count ?? (pull as any).commentCount ?? 0,
        reviewCommentCount:
          (pull as any).review_comments_count ??
          (pull as any).reviewCommentCount ??
          0,
        createdAt: (pull as any).created_at || (pull as any).createdAt || '',
        updatedAt: (pull as any).updated_at || (pull as any).updatedAt || '',
      }
    : null;

  const mappedCommits = Array.isArray(commits)
    ? commits.map((c: any) => ({
        id: c.id || c.sha,
        sha: c.sha,
        shortSha: c.shortSha || c.sha?.substring(0, 7) || '',
        message: c.message || '',
        messageHeadline: c.messageHeadline || c.message?.split('\n')[0] || '',
        authorName: c.authorName || c.author?.name || '',
        authorAvatar: c.authorAvatar || c.author?.avatar_url || null,
        authoredAt: c.authoredAt || c.author?.date || '',
        committedAt: c.committedAt || c.committer?.date || '',
        additions: c.additions || 0,
        deletions: c.deletions || 0,
      }))
    : [];

  const mappedFiles = Array.isArray(files)
    ? files.map((f: any) => ({
        filename:
          f.filename || f.newPath || f.new_name || f.old_name || '',
        newPath: f.newPath || f.new_name || f.filename || '',
        oldPath: f.oldPath || f.old_name || '',
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        patch: f.patch || null,
      }))
    : [];

  const mappedReviews = Array.isArray(reviews) ? reviews : [];

  if (pullLoading) return <LoadingState />;

  if (pullError || !mappedPull) {
    return (
      <ErrorState
        owner={owner!}
        repo={repo!}
        message={
          pullError
            ? 'There was an error loading the pull request.'
            : undefined
        }
      />
    );
  }

  const StatusIcon =
    mappedPull.state === 'merged'
      ? GitMerge
      : mappedPull.state === 'closed'
        ? GitPullRequestClosed
        : GitPullRequest;
  const statusColor =
    mappedPull.state === 'merged'
      ? 'text-[#BC8CFF]'
      : mappedPull.state === 'closed'
        ? 'text-[#8D96A0]'
        : 'text-[#3FB950]';

  const totalAdditions = mappedFiles.reduce((s: number, f: any) => s + f.additions, 0);
  const totalDeletions = mappedFiles.reduce((s: number, f: any) => s + f.deletions, 0);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* back */}
        <button
          onClick={() => navigate(`/${owner}/${repo}/pulls`)}
          className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to pull requests
        </button>

        {/* header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon size={24} className={statusColor} />
            <h1 className="text-xl font-semibold text-[#E6EDF3]">
              {mappedPull.title}
            </h1>
            {mappedPull.isDraft && (
              <span className="px-2 py-0.5 text-xs bg-[#21262D] text-[#8D96A0] rounded font-medium border border-[#30363D]">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-[#8D96A0] flex-wrap">
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                mappedPull.state === 'open' && 'bg-[#3FB950]/20 text-[#3FB950]',
                mappedPull.state === 'merged' && 'bg-[#BC8CFF]/20 text-[#BC8CFF]',
                mappedPull.state === 'closed' && 'bg-[#8D96A0]/20 text-[#8D96A0]',
              )}
            >
              <StatusIcon size={12} />
              {mappedPull.state}
            </span>
            <span>
              {mappedPull.authorUsername} wants to merge{' '}
              {plural(mappedPull.commitCount, 'commit')} into{' '}
              <code className="text-[#E6EDF3] bg-[#1C2128] px-1 rounded">
                {mappedPull.baseRef}
              </code>{' '}
              from{' '}
              <code className="text-[#E6EDF3] bg-[#1C2128] px-1 rounded">
                {mappedPull.headRef}
              </code>
            </span>
            {mappedPull.createdAt && (
              <span>opened {formatRelativeTime(mappedPull.createdAt)}</span>
            )}
          </div>
        </div>

        {/* tab bar */}
        <div className="flex border-b border-[#30363D] mb-4">
          {(
            [
              { key: 'conversation', label: 'Conversation', count: mappedPull.commentCount + mappedPull.reviewCommentCount },
              { key: 'commits', label: 'Commits', count: mappedPull.commitCount },
              { key: 'checks', label: 'Checks', count: null },
              { key: 'files', label: 'Files Changed', count: mappedFiles.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'text-[#E8B84B]'
                  : 'text-[#8D96A0] hover:text-[#E6EDF3]',
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' && (
                <span className="ml-1 text-xs text-inherit opacity-70">
                  ({tab.count})
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8B84B]"
                />
              )}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="min-w-0 space-y-4">
            {/* ── Conversation ── */}
            {activeTab === 'conversation' && (
              <>
                <div className="lg:sticky lg:top-4 z-10">
                  <MergeStatusCard
                    pull={mappedPull}
                    mergeMethod={mergeMethod}
                    onMergeMethodChange={setMergeMethod}
                    autoMerge={autoMerge}
                    onAutoMergeChange={setAutoMerge}
                    onMerge={handleMerge}
                    merging={mergeMutation.isPending}
                  />
                </div>

                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                  {mappedPull.bodyHtml ? (
                    <div
                      className="prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: mappedPull.bodyHtml,
                      }}
                    />
                  ) : (
                    <pre className="text-sm text-[#E6EDF3] whitespace-pre-wrap font-sans">
                      {mappedPull.body || 'No description provided.'}
                    </pre>
                  )}
                </div>

                {/* timeline events */}
                {mappedReviews.length > 0 && (
                  <div className="space-y-2">
                    {mappedReviews.map((r: any, i: number) => {
                      const stateLabel =
                        r.state === 'approved'
                          ? 'approved these changes'
                          : r.state === 'changes_requested'
                            ? 'requested changes'
                            : r.state === 'commented'
                              ? 'reviewed'
                              : 'left a review';
                      return (
                        <div
                          key={r.id || i}
                          className="flex items-start gap-3 px-4 py-3 bg-[#161B22] border border-[#30363D] rounded-lg"
                        >
                          {r.authorAvatar ? (
                            <img
                              src={r.authorAvatar}
                              alt=""
                              className="w-6 h-6 rounded-full mt-0.5"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] text-[#8D96A0] font-medium mt-0.5">
                              {(r.authorUsername || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-[#E6EDF3]">
                                {r.authorUsername}
                              </span>
                              <span className="text-[#8D96A0]">
                                {stateLabel}
                              </span>
                              {r.submittedAt && (
                                <span className="text-[#8D96A0] text-xs">
                                  {formatRelativeTime(r.submittedAt)}
                                </span>
                              )}
                            </div>
                            {r.body && (
                              <div className="mt-2 text-sm text-[#E6EDF3]">
                                {r.body}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* comment area placeholder */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                  <textarea
                    placeholder="Leave a comment"
                    rows={3}
                    className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-sm text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button className="px-4 py-1.5 text-sm font-medium bg-[#E8B84B] text-[#0D1117] rounded-lg hover:bg-[#E8B84B]/90 active:bg-[#E8B84B]/80 transition-colors disabled:opacity-50">
                      Comment
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Commits ── */}
            {activeTab === 'commits' && (
              <div className="border border-[#30363D] rounded-lg divide-y divide-[#30363D]/50 overflow-hidden">
                {mappedCommits.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#8D96A0]">
                    No commits
                  </div>
                ) : (
                  mappedCommits.map((c: any, i: number) => (
                    <CommitRow key={c.id || i} commit={c} />
                  ))
                )}
              </div>
            )}

            {/* ── Checks ── */}
            {activeTab === 'checks' && (
              <div className="space-y-3">
                {[].length === 0 ? (
                  <div className="border border-[#30363D] rounded-lg py-8 text-center text-sm text-[#8D96A0]">
                    No checks reported yet.
                  </div>
                ) : (
                  [].map((suite: any, i: number) => (
                    <CheckSuiteCard key={suite.id || i} suite={suite} />
                  ))
                )}
              </div>
            )}

            {/* ── Files Changed ── */}
            {activeTab === 'files' && (
              <div className="space-y-3">
                {/* summary bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#E6EDF3]">
                      Showing {plural(mappedFiles.length, 'changed file')}
                    </span>
                    <span className="text-[#3FB950] font-mono">
                      +{totalAdditions}
                    </span>
                    <span className="text-[#F85149] font-mono">
                      -{totalDeletions}
                    </span>
                  </div>
                  <div className="flex rounded-lg border border-[#30363D] overflow-hidden">
                    <button
                      onClick={() => setViewType('unified')}
                      className={cn(
                        'px-3 py-1 text-xs font-medium transition-colors',
                        viewType === 'unified'
                          ? 'bg-[#E8B84B] text-[#0D1117]'
                          : 'bg-[#21262D] text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3]',
                      )}
                    >
                      Unified
                    </button>
                    <button
                      onClick={() => setViewType('split')}
                      className={cn(
                        'px-3 py-1 text-xs font-medium transition-colors',
                        viewType === 'split'
                          ? 'bg-[#E8B84B] text-[#0D1117]'
                          : 'bg-[#21262D] text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3]',
                      )}
                    >
                      Split
                    </button>
                  </div>
                </div>

                {/* diff files */}
                {mappedFiles.length === 0 ? (
                  <div className="border border-[#30363D] rounded-lg py-8 text-center text-sm text-[#8D96A0]">
                    No files changed
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mappedFiles.map((f: any, i: number) => (
                      <DiffFileAccordion
                        key={f.filename || i}
                        file={f}
                        viewType={viewType}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── sidebar ── */}
          <div className="space-y-4">
            {/* reviewers */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                  Reviewers
                </h4>
                <p className="text-sm text-[#8D96A0]">No reviewers requested</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                  Assignees
                </h4>
                <p className="text-sm text-[#8D96A0]">None yet</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                  Labels
                </h4>
                <p className="text-sm text-[#8D96A0]">None yet</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                  Milestone
                </h4>
                <p className="text-sm text-[#8D96A0]">No milestone</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                  Linked issues
                </h4>
                <p className="text-sm text-[#8D96A0]">None</p>
              </div>
            </div>

            {/* stats */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8D96A0]">Additions</span>
                <span className="text-[#3FB950] font-medium">
                  +{mappedPull.additions}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8D96A0]">Deletions</span>
                <span className="text-[#F85149] font-medium">
                  -{mappedPull.deletions}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8D96A0]">Changed files</span>
                <span className="text-[#E6EDF3]">
                  {mappedPull.changedFiles}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
