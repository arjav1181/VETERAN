import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, Search as SearchIcon } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoWiki() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['wiki-pages', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/wiki`),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={24} className="text-accent" />
            <div className="h-7 w-24 bg-surface rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <VeteranSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Wiki</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New page
          </button>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Wiki unavailable" description="The wiki feature is not available or there was an error loading pages." />
        ) : !pages || pages.length === 0 ? (
          <VeteranEmptyState icon="folder" title="No wiki pages yet" description="Create the first wiki page for this repository." action={{ label: 'Create page', onClick: () => {} }} />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  placeholder="Search wiki..."
                  className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {(pages as any[]).map((page: any) => (
                <div
                  key={page.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/${owner}/${name}/wiki/${page.slug}`)}
                >
                  <BookOpen size={16} className="text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-text-primary hover:text-accent transition-colors">{page.title}</span>
                  </div>
                  <div className="text-xs text-text-muted shrink-0">
                    <span>{formatRelativeTime(page.lastEditedAt || page.updated_at || page.updatedAt)} by {page.lastEditorUsername || page.authorUsername || 'unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
