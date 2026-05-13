import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { CommentBox } from '@/components/issues/CommentBox';
import { cn, formatRelativeTime } from '@/lib/utils';

const MOCK_DISCUSSION = {
  id: 'disc-1',
  title: 'What are your thoughts on the new API design?',
  body: `## New API Design Proposal

I've been thinking about how we can improve our API design for better developer experience. Here are my thoughts:

### Current Issues

1. **Inconsistent naming** - Some endpoints use camelCase, others use snake_case
2. **No pagination standard** - Different endpoints use different pagination methods
3. **Missing error codes** - Error responses don't have standardized codes

### Proposed Changes

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
\`\`\`

What does everyone think?`,
  author: 'jane-dev',
  category: { name: 'General', emoji: '💬', color: '#58A6FF' },
  voteCount: 24,
  commentCount: 8,
  isAnswered: false,
  createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
};

const MOCK_COMMENTS = [
  { id: 'dc1', author: 'john-doe', body: 'Great proposal! I especially like the standardized error codes. This will make debugging much easier.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), votes: 8 },
  { id: 'dc2', author: 'alice', body: 'I agree with the pagination standard. We should also consider adding cursor-based pagination for real-time endpoints.', createdAt: new Date(Date.now() - 86400000).toISOString(), votes: 5 },
  { id: 'dc3', author: 'bob', body: 'One concern: the error code format. We need to make sure they are documented and consistent across all services.', createdAt: new Date(Date.now() - 3600000).toISOString(), votes: 3 },
];

export function RepoDiscussionDetail() {
  const { owner, name, id } = useParams<{ owner: string; name: string; id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/discussions`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to discussions
        </button>

        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button className="p-1 text-text-muted hover:text-success rounded transition-colors"><ArrowUp size={20} /></button>
            <span className="text-sm font-medium text-text-primary">{MOCK_DISCUSSION.voteCount}</span>
            <button className="p-1 text-text-muted hover:text-danger rounded transition-colors"><ArrowDown size={20} /></button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span>{MOCK_DISCUSSION.category.emoji}</span>
              <h1 className="text-xl font-semibold text-text-primary">{MOCK_DISCUSSION.title}</h1>
            </div>
            <div className="text-xs text-text-muted mb-4">
              Posted by <span className="text-text-secondary font-medium">{MOCK_DISCUSSION.author}</span> {formatRelativeTime(MOCK_DISCUSSION.createdAt)}
            </div>

            <div className="border border-border rounded-lg bg-primary-dark p-4 mb-6">
              <MarkdownRenderer content={MOCK_DISCUSSION.body} />
            </div>

            <div className="space-y-3 mb-6">
              {MOCK_COMMENTS.map(comment => (
                <div key={comment.id} className="border border-border rounded-lg bg-primary-dark p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-text-primary">{comment.author}</span>
                      <span className="text-text-muted">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-0.5 text-text-muted hover:text-success rounded transition-colors"><ArrowUp size={12} /></button>
                      <span className="text-xs text-text-muted">{comment.votes}</span>
                      <button className="p-0.5 text-text-muted hover:text-danger rounded transition-colors"><ArrowDown size={12} /></button>
                    </div>
                  </div>
                  <MarkdownRenderer content={comment.body} />
                </div>
              ))}
            </div>

            <CommentBox onSubmit={(body) => console.log('Reply:', body)} submitLabel="Reply" placeholder="Write a reply..." />
          </div>
        </div>
      </div>
    </div>
  );
}
