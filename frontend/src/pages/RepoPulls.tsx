import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { pullApi } from '@lib/api/endpoints/pulls';
import {
  Plus,
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  MessageSquare,
  XCircle,
  Search,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { getRepoParams } from '@lib/route-utils';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-7 w-40 bg-[#1C2128] rounded animate-pulse mb-6" />
        <div className="border border-[#30363D] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#30363D] space-y-3">
            <div className="h-8 bg-[#1C2128] rounded animate-pulse" />
            <div className="h-7 w-64 bg-[#1C2128] rounded animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="w-4 h-4 bg-[#1C2128] rounded animate-pulse mt-1 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1C2128] rounded animate-pulse w-3/4" />
                <div className="flex gap-3">
                  <div className="h-3 bg-[#1C2128] rounded animate-pulse w-20" />
                  <div className="h-3 bg-[#1C2128] rounded animate-pulse w-24" />
                  <div className="h-3 bg-[#1C2128] rounded animate-pulse w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CIStatusDot({ status }: { status?: string }) {
  const color =
    status === 'success'
      ? 'bg-[#3FB950]'
      : status === 'failure'
        ? 'bg-[#F85149]'
        : status === 'pending'
          ? 'bg-[#E8B84B]'
          : 'bg-[#21262D]';
  return (
    <span
      className={cn('w-2 h-2 rounded-full inline-block shrink-0', color)}
      title={status || 'unknown'}
    />
  );
}

export function RepoPulls() {
  const { owner, repo } = getRepoParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'open' | 'closed' | 'merged'>('open');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created');

  const { data: pulls, isLoading, error } = useQuery({
    queryKey: ['pulls', owner, repo, { state }],
    queryFn: () => pullApi.list(owner!, repo!, { state }),
    enabled: !!owner && !!repo,
    staleTime: 15_000,
  });

  const filtered = useMemo(() => {
    const raw = Array.isArray(pulls) ? pulls : [];
    let result = raw.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state || 'open',
      isDraft: pr.draft || pr.isDraft || false,
      authorUsername: pr.author?.username || pr.authorUsername || '',
      authorAvatar: pr.author?.avatar_url || pr.authorAvatar || null,
      headRef: pr.head?.ref || pr.headRef || '',
      baseRef: pr.base?.ref || pr.baseRef || '',
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      commentCount: pr.comments_count ?? pr.commentCount ?? 0,
      ciStatus: pr.ciStatus || pr.ci_status || null,
      createdAt: pr.created_at || pr.createdAt || '',
      updatedAt: pr.updated_at || pr.updatedAt || '',
    }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authorUsername.toLowerCase().includes(q) ||
          p.headRef.toLowerCase().includes(q) ||
          p.baseRef.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      const key = sort === 'updated' ? 'updatedAt' : 'createdAt';
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });

    return result;
  }, [pulls, search, sort]);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-[#F85149]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">
              Failed to load pull requests
            </h3>
            <p className="text-sm text-[#8D96A0] max-w-md">
              There was an error loading the pull requests. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#E6EDF3]">Pull Requests</h1>
          <button
            onClick={() => navigate(`/${owner}/${repo}/pulls/compare`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8B84B] text-[#0D1117] rounded-lg text-sm font-medium hover:bg-[#E8B84B]/90 active:bg-[#E8B84B]/80 transition-colors"
          >
            <Plus size={16} /> New pull request
          </button>
        </div>

        <div className="border border-[#30363D] rounded-lg bg-[#0D1117] overflow-hidden">
          <div className="p-3 border-b border-[#30363D] space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D96A0] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pull requests..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#161B22] border border-[#30363D] rounded-lg text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#161B22] rounded-lg border border-[#30363D] p-0.5">
                {(['open', 'closed', 'merged'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setState(s)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                      state === s
                        ? 'bg-[#E8B84B]/20 text-[#E8B84B]'
                        : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D]',
                    )}
                  >
                    {s === 'open' && <GitPullRequest size={14} />}
                    {s === 'closed' && <XCircle size={14} />}
                    {s === 'merged' && <GitMerge size={14} />}
                    {s}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-auto px-2.5 py-1.5 text-xs bg-[#161B22] border border-[#30363D] rounded-md text-[#8D96A0] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer hover:text-[#E6EDF3] transition-colors"
              >
                <option value="created">Newest</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <GitPullRequest
                  size={48}
                  className="mb-4 text-[#21262D]"
                />
                <p className="text-lg font-medium text-[#E6EDF3] mb-1">
                  {search
                    ? 'No matching pull requests'
                    : `No ${state} pull requests`}
                </p>
                <p className="text-sm text-[#8D96A0]">
                  {search
                    ? 'Try adjusting your search or filter.'
                    : 'There are no pull requests matching your filter.'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-[#30363D]/50"
              >
                {filtered.map((pr) => (
                  <div
                    key={pr.id || pr.number}
                    onClick={() =>
                      navigate(`/${owner}/${repo}/pulls/${pr.number}`)
                    }
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#1C2128] transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      {pr.state === 'open' ? (
                        pr.isDraft ? (
                          <GitPullRequest size={18} className="text-[#8D96A0]" />
                        ) : (
                          <GitPullRequest size={18} className="text-[#3FB950]" />
                        )
                      ) : pr.state === 'merged' ? (
                        <GitMerge size={18} className="text-[#BC8CFF]" />
                      ) : (
                        <GitPullRequestClosed size={18} className="text-[#8D96A0]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#E6EDF3] truncate hover:text-[#E8B84B] transition-colors">
                          {pr.title}
                        </span>
                        {pr.isDraft && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] bg-[#21262D] text-[#8D96A0] rounded font-medium leading-none border border-[#30363D]">
                            Draft
                          </span>
                        )}
                        <CIStatusDot status={pr.ciStatus} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8D96A0] flex-wrap">
                        <span className="font-medium text-[#484F58]">
                          #{pr.number}
                        </span>
                        <span className="flex items-center gap-1">
                          {pr.authorAvatar && (
                            <img
                              src={pr.authorAvatar}
                              alt=""
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          {pr.authorUsername}
                        </span>
                        <span>
                          opened {formatRelativeTime(pr.createdAt)}
                        </span>
                        <span>
                          <code className="text-[#E6EDF3] bg-[#1C2128] px-1 rounded">
                            {pr.headRef}
                          </code>
                          {' into '}
                          <code className="text-[#E6EDF3] bg-[#1C2128] px-1 rounded">
                            {pr.baseRef}
                          </code>
                        </span>
                        {(pr.additions + pr.deletions) > 0 && (
                          <span>
                            <span className="text-[#3FB950]">
                              +{pr.additions}
                            </span>{' '}
                            <span className="text-[#F85149]">
                              -{pr.deletions}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#8D96A0] shrink-0">
                      {pr.commentCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          {pr.commentCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
