import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '40px', color: '#E6EDF3', background: '#0A0C10', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', color: '#F85149', marginBottom: '16px' }}>Something went wrong</h1>
      <pre style={{ background: '#13161E', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '13px' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
      <Link to="/" style={{ color: '#E8B84B' }}>Go to Dashboard</Link>
    </div>
  );
}

export function RepoCode() {
  const params = useParams<{ owner: string; name: string }>();
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const owner = params.owner || pathParts[0] || '';
  const repoName = params.name || pathParts[1] || '';

  const { data: repo, isLoading, error } = useQuery({
    queryKey: ['repo', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}`),
    enabled: !!owner && !!repoName,
  });

  const { data: contents } = useQuery({
    queryKey: ['contents', owner, repoName, ''],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/contents/`),
    enabled: !!owner && !!repoName,
  });

  const { data: readme } = useQuery({
    queryKey: ['readme', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/readme`),
    enabled: !!owner && !!repoName,
  });

  const readmeContent = readme && (readme as any).content ? (() => { try { return atob((readme as any).content); } catch { return (readme as any).content; } })() : null;
  const repoData = repo as any;
  const contentsList = Array.isArray(contents) ? contents : [];

  if (!owner || !repoName) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <div className="text-5xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid repository URL</h2>
          <p className="text-sm text-text-muted mb-4">Expected format: /owner/repository-name</p>
          <Link to="/" className="text-accent hover:underline text-sm">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center text-text-secondary">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Repository not found</h2>
          <p className="text-sm mb-1">Failed to load <span className="font-mono text-accent">{owner}/{repoName}</span></p>
          <p className="text-xs text-text-muted mb-4">{String(error).slice(0, 200)}</p>
          <Link to="/" className="text-accent hover:underline text-sm">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Repo header */}
      <div className="border-b border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-text-primary">{owner}</span>
            <span className="text-text-muted">/</span>
            <span className="text-2xl font-bold text-text-primary">{repoName}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${repoData?.isPrivate ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
              {repoData?.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>
          {repoData?.description && (
            <p className="text-sm text-text-secondary mb-3">{repoData.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>⭐ {repoData?.starsCount || 0} stars</span>
            <span>⑂ {repoData?.forksCount || 0} forks</span>
            {repoData?.language && <span>🔵 {repoData.language}</span>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-5 bg-surface rounded animate-pulse" style={{ width: `${60 + i * 5}%` }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* File list */}
            <div className="border border-border rounded-lg bg-surface">
              <div className="px-3 py-2 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Files
              </div>
              {contentsList.length === 0 ? (
                <div className="px-3 py-8 text-center text-text-muted text-sm">
                  <p className="mb-2">This repository is empty</p>
                  <p className="text-xs">Create a new file to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-border text-sm">
                  {contentsList.map((item: any) => (
                    <div key={item.name || item.path} className="px-3 py-2 hover:bg-surface/80 flex items-center gap-2 cursor-pointer">
                      <span>{item.type === 'dir' ? '📁' : '📄'}</span>
                      <span className="text-text-primary">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* README */}
            <div>
              {readmeContent ? (
                <div className="border border-border rounded-lg bg-surface p-6">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">README.md</div>
                  <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-mono">
                    {readmeContent}
                  </div>
                </div>
              ) : (
                <div className="border border-border rounded-lg bg-surface p-8 text-center">
                  <div className="text-4xl mb-3">📖</div>
                  <p className="text-text-secondary text-sm">No README file</p>
                  <p className="text-text-muted text-xs mt-1">Add a README to describe your project</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
