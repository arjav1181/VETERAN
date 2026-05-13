import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PRDetail } from '@/components/pulls/PRDetail';
import { usePull, usePullCommits, usePullReviews } from '@hooks/usePulls';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

function mapPR(apiPr: any): any {
  return {
    id: apiPr.id,
    repositoryId: apiPr.repo_id || apiPr.repositoryId || '',
    number: apiPr.number,
    title: apiPr.title,
    body: apiPr.body || '',
    bodyHtml: apiPr.bodyHtml || apiPr.body_html || null,
    state: apiPr.state,
    isDraft: apiPr.draft || apiPr.isDraft || false,
    isLocked: apiPr.locked || apiPr.isLocked || false,
    isMergeable: apiPr.mergeable ?? apiPr.isMergeable ?? null,
    mergeableState: apiPr.mergeableState || apiPr.mergeable_state || 'unknown',
    mergeCommitSha: apiPr.merge_commit_sha || apiPr.mergeCommitSha || null,
    mergeMethod: apiPr.mergeMethod || apiPr.merge_method || null,
    mergedById: apiPr.mergedBy?.id || apiPr.mergedById || apiPr.merged_by_id || null,
    mergedByUsername: apiPr.mergedBy?.username || apiPr.mergedByUsername || apiPr.merged_by_username || null,
    mergedByAvatar: apiPr.mergedBy?.avatar_url || apiPr.mergedByAvatar || null,
    mergedAt: apiPr.merged_at || apiPr.mergedAt || null,
    closedById: apiPr.closedById || apiPr.closed_by_id || null,
    closedByUsername: apiPr.closedByUsername || apiPr.closed_by_username || null,
    closedAt: apiPr.closed_at || apiPr.closedAt || null,
    authorId: apiPr.author?.id || apiPr.authorId || '',
    authorUsername: apiPr.author?.username || apiPr.authorUsername || '',
    authorAvatar: apiPr.author?.avatar_url || apiPr.authorAvatar || null,
    headRef: apiPr.head?.ref || apiPr.headRef || '',
    headSha: apiPr.head?.sha || apiPr.headSha || '',
    headRepoId: apiPr.head?.repo?.id || apiPr.headRepoId || '',
    headRepoFullName: apiPr.head?.repo?.full_name || apiPr.headRepoFullName || '',
    baseRef: apiPr.base?.ref || apiPr.baseRef || '',
    baseSha: apiPr.base?.sha || apiPr.baseSha || '',
    baseRepoId: apiPr.base?.repo?.id || apiPr.baseRepoId || '',
    additions: apiPr.additions || 0,
    deletions: apiPr.deletions || 0,
    changedFiles: apiPr.changed_files ?? apiPr.changedFiles ?? 0,
    commentCount: apiPr.comments_count ?? apiPr.commentCount ?? 0,
    reviewCommentCount: apiPr.review_comments_count ?? apiPr.reviewCommentCount ?? 0,
    commitCount: apiPr.commits_count ?? apiPr.commitCount ?? 0,
    labelIds: (apiPr.labels || []).map((l: any) => l.id || l),
    assigneeIds: (apiPr.assignees || []).map((a: any) => a.id || a),
    milestoneId: apiPr.milestone?.id || apiPr.milestoneId || null,
    autoMergeEnabled: apiPr.autoMergeEnabled || apiPr.auto_merge_enabled || false,
    autoMergeMethod: apiPr.autoMergeMethod || apiPr.auto_merge_method || null,
    draftAt: apiPr.draftAt || apiPr.draft_at || null,
    readyForReviewAt: apiPr.readyForReviewAt || apiPr.ready_for_review_at || null,
    createdAt: apiPr.created_at || apiPr.createdAt || '',
    updatedAt: apiPr.updated_at || apiPr.updatedAt || '',
  };
}

function mapPRCommit(c: any): any {
  return {
    id: c.id || c.sha,
    pullRequestId: c.pullRequestId || c.pull_request_id || '',
    commitId: c.commitId || c.commit_id || c.sha,
    sha: c.sha,
    shortSha: c.shortSha || c.sha?.substring(0, 7) || '',
    message: c.message || '',
    messageHeadline: c.messageHeadline || c.message?.split('\n')[0] || '',
    authorName: c.authorName || c.author?.name || '',
    authorEmail: c.authorEmail || c.author?.email || '',
    authorAvatar: c.authorAvatar || c.author?.avatar_url || null,
    authoredAt: c.authoredAt || c.author?.date || '',
    committerName: c.committerName || c.committer?.name || '',
    committerEmail: c.committerEmail || c.committer?.email || '',
    committedAt: c.committedAt || c.committer?.date || '',
    additions: c.additions || 0,
    deletions: c.deletions || 0,
    totalChanges: c.totalChanges || 0,
    parentShas: c.parentShas || [],
    order: c.order || 0,
  };
}

export function RepoPullDetail() {
  const { owner, name, number } = useParams<{ owner: string; name: string; number: string }>();
  const navigate = useNavigate();
  const pullNumber = Number(number);

  const { data: pull, isLoading: pullLoading, error } = usePull(owner!, name!, pullNumber);
  const { data: commits } = usePullCommits(owner!, name!, pullNumber);
  const { data: reviews } = usePullReviews(owner!, name!, pullNumber);

  if (pullLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-5 w-40 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !pull) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/pulls`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to pull requests
          </button>
          <VeteranEmptyState icon="alert" title="Pull request not found" description="The requested pull request could not be found." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/pulls`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to pull requests
        </button>

        <PRDetail
          pull={mapPR(pull)}
          commits={(commits ?? []).map(mapPRCommit)}
          reviews={reviews ?? []}
          timeline={[]}
        />
      </div>
    </div>
  );
}
