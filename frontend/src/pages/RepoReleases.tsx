import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag, Package, Download, Clock, User, ChevronRight } from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';
import { repoApi } from '@lib/api/endpoints/repos';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoReleases() {
  const p = useParams<{ owner: string; name?: string; repo?: string }>(); const owner = p.owner || ""; const name = p.name || p.repo || "";
  const navigate = useNavigate();

  const { data: releases, isLoading, error } = useQuery({
    queryKey: ['releases', owner, name],
    queryFn: () => repoApi.getReleases(owner!, name!),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Package size={24} className="text-accent" />
            <div className="h-7 w-40 bg-surface rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <VeteranSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load releases" description="There was an error loading the releases." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Releases</h1>
            <span className="text-sm text-text-muted">{releases?.length ?? 0} releases</span>
          </div>
        </div>

        {!releases || releases.length === 0 ? (
          <VeteranEmptyState icon="folder" title="No releases yet" description="There are no releases for this repository." />
        ) : (
          <div className="space-y-3">
            {(releases as any[]).map((release: any) => (
              <div
                key={release.id}
                className="border border-border rounded-lg bg-primary-dark p-4 hover:bg-surface/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/${owner}/${name}/releases/tag/${release.tagName || release.tag_name}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={16} className={release.isLatest || release.latest ? 'text-accent' : 'text-text-muted'} />
                      <h3 className="text-lg font-semibold text-text-primary">{release.name}</h3>
                      {(release.isPrerelease || release.prerelease) && (
                        <span className="px-2 py-0.5 text-2xs bg-warning/20 text-warning rounded font-medium">Pre-release</span>
                      )}
                      {(release.isLatest || release.latest) && (
                        <span className="px-2 py-0.5 text-2xs bg-success/20 text-success rounded font-medium">Latest</span>
                      )}
                    </div>
                    <code className="text-sm font-mono text-accent">{release.tagName || release.tag_name}</code>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                      <span className="flex items-center gap-1"><User size={12} />{release.authorUsername || release.author?.username || 'unknown'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(release.publishedAt || release.published_at || release.createdAt || release.created_at)}</span>
                      <span className="flex items-center gap-1"><Download size={12} />{formatCount(release.downloadCount || release.download_count || 0)} downloads</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-text-muted mt-1 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
