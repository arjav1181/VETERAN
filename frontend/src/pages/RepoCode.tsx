import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { getRepoParams } from '@lib/route-utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { GitFork, Star, Eye, GitBranch, Copy, Check, FileText, Folder, ChevronDown, Book, Code, Shield, BarChart3, Package, Settings, Play, Bug, GitPullRequest, Lock, Globe, Download, ExternalLink, Clock, Tag, Users, MoreHorizontal } from 'lucide-react';

const REPO_TABS = [
  { id: 'code', label: 'Code', icon: Code, path: '' },
  { id: 'issues', label: 'Issues', icon: Bug, path: '/issues' },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/pulls' },
  { id: 'actions', label: 'Actions', icon: Play, path: '/actions' },
  { id: 'projects', label: 'Projects', icon: Book, path: '/projects' },
  { id: 'wiki', label: 'Wiki', icon: Book, path: '/wiki' },
  { id: 'security', label: 'Security', icon: Shield, path: '/security' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/packages' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const FILE_ICONS: Record<string, string> = {
  ts: '🔵', tsx: '⚛️', js: '🟡', jsx: '⚛️', py: '🐍', rs: '🦀', go: '🔷',
  md: '📝', json: '📋', yml: '⚙️', yaml: '⚙️', toml: '⚙️', css: '🎨', scss: '🎨',
  html: '🌐', svg: '🖼️', png: '🖼️', jpg: '🖼️', gif: '🖼️', ico: '🖼️',
  lock: '🔒', gitignore: '🙈', dockerfile: '🐳', sh: '💻', bash: '💻',
};

function fileIcon(name: string, type: string): string {
  if (type === 'dir') return '📁';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || '📄';
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function cloneUrl(owner: string, repo: string): string {
  return `${window.location.origin}/${owner}/${repo}.git`;
}

export function RepoCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { owner, repo: repoName } = getRepoParams();
  const [currentBranch, setCurrentBranch] = useState('main');
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showClone, setShowClone] = useState(false);
  const [cloneCopied, setCloneCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const baseUrl = `/${owner}/${repoName}`;
  const isActive = useCallback((path: string) => {
    return location.pathname === baseUrl || location.pathname.startsWith(baseUrl + path);
  }, [location.pathname, baseUrl]);

  const { data: repo, isLoading } = useQuery({
    queryKey: ['repo', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}`),
    enabled: !!owner && !!repoName,
  });

  const { data: contents } = useQuery({
    queryKey: ['contents', owner, repoName, currentPath, currentBranch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/contents/${currentPath}`, { params: { ref: currentBranch } }),
    enabled: !!owner && !!repoName,
  });

  const { data: branches } = useQuery({
    queryKey: ['branches', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/branches`),
    enabled: !!owner && !!repoName,
  });

  const { data: readme } = useQuery({
    queryKey: ['readme', owner, repoName, currentBranch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/readme`, { params: { ref: currentBranch } }),
    enabled: !!owner && !!repoName,
  });

  const r = repo as any;
  const files = Array.isArray(contents) ? contents : [];
  const branchList = Array.isArray(branches) ? branches : [];
  const readmeText = useMemo(() => {
    if (readme && (readme as any).content) {
      try { return atob((readme as any).content); } catch { return (readme as any).content; }
    }
    return null;
  }, [readme]);

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneUrl(owner, repoName));
    setCloneCopied(true);
    setTimeout(() => setCloneCopied(false), 2000);
  };

  if (!owner || !repoName) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-[#E6EDF3] mb-2">Invalid URL</h2>
          <p className="text-sm text-[#8D96A0]">Expected: /owner/repository-name</p>
          <Link to="/" className="text-[#4493F8] hover:underline text-sm mt-4 inline-block">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="border-b border-[#30363D]">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="h-6 w-64 bg-[#1C2128] rounded animate-pulse" />
            <div className="flex gap-6">
              {REPO_TABS.map((_, i) => <div key={i} className="h-8 w-20 bg-[#1C2128] rounded animate-pulse" />)}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <div className="w-[280px] space-y-2">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-5 bg-[#1C2128] rounded animate-pulse" />)}
          </div>
          <div className="flex-1 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-[#1C2128] rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#E6EDF3] mb-2">Repository not found</h2>
          <p className="text-sm text-[#8D96A0] mb-1 font-mono">{owner}/{repoName}</p>
          <p className="text-xs text-[#484F58] mb-4">The repository may be private or does not exist.</p>
          <Link to="/" className="text-[#4493F8] hover:underline text-sm">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Repo Header */}
      <div className="border-b border-[#30363D] bg-[#161B22]/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Link to={`/${owner}`} className="text-sm text-[#4493F8] hover:underline">{owner}</Link>
            <span className="text-[#484F58]">/</span>
            <span className="text-sm font-semibold text-[#E6EDF3]">{repoName}</span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full border',
              r?.isPrivate ? 'border-[#F85149]/30 text-[#F85149] bg-[#F85149]/5' : 'border-[#3FB950]/30 text-[#3FB950] bg-[#3FB950]/5'
            )}>
              {r?.isPrivate ? 'Private' : 'Public'}
            </span>
            {r?.isFork && <span className="text-xs text-[#8D96A0]">Forked from <Link to={`/${r.parent?.fullName || '#'}`} className="text-[#4493F8] hover:underline">upstream/repo</Link></span>}
          </div>

          <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
            {/* Clone button */}
            <div className="relative">
              <button onClick={() => setShowClone(!showClone)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] transition-colors">
                <Code size={14} /> Code <ChevronDown size={12} />
              </button>
              {showClone && (
                <div className="absolute top-full mt-1 left-0 w-72 bg-[#161B22] border border-[#30363D] rounded-lg shadow-lg z-50 p-3">
                  <div className="text-xs font-semibold text-[#8D96A0] uppercase mb-2">Clone</div>
                  <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded px-2 py-1.5 text-xs font-mono text-[#E6EDF3] mb-2">
                    <span className="flex-1 truncate">HTTPS</span>
                    <span className="truncate">{cloneUrl(owner, repoName)}</span>
                    <button onClick={handleCopyClone} className="p-1 hover:text-[#4493F8]">
                      {cloneCopied ? <Check size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-xs text-[#8D96A0] space-y-1">
                    <div className="flex items-center gap-2 hover:text-[#E6EDF3] cursor-pointer"><Download size={14} /> Download ZIP</div>
                    <div className="flex items-center gap-2 hover:text-[#E6EDF3] cursor-pointer"><Download size={14} /> Download TAR.GZ</div>
                  </div>
                </div>
              )}
            </div>

            {/* Star */}
            <button onClick={() => setStarred(!starred)} className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors',
              starred ? 'border-[#E8B84B]/50 bg-[#E8B84B]/10 text-[#E8B84B]' : 'border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3]'
            )}>
              <Star size={14} className={starred ? 'fill-[#E8B84B]' : ''} />
              {starred ? 'Starred' : 'Star'}
              <span className="text-[#8D96A0]">{r?.starsCount || 0}</span>
            </button>

            {/* Fork */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] transition-colors">
              <GitFork size={14} /> Fork <span className="text-[#8D96A0]">{r?.forksCount || 0}</span>
            </button>

            {/* Watch */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] transition-colors">
              <Eye size={14} /> Watch
            </button>

            {/* More */}
            <div className="relative">
              <button onClick={() => setShowMore(!showMore)} className="p-1.5 rounded-md border border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-4 overflow-x-auto">
            {REPO_TABS.map(tab => {
              const active = tab.path === '' ? location.pathname === baseUrl : location.pathname.startsWith(baseUrl + tab.path);
              return (
                <Link
                  key={tab.id}
                  to={`${baseUrl}${tab.path}`}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                    active ? 'border-[#E8B84B] text-[#E6EDF3]' : 'border-transparent text-[#8D96A0] hover:text-[#E6EDF3] hover:border-[#30363D]'
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.id === 'issues' && r?.openIssuesCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#21262D] text-[#8D96A0]">{r.openIssuesCount}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left: File tree + content */}
          <div className="flex-1 min-w-0">
            {/* Branch selector + commit info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#E6EDF3] bg-[#21262D] border border-[#30363D] rounded-md hover:bg-[#30363D] transition-colors">
                  <GitBranch size={14} />
                  <span>{currentBranch}</span>
                  <ChevronDown size={12} className="text-[#8D96A0]" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8D96A0] flex-1 min-w-0">
                <div className="w-5 h-5 rounded-full bg-[#E8B84B]/20 flex items-center justify-center text-[10px] text-[#E8B84B] shrink-0">V</div>
                <span className="truncate">Latest commit to {currentBranch}</span>
              </div>
              <Link to={`${baseUrl}/branches`} className="text-xs text-[#8D96A0] hover:text-[#4493F8] shrink-0">{branchList.length} branches</Link>
            </div>

            {/* File tree or selected file */}
            {selectedFile ? (
              <div className="border border-[#30363D] rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border-b border-[#30363D] text-xs">
                  <span className="text-[#8D96A0] cursor-pointer hover:text-[#4493F8]" onClick={() => setSelectedFile(null)}>{repoName}</span>
                  <span className="text-[#484F58]">/</span>
                  {selectedFile.split('/').map((part, i, arr) => (
                    <span key={i}>
                      <span className={cn(i === arr.length - 1 ? 'text-[#E6EDF3] font-medium' : 'text-[#8D96A0] cursor-pointer hover:text-[#4493F8]')}>{part}</span>
                      {i < arr.length - 1 && <span className="text-[#484F58] mx-1">/</span>}
                    </span>
                  ))}
                  <div className="ml-auto flex gap-1">
                    <button className="px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded hover:bg-[#21262D]">Raw</button>
                    <button className="px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded hover:bg-[#21262D]">Blame</button>
                    <button className="px-2 py-1 text-xs text-[#8D96A0] hover:text-[#E6EDF3] rounded hover:bg-[#21262D]">History</button>
                  </div>
                </div>
                <div className="p-4 text-sm text-[#8D96A0] font-mono">
                  <div className="flex items-center justify-center h-32 text-[#484F58]">File content loading...</div>
                </div>
              </div>
            ) : (
              <>
                {/* File tree */}
                <div className="border border-[#30363D] rounded-lg overflow-hidden mb-6">
                  <div className="bg-[#161B22] border-b border-[#30363D]">
                    {currentPath && (
                      <div onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))} className="flex items-center gap-2 px-4 py-2 text-xs text-[#4493F8] hover:bg-[#1C2128] cursor-pointer border-b border-[#30363D]">
                        <Folder size={14} /> ..
                      </div>
                    )}
                    {files.map((item: any, i: number) => (
                      <div
                        key={item.name || i}
                        onClick={() => {
                          if (item.type === 'dir') {
                            setCurrentPath(item.name);
                          } else {
                            setSelectedFile(item.name);
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-xs hover:bg-[#1C2128] cursor-pointer border-b border-[#30363D] last:border-0"
                      >
                        <span className="text-sm">{fileIcon(item.name, item.type)}</span>
                        <span className="font-medium text-[#E6EDF3]">{item.name}</span>
                        <span className="flex-1 text-[#484F58] truncate ml-4">Latest commit message here</span>
                        <span className="text-[#484F58] shrink-0">{formatTime(item.lastCommit?.timestamp || item.updatedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* README */}
                {readmeText && (
                  <div className="border border-[#30363D] rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border-b border-[#30363D] text-xs font-medium text-[#8D96A0]">
                      <Book size={14} /> README.md
                    </div>
                    <div className="p-6 text-sm">
                      <MarkdownRenderer content={readmeText} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: About sidebar */}
          <div className="w-[280px] hidden xl:block shrink-0">
            <div className="text-sm space-y-4">
              {r?.description && (
                <p className="text-[#8D96A0] leading-relaxed">{r.description}</p>
              )}

              {r?.homepageUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <ExternalLink size={14} className="text-[#484F58]" />
                  <a href={r.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-[#4493F8] hover:underline">{r.homepageUrl}</a>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(r?.topics) ? r.topics : typeof r?.topics === 'string' ? JSON.parse(r.topics || '[]') : []).map((topic: string) => (
                  <Link key={topic} to={`/explore/topics/${topic}`} className="px-2 py-0.5 text-xs rounded-full bg-[#1F6FEB]/10 text-[#4493F8] border border-[#1F6FEB]/20 hover:bg-[#1F6FEB]/20 transition-colors">{topic}</Link>
                ))}
              </div>

              <div className="space-y-2 text-xs text-[#8D96A0]">
                <div className="flex items-center gap-2"><Star size={14} className="text-[#484F58]" /> <strong className="text-[#E6EDF3]">{r?.starsCount || 0}</strong> stars</div>
                <div className="flex items-center gap-2"><Eye size={14} className="text-[#484F58]" /> <strong className="text-[#E6EDF3]">{r?.watchersCount || 0}</strong> watching</div>
                <div className="flex items-center gap-2"><GitFork size={14} className="text-[#484F58]" /> <strong className="text-[#E6EDF3]">{r?.forksCount || 0}</strong> forks</div>
              </div>

              <div className="border-t border-[#30363D] pt-4 space-y-2 text-xs text-[#8D96A0]">
                {r?.license && <div className="flex items-center gap-2"><Book size={14} className="text-[#484F58]" /> {r.license}</div>}
                {r?.language && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#E8B84B]" />
                    <span>{r.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-2"><Clock size={14} className="text-[#484F58]" /> Last updated {formatTime(r?.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
