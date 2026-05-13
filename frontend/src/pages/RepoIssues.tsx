import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { IssueList } from '@/components/issues/IssueList';
import type { Issue, IssueLabel, IssueMilestone } from '@/types';

const MOCK_LABELS: IssueLabel[] = [
  { id: 'l1', repositoryId: '1', name: 'bug', color: '#F85149', description: 'Something is broken', isDefault: true, issueCount: 5, createdAt: '', updatedAt: '' },
  { id: 'l2', repositoryId: '1', name: 'enhancement', color: '#3FB950', description: 'New feature request', isDefault: true, issueCount: 8, createdAt: '', updatedAt: '' },
  { id: 'l3', repositoryId: '1', name: 'documentation', color: '#58A6FF', description: 'Documentation changes', isDefault: true, issueCount: 3, createdAt: '', updatedAt: '' },
  { id: 'l4', repositoryId: '1', name: 'help wanted', color: '#D29922', description: 'Looking for contributors', isDefault: false, issueCount: 2, createdAt: '', updatedAt: '' },
];

const MOCK_MILESTONES: IssueMilestone[] = [
  { id: 'm1', repositoryId: '1', number: 1, title: 'v1.0 Release', description: 'First major release', dueOn: new Date(Date.now() + 30 * 86400000).toISOString(), state: 'open', openIssueCount: 3, closedIssueCount: 7, progress: 70, createdAt: '', updatedAt: '', closedAt: null },
  { id: 'm2', repositoryId: '1', number: 2, title: 'v2.0 Roadmap', description: 'Next major version', dueOn: new Date(Date.now() + 90 * 86400000).toISOString(), state: 'open', openIssueCount: 5, closedIssueCount: 1, progress: 20, createdAt: '', updatedAt: '', closedAt: null },
];

const MOCK_ISSUES: Issue[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `issue-${i}`,
  repositoryId: '1',
  number: 100 + i,
  title: [
    'Fix login redirect loop on authentication failure',
    'Add dark mode support for dashboard',
    'Update API documentation for v2 endpoints',
    'Implement user avatar upload with cropping',
    'Database migration script fails on large datasets',
    'Add keyboard shortcuts for common actions',
    'Optimize query performance for feed page',
    'Fix memory leak in WebSocket connection',
    'Add unit tests for auth middleware',
    'Implement rate limiting for API endpoints',
    'Update dependency versions to latest',
    'Add search functionality for issues',
    'Fix mobile responsiveness for sidebar',
    'Implement export to CSV feature',
    'Add webhook support for issue events',
  ][i],
  body: 'Detailed description of the issue...',
  bodyHtml: null,
  state: i < 10 ? 'open' : 'closed',
  isLocked: false,
  lockedReason: null,
  isPinned: i === 0,
  authorId: 'user-1',
  authorUsername: ['jane-dev', 'john-doe', 'alice', 'bob'][i % 4],
  authorAvatar: null,
  assigneeIds: i < 5 ? ['user-2'] : [],
  labelIds: i < 3 ? ['l1', 'l2'] : i < 6 ? ['l2'] : i < 9 ? ['l3'] : i % 2 === 0 ? ['l4'] : [],
  milestoneId: i < 5 ? 'm1' : i < 10 ? 'm2' : null,
  commentCount: Math.floor(Math.random() * 10),
  reactionCount: 0,
  closeById: null,
  closeByUsername: null,
  closedAt: i >= 10 ? new Date(Date.now() - (i - 10) * 86400000).toISOString() : null,
  createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export function RepoIssues() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'open' | 'closed'>('open');

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
          issues={MOCK_ISSUES.filter(i => state === 'open' ? i.state === 'open' : i.state === 'closed')}
          labels={MOCK_LABELS}
          milestones={MOCK_MILESTONES}
          state={state}
          onStateChange={setState}
          onIssueClick={(number) => navigate(`/${owner}/${name}/issues/${number}`)}
        />
      </div>
    </div>
  );
}
