import { useParams } from 'react-router-dom';
import { Package, Download, Clock, Tag } from 'lucide-react';
import { formatRelativeTime, formatCount } from '@/lib/utils';

const MOCK_PACKAGES = [
  { id: 'pkg-1', name: '@veteran/core', type: 'npm', version: '2.1.0', downloads: 15230, updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'pkg-2', name: 'veteran-cli', type: 'npm', version: '1.5.2', downloads: 8920, updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'pkg-3', name: 'veteran-api-client', type: 'npm', version: '0.8.1', downloads: 3450, updatedAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'pkg-4', name: 'veteran-icons', type: 'npm', version: '1.0.0', downloads: 1200, updatedAt: new Date(Date.now() - 604800000).toISOString() },
];

export function RepoPackages() {
  const { owner, name } = useParams<{ owner: string; name: string }>();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Package size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Packages</h1>
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
          {MOCK_PACKAGES.map(pkg => (
            <div key={pkg.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
              <Package size={20} className="text-info shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate block">{pkg.name}</span>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Tag size={12} />{pkg.version}</span>
                  <span>{pkg.type}</span>
                  <span className="flex items-center gap-1"><Download size={12} />{formatCount(pkg.downloads)} downloads</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(pkg.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {MOCK_PACKAGES.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Package size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium text-text-primary mb-1">No packages published</p>
            <p className="text-sm">Publish packages to share code across your projects</p>
          </div>
        )}
      </div>
    </div>
  );
}
