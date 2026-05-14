import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { IssueList } from '@/components/issues/IssueList';
import { useIssues, useIssueLabels, useIssueMilestones } from '@hooks/useIssues';
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

export function RepoIssues() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'open' | 'closed'>('open');

  const { data: issues, isLoading: issuesLoading, error: issuesError } = useIssues(owner!, name!, { state });
  const { data: labels } = useIssueLabels(owner!, name!);
  const { data: milestones } = useIssueMilestones(owner!, name!);

  if (issuesLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-7 w-32 bg-surface rounded animate-pulse mb-6" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (issuesError) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load issues" description="There was an error loading the issues." />
        </div>
      </div>
    );
  }

  const mappedIssues = (issues ?? []).map(mapIssue);
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
  const mappedMilestones = (milestones ?? []).map((m: any) => ({
    id: m.id,
    repositoryId: m.repositoryId || m.repo_id || '',
    number: m.number,
    title: m.title,
    description: m.description || null,
    dueOn: m.due_on || m.dueOn || null,
    state: m.state || 'open',
    openIssueCount: m.open_issues ?? m.openIssueCount ?? 0,
    closedIssueCount: m.closed_issues ?? m.closedIssueCount ?? 0,
    progress: m.progress || 0,
    closedAt: m.closed_at || m.closedAt || null,
    createdAt: m.createdAt || m.created_at || '',
    updatedAt: m.updatedAt || m.updated_at || '',
  }));

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">Issues</h1>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New issue
          </button>
        </div>

        <IssueList
          issues={mappedIssues}
          labels={mappedLabels}
          milestones={mappedMilestones}
          state={state}
          onStateChange={setState}
          onIssueClick={(number) => navigate(`/${owner}/${name}/issues/${number}`)}
        />
      </div>
    </div>
  );
}
