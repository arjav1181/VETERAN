import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CircleDot, CheckCircle, XCircle, Lock, Unlock,
  Pin, PinOff, ArrowUpFromLine, MessageSquare, Bell, BellOff,
  Link, SmilePlus, ThumbsUp, ThumbsDown, Laugh, Heart, Rocket,
  Eye, Edit3, Check, X, Tag, Milestone, User, Bookmark,
  AlertCircle, Github, MoreHorizontal,
} from 'lucide-react';
import { issueApi } from '@lib/api/endpoints/issues';
import { getRepoParams, getIssueNumber } from '@lib/route-utils';
import { cn, formatRelativeTime, formatAbsoluteTime, formatCount } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { CommentBox } from '@/components/issues/CommentBox';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import toast from 'react-hot-toast';

function mapIssue(apiIssue: any) {
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
    authorIsCollaborator: apiIssue.authorIsCollaborator || apiIssue.author_is_collaborator || false,
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
    milestone: apiIssue.milestone
      ? {
          id: apiIssue.milestone.id,
          title: apiIssue.milestone.title,
          description: apiIssue.milestone.description || null,
          progress: apiIssue.milestone.progress || 0,
          openIssueCount: apiIssue.milestone.open_issues ?? apiIssue.milestone.openIssueCount ?? 0,
          closedIssueCount: apiIssue.milestone.closed_issues ?? apiIssue.milestone.closedIssueCount ?? 0,
        }
      : null,
    commentCount: apiIssue.comments_count ?? apiIssue.commentCount ?? 0,
    reactionCount: apiIssue.reactionCount || 0,
    reactions: apiIssue.reactions || [],
    projectCards: apiIssue.projectCards || apiIssue.project_cards || [],
    linkedPRs: apiIssue.linkedPRs || apiIssue.linked_pull_requests || [],
    participants: apiIssue.participants || [],
    closeById: apiIssue.closeById || apiIssue.close_by_id || null,
    closeByUsername: apiIssue.closeByUsername || apiIssue.close_by_username || null,
    closedAt: apiIssue.closed_at || apiIssue.closedAt || null,
    createdAt: apiIssue.created_at || apiIssue.createdAt || '',
    updatedAt: apiIssue.updated_at || apiIssue.updatedAt || '',
  };
}

function mapComment(apiComment: any) {
  return {
    id: apiComment.id,
    issueId: apiComment.issue_id || apiComment.issueId || '',
    authorId: apiComment.author?.id || apiComment.authorId || '',
    authorUsername: apiComment.author?.username || apiComment.authorUsername || '',
    authorAvatar: apiComment.author?.avatar_url || apiComment.authorAvatar || null,
    authorIsCollaborator: apiComment.authorIsCollaborator || apiComment.author_is_collaborator || false,
    body: apiComment.body || '',
    bodyHtml: apiComment.bodyHtml || apiComment.body_html || null,
    isEdited: apiComment.isEdited || apiComment.edited || false,
    isDeleted: apiComment.isDeleted || false,
    isMinimized: apiComment.isMinimized || false,
    minimizedReason: apiComment.minimizedReason || null,
    reactionCount: apiComment.reactionCount || 0,
    replyToId: apiComment.replyToId || apiComment.reply_to_id || null,
    editHistory: apiComment.editHistory || apiComment.edit_history || [],
    createdAt: apiComment.created_at || apiComment.createdAt || '',
    updatedAt: apiComment.updated_at || apiComment.updatedAt || '',
  };
}

const REACTION_EMOJIS: Record<string, string> = {
  thumbs_up: '+1',
  thumbs_down: '-1',
  laugh: '😄',
  hooray: '🎉',
  confused: '😕',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
};

const REACTION_ICONS: Record<string, React.ReactNode> = {
  thumbs_up: <ThumbsUp size={16} />,
  thumbs_down: <ThumbsDown size={16} />,
  laugh: <Laugh size={16} />,
  hooray: <Rocket size={16} />,
  confused: <Eye size={16} />,
  heart: <Heart size={16} />,
};

const REACTION_LIST = ['thumbs_up', 'thumbs_down', 'laugh', 'hooray', 'confused', 'heart'];

export function RepoIssueDetail() {
  const { owner, repo } = getRepoParams();
  const number = getIssueNumber();
  const issueNumber = Number(number);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const { data: issueData, isLoading: issueLoading, error: issueError } = useQuery({
    queryKey: ['issue-detail', owner, repo, issueNumber],
    queryFn: () => issueApi.get(owner!, repo!, issueNumber),
    enabled: !!owner && !!repo && !!issueNumber,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['issue-comments-detail', owner, repo, issueNumber],
    queryFn: () => issueApi.listComments(owner!, repo!, issueNumber),
    enabled: !!owner && !!repo && !!issueNumber,
  });

  const { data: labelsData } = useQuery({
    queryKey: ['labels-detail', owner, repo],
    queryFn: () => issueApi.listLabels?.(owner!, repo!) ?? Promise.resolve([]),
    enabled: !!owner && !!repo,
  });

  const createCommentMutation = useMutation({
    mutationFn: (body: string) => issueApi.createComment(owner!, repo!, issueNumber, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-comments-detail', owner, repo, issueNumber] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const updateIssueMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => issueApi.update(owner!, repo!, issueNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-detail', owner, repo, issueNumber] });
      toast.success('Issue updated');
    },
    onError: () => toast.error('Failed to update issue'),
  });

  const issue = issueData ? mapIssue(issueData) : null;
  const comments = (commentsData ?? []).map(mapComment);
  const labels = (labelsData ?? []).map((l: any) => ({
    id: l.id,
    name: l.name,
    color: l.color,
    description: l.description || null,
  }));

  const participantAvatars = useMemo(() => {
    const seen = new Set<string>();
    const result: { username: string; avatarUrl: string | null }[] = [];
    if (issue) {
      if (issue.authorUsername && !seen.has(issue.authorUsername)) {
        seen.add(issue.authorUsername);
        result.push({ username: issue.authorUsername, avatarUrl: issue.authorAvatar });
      }
    }
    for (const c of comments) {
      if (c.authorUsername && !seen.has(c.authorUsername)) {
        seen.add(c.authorUsername);
        result.push({ username: c.authorUsername, avatarUrl: c.authorAvatar });
      }
    }
    return result;
  }, [issue, comments]);

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-5 w-40 bg-[#1C2128] rounded animate-pulse mb-4" />
          <div className="h-8 w-3/4 bg-[#1C2128] rounded animate-pulse mb-2" />
          <div className="h-4 w-1/3 bg-[#1C2128] rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-4">
              <VeteranSkeleton variant="card" />
              <VeteranSkeleton variant="card" />
              <VeteranSkeleton variant="card" />
            </div>
            <div className="space-y-4">
              <VeteranSkeleton variant="card" />
              <VeteranSkeleton variant="card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (issueError || !issue) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${repo}/issues`)}
            className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to issues
          </button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[#F85149]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">Issue not found</h3>
            <p className="text-sm text-[#8D96A0] max-w-md mb-6">The requested issue could not be found.</p>
            <button
              onClick={() => navigate(`/${owner}/${repo}/issues`)}
              className="px-4 py-2 bg-[#21262D] border border-[#30363D] text-[#E6EDF3] rounded-lg text-sm font-medium hover:bg-[#1C2128] transition-colors"
            >
              Back to issues
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleTitleSubmit = () => {
    if (titleDraft.trim() && titleDraft !== issue.title) {
      updateIssueMutation.mutate({ title: titleDraft });
    }
    setEditingTitle(false);
  };

  const handleStateToggle = () => {
    const newState = issue.state === 'open' ? 'closed' : 'open';
    updateIssueMutation.mutate({ state: newState });
  };

  const handleLockToggle = () => {
    updateIssueMutation.mutate({ locked: !issue.isLocked });
  };

  const handlePinToggle = () => {
    updateIssueMutation.mutate({ pinned: !issue.isPinned });
  };

  const handleCommentSubmit = (body: string) => {
    createCommentMutation.mutate(body);
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${repo}/issues`)}
          className="flex items-center gap-1.5 text-sm text-[#8D96A0] hover:text-[#E6EDF3] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to issues
        </button>

        <div className="mb-6">
          {editingTitle ? (
            <div className="flex gap-2 mb-2">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(issue.title); } }}
                className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-xl font-semibold text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]/50"
                autoFocus
              />
              <button
                onClick={handleTitleSubmit}
                className="px-3 py-2 bg-[#E8B84B] text-[#0D1117] rounded-lg text-sm font-medium hover:bg-[#E8B84B]/90 transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Save
              </button>
              <button
                onClick={() => { setEditingTitle(false); setTitleDraft(issue.title); }}
                className="px-3 py-2 text-sm text-[#8D96A0] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 mb-2">
              <h1
                className="text-xl font-semibold text-[#E6EDF3] cursor-pointer hover:text-[#E8B84B] transition-colors flex-1"
                onClick={() => { setEditingTitle(true); setTitleDraft(issue.title); }}
                title="Click to edit title"
              >
                {issue.title}
              </h1>
              <button
                onClick={() => { setEditingTitle(true); setTitleDraft(issue.title); }}
                className="p-1 text-[#484F58] hover:text-[#E6EDF3] transition-colors shrink-0 mt-0.5 opacity-0 hover:opacity-100"
                title="Edit title"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[#8D96A0] flex-wrap">
            <span className={cn(
              'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
              issue.state === 'open'
                ? 'bg-[#3FB950]/20 text-[#3FB950]'
                : issue.state === 'closed'
                  ? 'bg-[#BC8CFF]/20 text-[#BC8CFF]'
                  : 'bg-[#8D96A0]/20 text-[#8D96A0]'
            )}>
              {issue.state === 'open' ? <CircleDot size={14} /> : <CheckCircle size={14} />}
              {issue.state}
            </span>
            <span className="text-[#484F58]">#{issue.number}</span>
            <span>
              opened by{' '}
              <span className="text-[#4493F8] hover:text-[#4493F8]/80 hover:underline cursor-pointer">
                {issue.authorUsername}
              </span>
            </span>
            <span>·</span>
            <span>{issue.commentCount} {issue.commentCount === 1 ? 'comment' : 'comments'}</span>
            <span>·</span>
            <span title={formatAbsoluteTime(issue.createdAt)}>
              opened {formatRelativeTime(issue.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="min-w-0 space-y-4">
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1C2128] border-b border-[#30363D]">
                <div className="flex items-center gap-2">
                  {issue.authorAvatar ? (
                    <img src={issue.authorAvatar} alt={issue.authorUsername} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-sm font-medium text-[#E6EDF3]">
                      {issue.authorUsername?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-[#E6EDF3]">{issue.authorUsername}</span>
                    {issue.authorIsCollaborator && (
                      <span className="px-1.5 py-0.5 text-2xs bg-[#E8B84B]/20 text-[#E8B84B] rounded font-medium">Author</span>
                    )}
                    <span className="text-[#8D96A0]">commented {formatRelativeTime(issue.createdAt)}</span>
                  </div>
                </div>
                <button className="p-1 text-[#484F58] hover:text-[#E6EDF3] rounded hover:bg-[#21262D] transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="px-4 py-4">
                <div className="prose prose-invert max-w-none text-sm text-[#E6EDF3]">
                  <MarkdownRenderer content={issue.body || '*No description provided.*'} />
                </div>
              </div>
              <div className="flex items-center gap-1 px-4 py-2.5 border-t border-[#30363D]">
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded-md hover:bg-[#21262D] transition-colors"
                  >
                    <SmilePlus size={14} /> React
                  </button>
                  {showReactions && (
                    <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-[#1C2128] border border-[#30363D] rounded-lg p-1.5 shadow-xl z-10">
                      {REACTION_LIST.map((key) => (
                        <button
                          key={key}
                          onClick={() => { setShowReactions(false); }}
                          className="p-1.5 rounded-md hover:bg-[#21262D] text-[#8D96A0] hover:text-[#E6EDF3] transition-colors"
                          title={REACTION_EMOJIS[key]}
                        >
                          {REACTION_ICONS[key] || <SmilePlus size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded-md hover:bg-[#21262D] transition-colors">
                  <Bell size={14} /> Subscribe
                </button>
                <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded-md hover:bg-[#21262D] transition-colors">
                  <Link size={14} /> Copy link
                </button>
              </div>
            </div>

            {commentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-[#1C2128]">
                      <div className="h-4 w-48 bg-[#21262D] rounded animate-pulse" />
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <div className="h-3 bg-[#21262D] rounded animate-pulse w-full" />
                      <div className="h-3 bg-[#21262D] rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#8D96A0]">
                <MessageSquare size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#1C2128]">
                      <div className="flex items-center gap-2 text-sm">
                        {comment.authorAvatar ? (
                          <img src={comment.authorAvatar} alt={comment.authorUsername} className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] font-medium text-[#E6EDF3]">
                            {comment.authorUsername?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-[#E6EDF3]">{comment.authorUsername}</span>
                        {comment.authorIsCollaborator && (
                          <span className="px-1.5 py-0.5 text-2xs bg-[#E8B84B]/20 text-[#E8B84B] rounded font-medium">Author</span>
                        )}
                        <span className="text-[#8D96A0]">commented {formatRelativeTime(comment.createdAt)}</span>
                        {comment.isEdited && <span className="text-[#8D96A0]">(edited)</span>}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="prose prose-invert max-w-none text-sm text-[#E6EDF3]">
                        <MarkdownRenderer content={comment.body} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <CommentBox
                onSubmit={handleCommentSubmit}
                loading={createCommentMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
                  <User size={14} /> Assignees
                </div>
                <button className="text-[#484F58] hover:text-[#E6EDF3] transition-colors">
                  <Edit3 size={12} />
                </button>
              </div>
              <div className="text-xs text-[#8D96A0]">
                {issue.assignees && issue.assignees.length > 0 ? (
                  <div className="space-y-1.5">
                    {issue.assignees.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2">
                        {a.avatarUrl ? (
                          <img src={a.avatarUrl} alt={a.username} className="w-4 h-4 rounded-full" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#21262D] flex items-center justify-center text-[8px] font-medium text-[#E6EDF3]">
                            {a.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[#E6EDF3]">{a.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  'No one assigned'
                )}
              </div>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
                  <Tag size={14} /> Labels
                </div>
                <button className="text-[#484F58] hover:text-[#E6EDF3] transition-colors">
                  <Edit3 size={12} />
                </button>
              </div>
              {issue.labels && issue.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {issue.labels.map((label: any) => (
                    <span
                      key={label.id}
                      className="px-2 py-0.5 text-2xs font-medium rounded-full"
                      style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              ) : (
                <button className="text-xs text-[#4493F8] hover:text-[#4493F8]/80 hover:underline transition-colors">
                  + Add labels
                </button>
              )}
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
                  <Bookmark size={14} /> Projects
                </div>
                <button className="text-[#484F58] hover:text-[#E6EDF3] transition-colors">
                  <Edit3 size={12} />
                </button>
              </div>
              <span className="text-xs text-[#8D96A0]">None yet</span>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
                  <Milestone size={14} /> Milestone
                </div>
                <button className="text-[#484F58] hover:text-[#E6EDF3] transition-colors">
                  <Edit3 size={12} />
                </button>
              </div>
              {issue.milestone ? (
                <div>
                  <div className="text-xs text-[#E6EDF3] font-medium mb-1">{issue.milestone.title}</div>
                  <div className="w-full h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8B84B] rounded-full transition-all"
                      style={{ width: `${Math.min(issue.milestone.progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-2xs text-[#484F58] mt-0.5">
                    {issue.milestone.closedIssueCount} / {issue.milestone.openIssueCount + issue.milestone.closedIssueCount} completed
                  </div>
                </div>
              ) : (
                <span className="text-xs text-[#8D96A0]">No milestone</span>
              )}
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider">
                  <Github size={14} /> Linked pull requests
                </div>
                <button className="text-[#484F58] hover:text-[#E6EDF3] transition-colors">
                  <Edit3 size={12} />
                </button>
              </div>
              <p className="text-xs text-[#8D96A0]">Successfully merging a pull request may close this issue.</p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#8D96A0] uppercase tracking-wider mb-2">
                <User size={14} /> {participantAvatars.length} {participantAvatars.length === 1 ? 'participant' : 'participants'}
              </div>
              <div className="flex -space-x-1.5">
                {participantAvatars.slice(0, 10).map((p) => (
                  p.avatarUrl ? (
                    <img
                      key={p.username}
                      src={p.avatarUrl}
                      alt={p.username}
                      className="w-6 h-6 rounded-full border-2 border-[#161B22]"
                      title={p.username}
                    />
                  ) : (
                    <div
                      key={p.username}
                      className="w-6 h-6 rounded-full bg-[#21262D] border-2 border-[#161B22] flex items-center justify-center text-[10px] font-medium text-[#E6EDF3]"
                      title={p.username}
                    >
                      {p.username?.charAt(0).toUpperCase()}
                    </div>
                  )
                ))}
                {participantAvatars.length > 10 && (
                  <div className="w-6 h-6 rounded-full bg-[#1C2128] border-2 border-[#161B22] flex items-center justify-center text-[10px] text-[#8D96A0] font-medium">
                    +{participantAvatars.length - 10}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
              <button
                onClick={() => setSubscribed(!subscribed)}
                className="w-full flex items-center gap-2 text-xs text-[#E6EDF3] hover:text-[#E8B84B] transition-colors mb-1"
              >
                {subscribed ? <BellOff size={14} className="text-[#F85149]" /> : <Bell size={14} />}
                {subscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
              {!subscribed && (
                <p className="text-2xs text-[#484F58]">You're not receiving notifications from this thread.</p>
              )}
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 space-y-2">
              <button
                onClick={handleLockToggle}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-md transition-colors"
              >
                {issue.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                {issue.isLocked ? 'Unlock conversation' : 'Lock conversation'}
              </button>
              <button
                onClick={handlePinToggle}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-md transition-colors"
              >
                {issue.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                {issue.isPinned ? 'Unpin issue' : 'Pin issue'}
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-md transition-colors">
                <ArrowUpFromLine size={12} /> Transfer issue
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#F85149] hover:bg-[#F85149]/10 rounded-md transition-colors">
                <XCircle size={12} /> Delete issue
              </button>
            </div>

            <button
              onClick={handleStateToggle}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                issue.state === 'open'
                  ? 'bg-[#F85149]/20 text-[#F85149] hover:bg-[#F85149]/30'
                  : 'bg-[#3FB950]/20 text-[#3FB950] hover:bg-[#3FB950]/30'
              )}
            >
              {issue.state === 'open' ? <CheckCircle size={16} /> : <CircleDot size={16} />}
              {issue.state === 'open' ? 'Close issue' : 'Reopen issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
