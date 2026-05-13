import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PRList } from '@/components/pulls/PRList';
import { usePulls } from '@hooks/usePulls';
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

export function RepoPulls() {
  const p = useParams<{ owner: string; name?: string; repo?: string }>(); const owner = p.owner || ""; const name = p.name || p.repo || "";
  const navigate = useNavigate();
  const [state, setState] = useState<'open' | 'closed' | 'merged'>('open');

  const { data: pulls, isLoading, error } = usePulls(owner!, name!, { state });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-7 w-40 bg-surface rounded animate-pulse mb-6" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load pull requests" description="There was an error loading the pull requests." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">Pull Requests</h1>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New pull request
          </button>
        </div>

        <PRList
          pulls={(pulls ?? []).map(mapPR)}
          state={state}
          onStateChange={setState}
          onPRClick={(number) => navigate(`/${owner}/${name}/pulls/${number}`)}
        />
      </div>
    </div>
  );
}
