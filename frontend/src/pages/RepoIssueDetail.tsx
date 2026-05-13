import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { CommentBox } from '@/components/issues/CommentBox';
import type { Issue, IssueLabel, IssueMilestone, IssueComment, IssueEvent } from '@/types';

const MOCK_ISSUE: Issue = {
  id: 'issue-1',
  repositoryId: '1',
  number: 101,
  title: 'Fix login redirect loop on authentication failure',
  body: '## Description\n\nWhen authentication fails, the system enters a redirect loop between the login page and the callback URL.\n\n## Steps to reproduce\n\n1. Go to the login page\n2. Enter invalid credentials\n3. Observe the redirect loop\n\n## Expected behavior\n\nUser should see an error message on the login page.\n\n## Environment\n\n- Browser: Chrome 120\n- OS: macOS 14.2',
  bodyHtml: null,
  state: 'open',
  isLocked: false,
  lockedReason: null,
  isPinned: true,
  authorId: 'user-1',
  authorUsername: 'jane-dev',
  authorAvatar: null,
  assigneeIds: ['user-2'],
  labelIds: ['l1', 'l2'],
  milestoneId: 'm1',
  commentCount: 5,
  reactionCount: 3,
  closeById: null,
  closeByUsername: null,
  closedAt: null,
  createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
};

const MOCK_LABELS: IssueLabel[] = [
  { id: 'l1', repositoryId: '1', name: 'bug', color: '#F85149', description: '', isDefault: true, issueCount: 0, createdAt: '', updatedAt: '' },
  { id: 'l2', repositoryId: '1', name: 'enhancement', color: '#3FB950', description: '', isDefault: true, issueCount: 0, createdAt: '', updatedAt: '' },
];

const MOCK_COMMENTS: IssueComment[] = [
  { id: 'c1', issueId: '1', authorId: 'u2', authorUsername: 'john-doe', authorAvatar: null, authorIsCollaborator: true, body: 'I can reproduce this. The issue seems to be in the OAuth callback handler.', bodyHtml: null, isEdited: false, isDeleted: false, isMinimized: false, minimizedReason: null, reactionCount: 2, replyToId: null, editHistory: [], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'c2', issueId: '1', authorId: 'u3', authorUsername: 'alice', authorAvatar: null, authorIsCollaborator: false, body: 'Looking at the stack trace, it appears the session token is not being cleared on failure.', bodyHtml: null, isEdited: false, isDeleted: false, isMinimized: false, minimizedReason: null, reactionCount: 1, replyToId: null, editHistory: [], createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c3', issueId: '1', authorId: 'u1', authorUsername: 'jane-dev', authorAvatar: null, authorIsCollaborator: true, body: 'Fixed in PR #142 by resetting the session state before redirect.', bodyHtml: null, isEdited: false, isDeleted: false, isMinimized: false, minimizedReason: null, reactionCount: 3, replyToId: null, editHistory: [], createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
];

const MOCK_EVENTS: IssueEvent[] = [
  { id: 'e1', issueId: '1', eventType: 'labeled', actorId: 'u1', actorUsername: 'jane-dev', actorAvatar: null, payload: { label: 'bug' }, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'e2', issueId: '1', eventType: 'assigned', actorId: 'u1', actorUsername: 'jane-dev', actorAvatar: null, payload: { assignee: 'john-doe' }, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'e3', issueId: '1', eventType: 'milestoned', actorId: 'u1', actorUsername: 'jane-dev', actorAvatar: null, payload: { milestone: 'v1.0 Release' }, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export function RepoIssueDetail() {
  const { owner, name, number } = useParams<{ owner: string; name: string; number: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/issues`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to issues
        </button>

        <IssueDetail issue={MOCK_ISSUE} labels={MOCK_LABELS} />

        <div className="mt-6">
          <IssueTimeline comments={MOCK_COMMENTS} events={MOCK_EVENTS} />
        </div>

        <div className="mt-6">
          <CommentBox onSubmit={(body) => console.log('Comment:', body)} />
        </div>
      </div>
    </div>
  );
}
