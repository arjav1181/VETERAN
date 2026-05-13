import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Package, Download, Clock, User, ChevronRight, ArrowDown } from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';

const MOCK_RELEASES = Array.from({ length: 10 }).map((_, i) => ({
  id: `release-${i}`,
  tagName: `v${10 - i}.0.0`,
  name: `Version ${10 - i}.0.0`,
  body: `Release notes for version ${10 - i}.0.0\n\n## What's Changed\n- Feature improvement #${100 + i}\n- Bug fix #${200 + i}\n- Performance optimization`,
  isPrerelease: i === 0,
  isLatest: i === 0,
  authorUsername: 'jane-dev',
  downloadCount: Math.floor(Math.random() * 5000 + 500),
  publishedAt: new Date(Date.now() - i * 30 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - i * 30 * 86400000).toISOString(),
}));

export function RepoReleases() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Releases</h1>
            <span className="text-sm text-text-muted">{MOCK_RELEASES.length} releases</span>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_RELEASES.map(release => (
            <div
              key={release.id}
              className="border border-border rounded-lg bg-primary-dark p-4 hover:bg-surface/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/${owner}/${name}/releases/tag/${release.tagName}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={16} className={release.isLatest ? 'text-accent' : 'text-text-muted'} />
                    <h3 className="text-lg font-semibold text-text-primary">{release.name}</h3>
                    {release.isPrerelease && (
                      <span className="px-2 py-0.5 text-2xs bg-warning/20 text-warning rounded font-medium">Pre-release</span>
                    )}
                    {release.isLatest && (
                      <span className="px-2 py-0.5 text-2xs bg-success/20 text-success rounded font-medium">Latest</span>
                    )}
                  </div>
                  <code className="text-sm font-mono text-accent">{release.tagName}</code>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                    <span className="flex items-center gap-1"><User size={12} />{release.authorUsername}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(release.publishedAt)}</span>
                    <span className="flex items-center gap-1"><Download size={12} />{formatCount(release.downloadCount)} downloads</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-text-muted mt-1 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
