import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Edit3, Clock, History } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { formatRelativeTime } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoWikiPage() {
  const { owner, name, slug } = useParams<{ owner: string; name: string; slug: string }>();
  const navigate = useNavigate();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['wiki-page', owner, name, slug],
    queryFn: () => api.get<any>(`/repos/${owner}/${name}/wiki/${slug}`),
    enabled: !!owner && !!name && !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="h-5 w-24 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/wiki`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to wiki
          </button>
          <VeteranEmptyState icon="alert" title="Page not found" description="The requested wiki page could not be found." />
        </div>
      </div>
    );
  }

  const pageData = page as any;

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/wiki`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to wiki
        </button>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              <h1 className="text-lg font-semibold text-text-primary">{p.title || (slug || 'home').replace(/-/g, ' ')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <Edit3 size={14} /> Edit
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <History size={14} /> History
              </button>
            </div>
          </div>
          <div className="p-6">
            <MarkdownRenderer content={p.content || ''} />
          </div>
          <div className="px-4 py-2 bg-surface border-t border-border text-xs text-text-muted flex items-center gap-1">
            <Clock size={12} /> Last edited {formatRelativeTime(p.lastEditedAt || p.updated_at || p.updatedAt)} by {p.lastEditorUsername || p.authorUsername || 'unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}
