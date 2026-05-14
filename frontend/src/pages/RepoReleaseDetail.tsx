import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Download, Clock, User, Package, Github } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { formatRelativeTime, formatCount } from '@/lib/utils';
import { repoApi } from '@lib/api/endpoints/repos';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getRepoParams } from '@lib/route-utils';

export function RepoReleaseDetail() {
  const { owner, repo: name } = getRepoParams(); const tag = p.tag;
  const navigate = useNavigate();

  const { data: release, isLoading, error } = useQuery({
    queryKey: ['release', owner, name, tag],
    queryFn: () => repoApi.getRelease(owner!, name!, tag!),
    enabled: !!owner && !!name && !!tag,
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

  if (error || !release) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to releases
          </button>
          <VeteranEmptyState icon="alert" title="Release not found" description="The requested release could not be found." />
        </div>
      </div>
    );
  }

  const r = release as any;

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to releases
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Package size={24} className="text-accent" />
              <h1 className="text-2xl font-bold text-text-primary">{r.name}</h1>
              {(r.isLatest || r.latest) && (
                <span className="px-2 py-0.5 text-xs bg-success/20 text-success rounded font-medium">Latest</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Tag size={14} className="text-accent" />
              <code className="font-mono text-accent">{r.tagName || r.tag_name}</code>
              <span className="flex items-center gap-1"><User size={14} />{r.authorUsername || r.author?.username || 'unknown'}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{formatRelativeTime(r.publishedAt || r.published_at || r.createdAt || r.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="border border-border rounded-lg bg-primary-dark p-6">
            <MarkdownRenderer content={r.body || ''} />
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg bg-surface p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Assets</h3>
              {r.assets && r.assets.length > 0 ? (
                <div className="space-y-2">
                  {(r.assets as any[]).map((asset: any) => (
                    <div key={asset.id || asset.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface/80 transition-colors cursor-pointer">
                      <Download size={14} className="text-text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-mono truncate">{asset.name}</p>
                        <p className="text-2xs text-text-muted">{asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : 'N/A'} · {formatCount(asset.downloadCount || asset.download_count || 0)} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No assets</p>
              )}
            </div>

            <div className="border border-border rounded-lg bg-surface p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Source code</h3>
              <div className="space-y-2">
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface/80 transition-colors">
                  <Github size={14} /> Source code (zip)
                </button>
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface/80 transition-colors">
                  <Github size={14} /> Source code (tar.gz)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
