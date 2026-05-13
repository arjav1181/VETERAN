import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { GitFork, Star, Eye, GitBranch, Copy, Check, FileText, Folder, ChevronRight, ExternalLink, Globe, Book, Code, Shield, BarChart3, Package, Settings, Play, MessageSquare, Bug, GitPullRequest, Lock, ChevronDown, MoreHorizontal, Download } from 'lucide-react';

const REPO_TABS = [
  { id: 'code', label: 'Code', icon: Code, path: '' },
  { id: 'issues', label: 'Issues', icon: Bug, path: '/issues' },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/pulls' },
  { id: 'actions', label: 'Actions', icon: Play, path: '/actions' },
  { id: 'projects', label: 'Projects', icon: Book, path: '/projects' },
  { id: 'wiki', label: 'Wiki', icon: Book, path: '/wiki' },
  { id: 'security', label: 'Security', icon: Shield, path: '/security' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

function fileIcon(name: string, type: string) {
  if (type === 'dir') return <Folder size={16} className="text-info shrink-0" />;
  const ext = name.split('.').pop()?.toLowerCase();
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileText size={16} className="text-success shrink-0" />;
  if (['md', 'txt'].includes(ext || '')) return <FileText size={16} className="text-info shrink-0" />;
  if (['json', 'yaml', 'yml', 'toml'].includes(ext || '')) return <FileText size={16} className="text-warning shrink-0" />;
  if (['png', 'jpg', 'gif', 'svg', 'ico'].includes(ext || '')) return <FileText size={16} className="text-accent shrink-0" />;
  return <FileText size={16} className="text-text-muted shrink-0" />;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RepoCode() {
  const p = useParams<{ owner: string; name?: string; repo?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const owner = p.owner || pathParts[0] || '';
  const repoName = p.name || p.repo || pathParts[1] || '';
  const [currentBranch, setCurrentBranch] = useState('main');
  const [copied, setCopied] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const isActive = (path: string) => {
    const base = `/${owner}/${repoName}`;
    return location.pathname === base || location.pathname.startsWith(base + path);
  };

  const { data: repo, isLoading: repoLoading, error: repoError } = useQuery({
    queryKey: ['repo', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}`),
    enabled: !!owner && !!repoName,
  });

  const { data: contents, isLoading: contentsLoading } = useQuery({
    queryKey: ['contents', owner, repoName, currentPath, currentBranch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/contents/${currentPath}`, { params: { ref: currentBranch } }),
    enabled: !!owner && !!repoName,
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/branches`),
    enabled: !!owner && !!repoName,
  });

  const { data: readmeData } = useQuery({
    queryKey: ['readme', owner, repoName, currentBranch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/readme`, { params: { ref: currentBranch } }),
    enabled: !!owner && !!repoName,
  });

  const r = repo as any;
  const files = Array.isArray(contents) ? contents : [];
  const branches = Array.isArray(branchesData) ? branchesData : [];
  const readmeContent = readmeData && (readmeData as any).content ? (() => { try { return atob((readmeData as any).content); } catch { return (readmeData as any).content; } })() : null;

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${owner}/${repoName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!owner || !repoName) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid URL</h2>
          <p className="text-text-secondary text-sm">Expected: /owner/repository-name</p>
          <Link to="/" className="text-accent hover:underline text-sm mt-4 inline-block">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (repoLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="h-8 w-64 bg-surface rounded animate-pulse" />
            <div className="h-4 w-96 bg-surface rounded animate-pulse" />
            <div className="flex gap-6">
              {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-8 w-20 bg-surface rounded animate-pulse" />)}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-2">{[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-6 bg-surface rounded animate-pulse" />)}</div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-surface rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (repoError) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Repository not found</h2>
          <p className="text-text-secondary text-sm mb-1"><span className="font-mono text-accent">{owner}/{repoName}</span></p>
          <p className="text-text-muted text-xs mb-4">The repository may be private or does not exist.</p>
          <Link to="/" className="text-accent hover:underline text-sm">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Repository Header */}
      <div className="border-b border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Link to={`/${owner}`} className="text-sm text-accent hover:underline">{owner}</Link>
            <span className="text-text-muted text-sm">/</span>
            <span className="text-sm font-semibold text-text-primary">{repoName}</span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full border',
              r?.isPrivate ? 'border-danger/30 text-danger bg-danger/5' : 'border-success/30 text-success bg-success/5'
            )}>
              {r?.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
            <button onClick={copyUrl} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors">
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Clone'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors">
              <Star size={14} /> Star <span className="text-text-muted">{r?.starsCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors">
              <GitFork size={14} /> Fork <span className="text-text-muted">{r?.forksCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors">
              <Eye size={14} /> Watch
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-4 overflow-x-auto">
            {REPO_TABS.map(tab => (
              <Link
                key={tab.id}
                to={`/${owner}/${repoName}${tab.path}`}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive(tab.path) ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* File Tree Sidebar */}
          <div>
            {/* Branch selector */}
            <div className="mb-3">
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-text-primary bg-surface border border-border rounded-md hover:bg-surface/80 transition-colors">
                <GitBranch size={14} />
                <span className="flex-1 text-left truncate">{currentBranch}</span>
                <ChevronDown size={14} className="text-text-muted" />
              </button>
            </div>

            {/* File tree */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-surface/50 border-b border-border text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Code size={14} />
                Files
              </div>
              {contentsLoading ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-5 w-full bg-surface rounded animate-pulse" />)}
                </div>
              ) : files.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-3xl mb-2">📂</div>
                  <p className="text-xs text-text-secondary">No files in this directory</p>
                </div>
              ) : (
                <div className="divide-y divide-border text-xs">
                  {currentPath && (
                    <div
                      onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-surface/80 cursor-pointer text-accent"
                    >
                      <Folder size={14} />
                      <span>..</span>
                    </div>
                  )}
                  {files.map((item: any) => (
                    <div
                      key={item.name || item.path}
                      onClick={() => {
                        if (item.type === 'dir') {
                          setCurrentPath(currentPath ? `${currentPath}/${item.name}` : item.name);
                          setSelectedFile(null);
                        } else {
                          const path = currentPath ? `${currentPath}/${item.name}` : item.name;
                          setSelectedFile(path);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 hover:bg-surface/80 cursor-pointer',
                        selectedFile === (currentPath ? `${currentPath}/${item.name}` : item.name) && 'bg-accent/5'
                      )}
                    >
                      {fileIcon(item.name, item.type)}
                      <span className="flex-1 truncate text-text-primary">{item.name}</span>
                      <span className="text-text-muted shrink-0">{item.type !== 'dir' && formatSize(item.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main panel */}
          <div className="space-y-4">
            {/* Last commit bar */}
            <div className="flex items-center gap-3 px-4 py-2 bg-surface/50 border border-border rounded-lg text-xs">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-bold shrink-0">V</div>
                <span className="text-text-secondary truncate">{'View repository files'}</span>
              </div>
              <span className="text-text-muted shrink-0">{r?.defaultBranch || 'main'}</span>
            </div>

            {/* File viewer or empty state */}
            {selectedFile ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-border text-xs font-medium text-text-secondary">
                  <FileText size={14} />
                  <span>{selectedFile.split('/').pop()}</span>
                  <span className="text-text-muted ml-auto">{formatSize(0)}</span>
                </div>
                <div className="p-4 text-sm text-text-secondary">
                  File viewer loading...
                </div>
              </div>
            ) : (
              <>
                {/* Files as table */}
                {files.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="divide-y divide-border text-sm">
                      {files.map((item: any, idx: number) => (
                        <div
                          key={item.name || idx}
                          onClick={() => {
                            if (item.type === 'dir') {
                              setCurrentPath(item.name);
                              setSelectedFile(null);
                            } else {
                              setSelectedFile(item.name);
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface/40 cursor-pointer"
                        >
                          {fileIcon(item.name, item.type)}
                          <span className="flex-1 text-text-primary font-medium">{item.name}</span>
                          <span className="text-text-muted text-xs">{formatSize(item.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* README */}
                {readmeContent ? (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-border text-xs font-medium text-text-secondary">
                      <Book size={14} />
                      README.md
                    </div>
                    <div className="p-6 text-sm">
                      <MarkdownRenderer content={readmeContent} />
                    </div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="border border-border rounded-lg p-12 text-center">
                    <div className="text-5xl mb-4">📖</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Let's start building!</h3>
                    <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                      This repository is empty. Create a new file or push an existing repository to get started.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <code className="px-4 py-2 bg-surface rounded-lg text-xs font-mono text-accent border border-border">
                        git remote add origin https://veteran.dev/{owner}/{repoName}.git
                      </code>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
