import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus } from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { useState } from 'react';
import { getRepoParams } from '@lib/route-utils';

export function RepoDiscussions() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('');

  const { data: discussions, isLoading, error } = useQuery({
    queryKey: ['discussions', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/discussions`),
    enabled: !!owner && !!name,
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
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare size={24} className="text-accent" />
            <div className="h-7 w-40 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  const cats = (categories as any[]) ?? [];
  const filtered = (discussions as any[])?.filter((d: any) => !activeCategory || d.categoryId === activeCategory || d.categoryName === activeCategory) ?? [];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Discussions</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New discussion
          </button>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Discussions unavailable" description="The discussions feature is not available or there was an error loading discussions." />
        ) : filtered.length === 0 ? (
          <VeteranEmptyState icon="inbox" title="No discussions yet" description="Start a new discussion to engage with the community." action={{ label: 'Start discussion', onClick: () => {} }} />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
              {cats.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap',
                    activeCategory === cat.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface/80'
                  )}
                >
                  <span>{cat.emoji}</span> {cat.name}
                </button>
              ))}
            </div>

            <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
              {filtered.map((disc: any) => (
                <div
                  key={disc.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/${owner}/${name}/discussions/${disc.number || disc.id}`)}
                >
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <span className="text-sm font-medium text-text-secondary">{disc.voteCount || disc.upvoteCount || 0}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {disc.isPinned && <span className="text-xs text-accent">📌</span>}
                      {disc.isAnswered && <span className="text-xs text-success">✅</span>}
                      <span className="text-sm font-medium text-text-primary truncate">{disc.title}</span>
                      <span className="text-xs">{disc.categoryEmoji || (cats.find((c: any) => c.id === disc.categoryId)?.emoji) || ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span>{disc.authorUsername || disc.author?.username || 'unknown'}</span>
                      <span>{formatRelativeTime(disc.created_at || disc.createdAt)}</span>
                      <span>{(disc.commentCount ?? disc.comment_count ?? 0)} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
