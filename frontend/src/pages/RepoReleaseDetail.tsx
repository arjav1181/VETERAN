import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Download, Clock, User, Package, Github, Copy } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { formatRelativeTime, formatCount } from '@/lib/utils';

const MOCK_RELEASE = {
  id: 'release-1',
  tagName: 'v2.0.0',
  name: 'Version 2.0.0',
  body: `## Major Release v2.0.0

This is a major release with significant new features and improvements.

### What's Changed

- **New API** - Completely redesigned API with better performance
- **Dashboard** - New modern dashboard with real-time analytics
- **Security** - Enhanced security with 2FA support
- **Performance** - 3x faster load times

### Full Changelog

- feat: new API endpoints for user management (#145)
- feat: real-time dashboard with WebSocket support (#142)
- feat: two-factor authentication (#138)
- fix: resolved memory leak in stream processing (#135)
- perf: optimized database queries (#132)

### Breaking Changes

- The deprecated v1 API has been removed
- Configuration format has changed - see migration guide`,
  isPrerelease: false,
  isLatest: true,
  authorUsername: 'jane-dev',
  downloadCount: 4523,
  assetCount: 3,
  publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
};

const ASSETS = [
  { name: 'veteran-v2.0.0-linux-x64.tar.gz', size: '12.5 MB', downloadCount: 2341 },
  { name: 'veteran-v2.0.0-macos-x64.tar.gz', size: '11.2 MB', downloadCount: 1567 },
  { name: 'veteran-v2.0.0-windows-x64.zip', size: '14.8 MB', downloadCount: 615 },
];

export function RepoReleaseDetail() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-text-primary">{MOCK_RELEASE.name}</h1>
              <span className="px-2 py-0.5 text-xs bg-success/20 text-success rounded font-medium">Latest</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Tag size={14} className="text-accent" />
              <code className="font-mono text-accent">{MOCK_RELEASE.tagName}</code>
              <span className="flex items-center gap-1"><User size={14} />{MOCK_RELEASE.authorUsername}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{formatRelativeTime(MOCK_RELEASE.publishedAt)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="border border-border rounded-lg bg-primary-dark p-6">
            <MarkdownRenderer content={MOCK_RELEASE.body} />
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg bg-surface p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Assets</h3>
              <div className="space-y-2">
                {ASSETS.map(asset => (
                  <div key={asset.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface/80 transition-colors cursor-pointer">
                    <Download size={14} className="text-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary font-mono truncate">{asset.name}</p>
                      <p className="text-2xs text-text-muted">{asset.size} · {formatCount(asset.downloadCount)} downloads</p>
                    </div>
                  </div>
                ))}
              </div>
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
