import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { CommentBox } from '@/components/issues/CommentBox';
import { useIssue, useIssueComments, useCreateComment, useIssueLabels } from '@hooks/useIssues';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getRepoParams } from '@lib/route-utils';

function mapIssue(apiIssue: any): any {
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
    labelIds: (apiIssue.labels || []).map((l: any) => l.id || l),
    milestoneId: apiIssue.milestone?.id || apiIssue.milestoneId || null,
    commentCount: apiIssue.comments_count ?? apiIssue.commentCount ?? 0,
    reactionCount: apiIssue.reactionCount || 0,
    closeById: apiIssue.closeById || apiIssue.close_by_id || null,
    closeByUsername: apiIssue.closeByUsername || apiIssue.close_by_username || null,
    closedAt: apiIssue.closed_at || apiIssue.closedAt || null,
    createdAt: apiIssue.created_at || apiIssue.createdAt || '',
    updatedAt: apiIssue.updated_at || apiIssue.updatedAt || '',
  };
}

function mapComment(apiComment: any): any {
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

export function RepoIssueDetail() {
  const { owner, repo: name } = getRepoParams(); const number = p.number;
  const navigate = useNavigate();
  const issueNumber = Number(number);

  const { data: issue, isLoading: issueLoading, error: issueError } = useIssue(owner!, name!, issueNumber);
  const { data: comments, isLoading: commentsLoading } = useIssueComments(owner!, name!, issueNumber);
  const { data: labels } = useIssueLabels(owner!, name!);
  const createComment = useCreateComment(owner!, name!, issueNumber);

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-5 w-32 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (issueError || !issue) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/issues`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to issues
          </button>
          <VeteranEmptyState icon="alert" title="Issue not found" description="The requested issue could not be found." />
        </div>
      </div>
    );
  }

  const mappedIssue = mapIssue(issue);
  const mappedLabels = (labels ?? []).map((l: any) => ({
    id: l.id,
    repositoryId: l.repositoryId || l.repo_id || '',
    name: l.name,
    description: l.description || null,
    color: l.color,
    isDefault: l.isDefault || l.default || false,
    issueCount: l.issueCount || l.issue_count || 0,
    createdAt: l.createdAt || l.created_at || '',
    updatedAt: l.updatedAt || l.updated_at || '',
  }));
  const mappedComments = (comments ?? []).map(mapComment);

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/issues`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to issues
        </button>

        <IssueDetail issue={mappedIssue} labels={mappedLabels} />

        <div className="mt-6">
          <IssueTimeline
            comments={mappedComments}
            events={[]}
            loading={commentsLoading}
          />
        </div>

        <div className="mt-6">
          <CommentBox onSubmit={(body) => createComment.mutate(body)} />
        </div>
      </div>
    </div>
  );
}
