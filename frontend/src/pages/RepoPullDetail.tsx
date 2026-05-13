import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PRDetail } from '@/components/pulls/PRDetail';
import type { PullRequest, PRReview, PRCommit, PRCheckResult, PullRequestTimelineItem } from '@/types';

const MOCK_PULL: PullRequest = {
  id: 'pr-1',
  repositoryId: '1',
  number: 201,
  title: 'Implement new authentication flow with OAuth support',
  body: '## Summary\n\nThis PR implements a new authentication flow with OAuth 2.0 support.\n\n## Changes\n\n- Added OAuth authorization endpoint\n- Implemented token exchange\n- Added refresh token support\n- Updated documentation\n\n## Testing\n\n- Unit tests for all new endpoints\n- Integration tests for OAuth flow\n- Manual testing with Google and GitHub providers',
  bodyHtml: null,
  state: 'open',
  isDraft: false,
  isLocked: false,
  isMergeable: true,
  mergeableState: 'clean',
  mergeCommitSha: null,
  mergeMethod: null,
  mergedById: null,
  mergedByUsername: null,
  mergedByAvatar: null,
  mergedAt: null,
  closedById: null,
  closedByUsername: null,
  closedAt: null,
  authorId: 'u1',
  authorUsername: 'jane-dev',
  authorAvatar: null,
  headRef: 'feature/oauth-implementation',
  headSha: 'abc123def',
  headRepoId: '1',
  headRepoFullName: 'owner/repo',
  baseRef: 'main',
  baseSha: 'base123def',
  baseRepoId: '1',
  additions: 345,
  deletions: 89,
  changedFiles: 12,
  commentCount: 8,
  reviewCommentCount: 15,
  commitCount: 7,
  labelIds: ['enhancement'],
  assigneeIds: ['u2'],
  milestoneId: 'm1',
  autoMergeEnabled: false,
  autoMergeMethod: null,
  draftAt: null,
  readyForReviewAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
};

const MOCK_COMMITS: PRCommit[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `pc-${i}`, pullRequestId: '1', commitId: `c${i}`,
  sha: `sha${i}${'a'.repeat(39 - String(i).length)}`,
  shortSha: `sha${i}${'a'.repeat(6 - String(i).length)}`,
  message: `feat: implement OAuth step ${i + 1}`,
  messageHeadline: `feat: implement OAuth step ${i + 1}`,
  authorName: 'Jane Developer',
  authorEmail: 'jane@veteran.dev',
  authorAvatar: null,
  authoredAt: new Date(Date.now() - (10 - i) * 86400000).toISOString(),
  committerName: 'Jane Developer',
  committerEmail: 'jane@veteran.dev',
  committedAt: new Date(Date.now() - (10 - i) * 86400000).toISOString(),
  additions: Math.floor(Math.random() * 100),
  deletions: Math.floor(Math.random() * 30),
  totalChanges: 0,
  parentShas: [],
  order: i,
}));

const MOCK_CHECKS: PRCheckResult[] = [
  { id: 'ck1', pullRequestId: '1', checkRunId: 'cr1', name: 'Build', status: 'completed', conclusion: 'success', url: '', startedAt: '', completedAt: '' },
  { id: 'ck2', pullRequestId: '1', checkRunId: 'cr2', name: 'Lint', status: 'completed', conclusion: 'success', url: '', startedAt: '', completedAt: '' },
  { id: 'ck3', pullRequestId: '1', checkRunId: 'cr3', name: 'Tests', status: 'completed', conclusion: 'success', url: '', startedAt: '', completedAt: '' },
  { id: 'ck4', pullRequestId: '1', checkRunId: 'cr4', name: 'Security Scan', status: 'completed', conclusion: 'success', url: '', startedAt: '', completedAt: '' },
];

const MOCK_TIMELINE: PullRequestTimelineItem[] = [
  { id: 't1', pullRequestId: '1', eventType: 'review_requested', actorId: 'u1', actorUsername: 'jane-dev', actorAvatar: null, payload: { requestedReviewer: 'john-doe' }, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 't2', pullRequestId: '1', eventType: 'labeled', actorId: 'u1', actorUsername: 'jane-dev', actorAvatar: null, payload: { label: 'enhancement' }, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
];

export function RepoPullDetail() {
  const { owner, name, number } = useParams<{ owner: string; name: string; number: string }>();
  const navigate = useNavigate();

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
          pull={MOCK_PULL}
          commits={MOCK_COMMITS}
          checks={MOCK_CHECKS}
          timeline={MOCK_TIMELINE}
        />
      </div>
    </div>
  );
}
