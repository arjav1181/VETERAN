import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, CircleDot, CheckCircle, Tag, Milestone, User,
  MessageSquare, ChevronDown, X, SortAsc, Search,
  Pin, AlertCircle,
} from 'lucide-react';
import { issueApi } from '@lib/api/endpoints/issues';
import { getRepoParams } from '@lib/route-utils';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';

function mapIssue(apiIssue: any) {
  const author = apiIssue.author || {};
  return {
    id: apiIssue.id,
    repositoryId: apiIssue.repo_id || apiIssue.repositoryId || '',
    number: apiIssue.number,
    title: apiIssue.title,
    body: apiIssue.body || '',
    bodyHtml: apiIssue.bodyHtml || apiIssue.body_html || null,
    state: apiIssue.state,
    isLocked: apiIssue.locked || apiIssue.isLocked || false,
    lockedReason: apiIssue.lockedReason || apiIssue.locked_reason || null,
    isPinned: apiIssue.isPinned || apiIssue.pinned || false,
    authorId: apiIssue.author?.id || apiIssue.authorId || '',
    authorUsername: apiIssue.author?.username || apiIssue.authorUsername || '',
    authorAvatar: apiIssue.author?.avatar_url || apiIssue.authorAvatar || null,
    assigneeIds: (apiIssue.assignees || []).map((a: any) => a.id || a),
    assignees: (apiIssue.assignees || []).map((a: any) => ({
      id: a.id,
      username: a.username,
      avatarUrl: a.avatar_url || a.avatarUrl || null,
    })),
    labelIds: (apiIssue.labels || []).map((l: any) => l.id || l),
    labels: (apiIssue.labels || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      color: l.color,
    })),
    milestoneId: apiIssue.milestone?.id || apiIssue.milestoneId || null,
    milestoneTitle: apiIssue.milestone?.title || apiIssue.milestoneTitle || null,
    commentCount: apiIssue.comments_count ?? apiIssue.commentCount ?? 0,
    reactionCount: apiIssue.reactionCount || 0,
    closeById: apiIssue.closeById || apiIssue.close_by_id || null,
    closeByUsername: apiIssue.closeByUsername || apiIssue.close_by_username || null,
    closedAt: apiIssue.closed_at || apiIssue.closedAt || null,
    createdAt: apiIssue.created_at || apiIssue.createdAt || '',
    updatedAt: apiIssue.updated_at || apiIssue.updatedAt || '',
  };
}

export function RepoIssues() {
  const { owner, repo } = getRepoParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [state, setState] = useState<'open' | 'closed'>('open');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [sort, setSort] = useState('created');

  const { data: issuesData, isLoading, error } = useQuery({
    queryKey: ['issues-page', owner, repo, { state }],
    queryFn: () => issueApi.list(owner!, repo!, { state }),
    enabled: !!owner && !!repo,
  });

  const { data: labelsData } = useQuery({
    queryKey: ['labels-page', owner, repo],
    queryFn: () => issueApi.listLabels?.(owner!, repo!) ?? Promise.resolve([]),
    enabled: !!owner && !!repo,
  });

  const { data: milestonesData } = useQuery({
    queryKey: ['milestones-page', owner, repo],
    queryFn: () => issueApi.listMilestones?.(owner!, repo!) ?? Promise.resolve([]),
    enabled: !!owner && !!repo,
  });

  const labels = useMemo(() => (labelsData ?? []).map((l: any) => ({
    id: l.id,
    name: l.name,
    color: l.color,
    description: l.description || null,
  })), [labelsData]);

  const milestones = useMemo(() => (milestonesData ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    number: m.number,
    state: m.state || 'open',
    description: m.description || null,
  })), [milestonesData]);

  const issues = useMemo(() => (issuesData ?? []).map(mapIssue), [issuesData]);

  const openCount = useMemo(() => {
    let c = 0;
    for (const i of issues) if (i.state === 'open') c++;
    return c;
  }, [issues]);

  const closedCount = useMemo(() => {
    let c = 0;
    for (const i of issues) if (i.state === 'closed') c++;
    return c;
  }, [issues]);

  const labelsCount = labels.length;
  const milestonesCount = milestones.length;

  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    for (const i of issues) if (i.authorUsername) set.add(i.authorUsername);
    return Array.from(set).sort();
  }, [issues]);

  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    for (const i of issues) {
      for (const a of (i as any).assignees || []) {
        if (a.username) set.add(a.username);
      }
    }
    return Array.from(set).sort();
  }, [issues]);

  const hasActiveFilters = search || selectedAuthor || selectedLabels.length > 0 || selectedMilestone || selectedAssignee;

  const filtered = useMemo(() => {
    let result = issues;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.authorUsername.toLowerCase().includes(q) ||
        `#${i.number}`.includes(q)
      );
    }
    if (selectedAuthor) {
      result = result.filter(i => i.authorUsername === selectedAuthor);
    }
    if (selectedLabels.length > 0) {
      result = result.filter(i =>
        (i as any).labels?.some((l: any) => selectedLabels.includes(l.name))
      );
    }
    if (selectedMilestone) {
      result = result.filter(i => i.milestoneTitle === selectedMilestone);
    }
    if (selectedAssignee) {
      result = result.filter(i =>
        (i as any).assignees?.some((a: any) => a.username === selectedAssignee)
      );
    }
    result.sort((a, b) => {
      if (sort === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === 'comments') return b.commentCount - a.commentCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [issues, search, selectedAuthor, selectedLabels, selectedMilestone, selectedAssignee, sort]);

  const pinned = useMemo(() => filtered.filter(i => i.isPinned).slice(0, 3), [filtered]);
  const unpinned = useMemo(() => filtered.filter(i => !i.isPinned), [filtered]);

  const removeFilter = (type: string, value?: string) => {
    if (type === 'search') setSearch('');
    if (type === 'author') setSelectedAuthor('');
    if (type === 'label' && value) setSelectedLabels(prev => prev.filter(l => l !== value));
    if (type === 'milestone') setSelectedMilestone('');
    if (type === 'assignee') setSelectedAssignee('');
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedAuthor('');
    setSelectedLabels([]);
    setSelectedMilestone('');
    setSelectedAssignee('');
  };

  const activeFilterChips: { type: string; label: string; value?: string }[] = [];
  if (search) activeFilterChips.push({ type: 'search', label: `"${search}"` });
  if (selectedAuthor) activeFilterChips.push({ type: 'author', label: `Author: ${selectedAuthor}` });
  for (const l of selectedLabels) activeFilterChips.push({ type: 'label', label: `Label: ${l}`, value: l });
  if (selectedMilestone) activeFilterChips.push({ type: 'milestone', label: `Milestone: ${selectedMilestone}` });
  if (selectedAssignee) activeFilterChips.push({ type: 'assignee', label: `Assignee: ${selectedAssignee}` });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-48 bg-[#1C2128] rounded animate-pulse" />
            <div className="h-8 w-28 bg-[#1C2128] rounded-lg animate-pulse" />
          </div>
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[#30363D]/50">
                <div className="w-4 h-4 bg-[#1C2128] rounded animate-pulse mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#1C2128] rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-[#1C2128] rounded animate-pulse w-16" />
                    <div className="h-5 bg-[#1C2128] rounded animate-pulse w-20" />
                    <div className="h-5 bg-[#1C2128] rounded animate-pulse w-14" />
                  </div>
                </div>
                <div className="h-5 w-12 bg-[#1C2128] rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[#F85149]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">Failed to load issues</h3>
            <p className="text-sm text-[#8D96A0] max-w-md mb-6">There was an error loading the issues. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#21262D] border border-[#30363D] text-[#E6EDF3] rounded-lg text-sm font-medium hover:bg-[#1C2128] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/${owner}/${repo}/labels`)}
              className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors"
            >
              <Tag size={16} />
              <span>Labels</span>
              {labelsCount > 0 && (
                <span className="text-xs text-[#484F58]">({labelsCount})</span>
              )}
            </button>
            <button
              onClick={() => navigate(`/${owner}/${repo}/milestones`)}
              className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors"
            >
              <Milestone size={16} />
              <span>Milestones</span>
              {milestonesCount > 0 && (
                <span className="text-xs text-[#484F58]">({milestonesCount})</span>
              )}
            </button>
          </div>
          <button
            onClick={() => navigate(`/${owner}/${repo}/issues/new`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8B84B] text-[#0D1117] rounded-lg text-sm font-medium hover:bg-[#E8B84B]/90 transition-colors"
          >
            <Plus size={16} /> New issue
          </button>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#30363D] space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484F58]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-sm text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#E6EDF3] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-[#0D1117] rounded-lg border border-[#30363D] p-0.5">
                <button
                  onClick={() => setState('open')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    state === 'open' ? 'bg-[#E8B84B]/20 text-[#E8B84B]' : 'text-[#8D96A0] hover:text-[#E6EDF3]'
                  )}
                >
                  <CircleDot size={14} /> Open{openCount > 0 && <span className="text-[#484F58] ml-0.5">{openCount}</span>}
                </button>
                <button
                  onClick={() => setState('closed')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    state === 'closed' ? 'bg-[#3FB950]/20 text-[#3FB950]' : 'text-[#8D96A0] hover:text-[#E6EDF3]'
                  )}
                >
                  <CheckCircle size={14} /> Closed{closedCount > 0 && <span className="text-[#484F58] ml-0.5">{closedCount}</span>}
                </button>
              </div>

              <div className="relative">
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-[#0D1117] border border-[#30363D] rounded-md text-[#8D96A0] hover:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer transition-colors"
                >
                  <option value="">Author</option>
                  {uniqueAuthors.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedLabels.length === 1 ? selectedLabels[0] : ''}
                  onChange={(e) => setSelectedLabels(e.target.value ? [e.target.value] : [])}
                  className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-[#0D1117] border border-[#30363D] rounded-md text-[#8D96A0] hover:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer transition-colors"
                >
                  <option value="">Labels</option>
                  {labels.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-[#0D1117] border border-[#30363D] rounded-md text-[#8D96A0] hover:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer transition-colors"
                >
                  <option value="">Milestones</option>
                  {milestones.map(m => (
                    <option key={m.id} value={m.title}>{m.title}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-[#0D1117] border border-[#30363D] rounded-md text-[#8D96A0] hover:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer transition-colors"
                >
                  <option value="">Assignee</option>
                  {uniqueAssignees.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none px-2.5 py-1.5 pr-7 text-xs bg-[#0D1117] border border-[#30363D] rounded-md text-[#8D96A0] hover:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 cursor-pointer transition-colors"
                >
                  <option value="created">Sort: Newest</option>
                  <option value="updated">Sort: Recently updated</option>
                  <option value="comments">Sort: Most comments</option>
                </select>
                <SortAsc size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] pointer-events-none" />
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {activeFilterChips.map((chip) => (
                  <span
                    key={`${chip.type}-${chip.value || chip.label}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#21262D] border border-[#30363D] rounded-full text-[#E6EDF3]"
                  >
                    {chip.label}
                    <button
                      onClick={() => removeFilter(chip.type, chip.value)}
                      className="text-[#484F58] hover:text-[#E6EDF3] transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#4493F8] hover:text-[#4493F8]/80 hover:underline transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {pinned.length > 0 && (
            <div className="border-b border-[#30363D]">
              <div className="px-4 py-2 bg-[#161B22]/50">
                <div className="flex items-center gap-1.5 text-xs text-[#8D96A0] mb-2">
                  <Pin size={12} />
                  <span>Pinned issues</span>
                </div>
                <div className="space-y-2">
                  {pinned.map(issue => {
                    const issueLabels = (issue as any).labels || [];
                    return (
                      <div
                        key={issue.id}
                        onClick={() => navigate(`/${owner}/${repo}/issues/${issue.number}`)}
                        className="bg-[#1C2128] border border-[#30363D] rounded-lg p-3 hover:border-[#484F58] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {issue.state === 'open' ? (
                              <CircleDot size={16} className="text-[#3FB950]" />
                            ) : (
                              <CheckCircle size={16} className="text-[#8D96A0]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-[#E6EDF3] truncate">{issue.title}</span>
                              {issueLabels.length > 0 && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {issueLabels.slice(0, 3).map((label: any) => (
                                    <span
                                      key={label.id}
                                      className="px-2 py-0.5 text-2xs font-medium rounded-full whitespace-nowrap"
                                      style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-[#8D96A0] line-clamp-1 mt-0.5">{issue.body}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#484F58]">
                              <span className="text-[#8D96A0]">#{issue.number}</span>
                              <span>{issue.commentCount} comments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {hasActiveFilters ? (
                <>
                  <Search size={48} className="mb-4 text-[#484F58]" />
                  <h3 className="text-lg font-medium text-[#E6EDF3] mb-1">No results matched your search.</h3>
                  <p className="text-sm text-[#8D96A0] mb-6">Try adjusting your search or filter criteria</p>
                  <div className="flex gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-[#21262D] border border-[#30363D] text-[#E6EDF3] rounded-lg text-sm font-medium hover:bg-[#1C2128] transition-colors"
                    >
                      Reset filters
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={48} className="mb-4 text-[#484F58]" />
                  <h3 className="text-lg font-medium text-[#E6EDF3] mb-1">No issues here!</h3>
                  <p className="text-sm text-[#8D96A0] mb-6">Issues let you track your work on Veteran.</p>
                  <button
                    onClick={() => navigate(`/${owner}/${repo}/issues/new`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#E8B84B] text-[#0D1117] rounded-lg text-sm font-medium hover:bg-[#E8B84B]/90 transition-colors"
                  >
                    <Plus size={16} /> Create new issue
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#30363D]/50">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#161B22]/30">
                <span className="text-xs text-[#8D96A0]">{filtered.length} {filtered.length === 1 ? 'issue' : 'issues'}</span>
              </div>
              {unpinned.map(issue => {
                const issueLabels = (issue as any).labels || [];
                const issueAssignees = (issue as any).assignees || [];
                return (
                  <div
                    key={issue.id}
                    onClick={() => navigate(`/${owner}/${repo}/issues/${issue.number}`)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#161B22]/40 transition-colors cursor-pointer group"
                  >
                    <div className="mt-0.5 shrink-0">
                      {issue.state === 'open' ? (
                        <CircleDot size={18} className="text-[#3FB950]" />
                      ) : (
                        <CheckCircle size={18} className="text-[#8D96A0]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#484F58] text-xs font-mono shrink-0">#{issue.number}</span>
                        <span className="text-sm font-semibold text-[#E6EDF3] truncate group-hover:text-[#E8B84B] transition-colors">
                          {issue.title}
                        </span>
                        {issueLabels.length > 0 && (
                          <div className="flex items-center gap-1 shrink-0 overflow-hidden">
                            {issueLabels.slice(0, 4).map((label: any) => (
                              <span
                                key={label.id}
                                className="shrink-0 px-2 py-0.5 text-2xs font-medium rounded-full whitespace-nowrap"
                                style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8D96A0] flex-wrap">
                        <span>#{issue.number}</span>
                        <span>
                          opened {formatRelativeTime(issue.createdAt)} by{' '}
                          <span className="text-[#4493F8] hover:text-[#4493F8]/80 hover:underline cursor-pointer">{issue.authorUsername}</span>
                        </span>
                        {issue.milestoneTitle && (
                          <>
                            <span>·</span>
                            <Milestone size={12} className="inline" />
                            <span>{issue.milestoneTitle}</span>
                          </>
                        )}
                        {issue.commentCount > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              {issue.commentCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {issueAssignees.length > 0 && (
                        <div className="flex -space-x-1.5">
                          {issueAssignees.slice(0, 3).map((assignee: any) => (
                            assignee.avatarUrl ? (
                              <img
                                key={assignee.id}
                                src={assignee.avatarUrl}
                                alt={assignee.username}
                                className="w-5 h-5 rounded-full border border-[#0D1117]"
                                title={assignee.username}
                              />
                            ) : (
                              <div
                                key={assignee.id}
                                className="w-5 h-5 rounded-full bg-[#21262D] border border-[#0D1117] flex items-center justify-center text-[10px] text-[#8D96A0] font-medium"
                                title={assignee.username}
                              >
                                {assignee.username?.charAt(0).toUpperCase()}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      {issue.commentCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#8D96A0]">
                          <MessageSquare size={14} />
                          {issue.commentCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
