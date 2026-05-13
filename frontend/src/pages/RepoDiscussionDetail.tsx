import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { CommentBox } from '@/components/issues/CommentBox';
import { cn, formatRelativeTime } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoDiscussionDetail() {
  const { owner, name, id } = useParams<{ owner: string; name: string; id: string }>();
  const navigate = useNavigate();

  const { data: discussion, isLoading, error } = useQuery({
    queryKey: ['discussion', owner, name, id],
    queryFn: () => api.get<any>(`/repos/${owner}/${name}/discussions/${id}`),
    enabled: !!owner && !!name && !!id,
  });

  const { data: commentsData } = useQuery({
    queryKey: ['discussion-comments', owner, name, id],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/discussions/${id}/comments`),
    enabled: !!owner && !!name && !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['discussion-categories', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/discussions/categories`),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="h-5 w-32 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/discussions`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to discussions
          </button>
          <VeteranEmptyState icon="alert" title="Discussion not found" description="The requested discussion could not be found." />
        </div>
      </div>
    );
  }

  const disc = discussion as any;
  const comments = (commentsData as any[]) ?? [];
  const cats = (categories as any[]) ?? [];
  const category = cats.find((c: any) => c.id === disc.categoryId);

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
            <span className="text-sm font-medium text-text-primary">{disc.voteCount || disc.upvoteCount || 0}</span>
            <button className="p-1 text-text-muted hover:text-danger rounded transition-colors"><ArrowDown size={20} /></button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span>{category?.emoji || disc.categoryEmoji || '💬'}</span>
              <h1 className="text-xl font-semibold text-text-primary">{disc.title}</h1>
            </div>
            <div className="text-xs text-text-muted mb-4">
              Posted by <span className="text-text-secondary font-medium">{disc.authorUsername || disc.author?.username || 'unknown'}</span> {formatRelativeTime(disc.created_at || disc.createdAt)}
            </div>

            <div className="border border-border rounded-lg bg-primary-dark p-4 mb-6">
              <MarkdownRenderer content={disc.body || ''} />
            </div>

            <div className="space-y-3 mb-6">
              {comments.length === 0 ? (
                <VeteranEmptyState icon="inbox" title="No comments yet" description="Be the first to comment on this discussion." />
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="border border-border rounded-lg bg-primary-dark p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-text-primary">{comment.authorUsername || comment.author?.username || 'unknown'}</span>
                        <span className="text-text-muted">{formatRelativeTime(comment.created_at || comment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-0.5 text-text-muted hover:text-success rounded transition-colors"><ArrowUp size={12} /></button>
                        <span className="text-xs text-text-muted">{comment.voteCount || comment.upvoteCount || 0}</span>
                        <button className="p-0.5 text-text-muted hover:text-danger rounded transition-colors"><ArrowDown size={12} /></button>
                      </div>
                    </div>
                    <MarkdownRenderer content={comment.body || ''} />
                  </div>
                ))
              )}
            </div>

            <CommentBox onSubmit={(body) => console.log('Reply:', body)} submitLabel="Reply" placeholder="Write a reply..." />
          </div>
        </div>
      </div>
    </div>
  );
}
