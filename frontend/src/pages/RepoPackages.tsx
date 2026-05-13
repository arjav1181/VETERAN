import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package as PackageIcon, Download, Clock, Tag } from 'lucide-react';
import { formatRelativeTime, formatCount } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoPackages() {
  const { owner, name } = useParams<{ owner: string; name: string }>();

  const { data: packages, isLoading, error } = useQuery({
    queryKey: ['packages', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/packages`),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <PackageIcon size={24} className="text-accent" />
            <div className="h-7 w-32 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <PackageIcon size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Packages</h1>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Packages unavailable" description="The packages feature is not available or there was an error loading packages." />
        ) : !packages || packages.length === 0 ? (
          <VeteranEmptyState icon="folder" title="No packages published" description="Publish packages to share code across your projects" />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
            {(packages as any[]).map((pkg: any) => (
              <div key={pkg.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
                <PackageIcon size={20} className="text-info shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-text-primary truncate block">{pkg.name}</span>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Tag size={12} />{pkg.latestVersion || pkg.latest_version || 'N/A'}</span>
                    <span>{pkg.type}</span>
                    <span className="flex items-center gap-1"><Download size={12} />{formatCount(pkg.downloadCount || pkg.download_count || 0)} downloads</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(pkg.updated_at || pkg.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
