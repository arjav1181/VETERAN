import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PRList } from '@/components/pulls/PRList';
import type { PullRequest } from '@/types';

const MOCK_PULLS: PullRequest[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `pr-${i}`,
  repositoryId: '1',
  number: 200 + i,
  title: [
    'Implement new authentication flow with OAuth support',
    'Fix data race in concurrent request handler',
    'Add real-time notification system',
    'Refactor database access layer for performance',
    'Update UI components to use new design system',
    'Add end-to-end testing infrastructure',
    'Implement file upload with progress tracking',
    'Fix cross-origin resource sharing issues',
    'Add user preference management API',
    'Implement search with Elasticsearch integration',
    'Update deployment pipeline for zero-downtime',
    'Add API versioning support',
  ][i],
  body: 'Pull request description...',
  bodyHtml: null,
  state: i < 8 ? 'open' : i < 10 ? 'closed' : 'merged',
  isDraft: i < 2,
  isLocked: false,
  isMergeable: i < 6 ? true : false,
  mergeableState: i < 6 ? 'clean' : 'unknown',
  mergeCommitSha: i >= 10 ? 'abc123' : null,
  mergeMethod: i >= 10 ? 'merge' : null,
  mergedById: i >= 10 ? 'u1' : null,
  mergedByUsername: i >= 10 ? 'jane-dev' : null,
  mergedByAvatar: null,
  mergedAt: i >= 10 ? new Date(Date.now() - i * 86400000).toISOString() : null,
  closedById: i >= 8 && i < 10 ? 'u2' : null,
  closedByUsername: i >= 8 && i < 10 ? 'john-doe' : null,
  closedAt: i >= 8 && i < 10 ? new Date(Date.now() - i * 86400000).toISOString() : null,
  authorId: 'u' + ((i % 4) + 1),
  authorUsername: ['jane-dev', 'john-doe', 'alice', 'bob'][i % 4],
  authorAvatar: null,
  headRef: `feature/${['auth', 'fix', 'notifications', 'refactor', 'design', 'e2e', 'upload', 'cors', 'prefs', 'search', 'deploy', 'versioning'][i]}`,
  headSha: `head${i}123`,
  headRepoId: '1',
  headRepoFullName: `owner/repo`,
  baseRef: 'main',
  baseSha: 'base123',
  baseRepoId: '1',
  additions: Math.floor(Math.random() * 200 + 50),
  deletions: Math.floor(Math.random() * 100 + 10),
  changedFiles: Math.floor(Math.random() * 15 + 3),
  commentCount: Math.floor(Math.random() * 20),
  reviewCommentCount: Math.floor(Math.random() * 10),
  commitCount: Math.floor(Math.random() * 10 + 1),
  labelIds: i < 3 ? ['l1', 'l2'] : i < 6 ? ['l2'] : [],
  assigneeIds: i < 4 ? ['u2'] : [],
  milestoneId: i < 5 ? 'm1' : null,
  autoMergeEnabled: false,
  autoMergeMethod: null,
  draftAt: i < 2 ? new Date().toISOString() : null,
  readyForReviewAt: i < 2 ? null : new Date(Date.now() - i * 86400000).toISOString(),
  createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export function RepoPulls() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'open' | 'closed' | 'merged'>('open');

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
          pulls={MOCK_PULLS}
          state={state}
          onStateChange={setState}
          onPRClick={(number) => navigate(`/${owner}/${name}/pulls/${number}`)}
        />
      </div>
    </div>
  );
}
