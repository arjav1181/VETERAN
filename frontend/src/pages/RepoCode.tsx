import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { getRepoParams } from '@lib/route-utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, GitFork, Star, Eye, GitBranch, Copy, Check, FileText, Folder,
  ChevronDown, Book, Shield, BarChart3, Package, Settings, Play,
  Bug, GitPullRequest, Lock, Globe, Download, ExternalLink, Clock,
  Tag, Users, MoreHorizontal, Search, Plus, X, AlertCircle, ChevronRight
} from 'lucide-react';

// ─── Spec: Repo tabs ───
const REPO_TABS = [
  { id: 'code', label: 'Code', icon: Code, path: '' },
  { id: 'issues', label: 'Issues', icon: Bug, path: '/issues', countKey: 'openIssuesCount' },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/pulls', countKey: 'openPrCount' },
  { id: 'actions', label: 'Actions', icon: Play, path: '/actions' },
  { id: 'projects', label: 'Projects', icon: Book, path: '/projects' },
  { id: 'wiki', label: 'Wiki', icon: Book, path: '/wiki' },
  { id: 'security', label: 'Security', icon: Shield, path: '/security' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/packages' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

// ─── Spec: File icons ───
const FILE_ICONS: Record<string, string> = {
  ts: '🔵', tsx: '⚛️', js: '🟡', jsx: '⚛️', py: '🐍', rs: '🦀', go: '🔷', rb: '💎',
  md: '📝', json: '📋', yml: '⚙️', yaml: '⚙️', toml: '⚙️', css: '🎨', scss: '🎨',
  html: '🌐', svg: '🖼️', png: '🖼️', jpg: '🖼️', gif: '🖼️', webp: '🖼️', ico: '🖼️',
  lock: '🔒', gitignore: '🙈', dockerfile: '🐳', sh: '💻', bash: '💻', zsh: '💻',
  pdf: '📄', txt: '📄', csv: '📊', xlsx: '📊', doc: '📝', zip: '🗜️', tar: '🗜️',
  vue: '💚', svelte: '🧡', astro: '🧡', prisma: '🌊', graphql: '◈', gql: '◈',
};

function icon(name: string, type: string) {
  if (type === 'dir') return '📁';
  return FILE_ICONS[name.split('.').pop()?.toLowerCase() || ''] || '📄';
}

function timeAgo(dateStr: string): string {
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
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function cloneUrl(owner: string, repo: string) {
  return `${window.location.origin}/${owner}/${repo}.git`;
}

// ─── Spec: CopyButton micro-interaction ───
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded hover:bg-surface-3 transition-colors">
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={14} className="text-success" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy size={14} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Spec: Star button with animation ───
function StarButton({ count, starred: initial }: { count: number; starred?: boolean }) {
  const [starred, setStarred] = useState(initial || false);
  return (
    <motion.button whileTap={{ scale: 0.95 }}
      onClick={() => setStarred(!starred)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150',
        starred
          ? 'border-accent-gold/50 bg-accent-gold-muted text-accent-gold'
          : 'border-[#30363D] bg-surface-3 hover:bg-[#30363D] text-text-primary'
      )}>
      <motion.span animate={{ rotate: starred ? [0, 20, 0] : 0, scale: starred ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
        <Star size={14} className={starred ? 'fill-accent-gold' : ''} />
      </motion.span>
      {starred ? 'Starred' : 'Star'}
      <span className="text-text-secondary">{count}</span>
    </motion.button>
  );
}

// ─── Spec: Clone dropdown ───
function CloneDropdown({ owner, repo }: { owner: string; repo: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#30363D] bg-surface-3 hover:bg-[#30363D] text-text-primary transition-colors">
        <Code size={14} /> Code <ChevronDown size={12} className="text-text-secondary" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute top-full mt-1 left-0 w-80 bg-[#161B22] border border-[#30363D] rounded-lg shadow-lg z-50 p-3">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Clone</div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-xs font-mono">
                <span className="text-accent-blue shrink-0">HTTPS</span>
                <span className="flex-1 truncate mx-2 text-text-primary">{cloneUrl(owner, repo)}</span>
                <CopyButton text={cloneUrl(owner, repo)} />
              </div>
              <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-xs font-mono">
                <span className="text-accent-blue shrink-0">SSH</span>
                <span className="flex-1 truncate mx-2 text-text-primary">git@{window.location.hostname}:{owner}/{repo}.git</span>
                <CopyButton text={`git@${window.location.hostname}:${owner}/${repo}.git`} />
              </div>
            </div>
            <div className="border-t border-[#30363D] pt-2 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded cursor-pointer transition-colors">
                <Download size={14} /> Download ZIP
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded cursor-pointer transition-colors">
                <Download size={14} /> Download TAR.GZ
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Spec: File tree row ───
function FileRow({ item, depth, onOpen }: { item: any; depth: number; onOpen: (path: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isDir = item.type === 'dir';

  return (
    <>
      <div onClick={() => { if (isDir) setExpanded(!expanded); onOpen(item.name); }}
        className="flex items-center gap-2 px-4 py-1.5 text-xs hover:bg-surface-1 cursor-pointer border-b border-[#30363D]/50 group">
        <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
          {isDir ? <ChevronRight size={12} className="text-text-disabled" /> : <span className="w-3" />}
        </motion.span>
        <span className="text-sm shrink-0">{icon(item.name, item.type)}</span>
        <span className="font-medium text-text-primary">{item.name}</span>
        <span className="flex-1 text-text-disabled truncate mx-4 opacity-0 group-hover:opacity-100 transition-opacity">Latest commit message</span>
        <span className="text-text-disabled shrink-0">{timeAgo(item.lastCommit?.timestamp || item.updatedAt)}</span>
      </div>
      <AnimatePresence>
        {isDir && expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            {item.children?.map((child: any) => <FileRow key={child.name} item={child} depth={depth + 1} onOpen={onOpen} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Spec: Main RepoCode ───
export function RepoCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { owner, repo: repoName } = getRepoParams();
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showClone, setShowClone] = useState(false);

  const baseUrl = `/${owner}/${repoName}`;
  const activeTab = REPO_TABS.find(t => t.path === '' ? location.pathname === baseUrl : location.pathname.startsWith(baseUrl + t.path));

  const { data: repo, isLoading, error } = useQuery({
    queryKey: ['repo', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}`),
    enabled: !!owner && !!repoName,
  });

  const { data: contents } = useQuery({
    queryKey: ['contents', owner, repoName, path, branch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/contents/${path}`, { params: { ref: branch } }),
    enabled: !!owner && !!repoName,
  });

  const { data: branches } = useQuery({
    queryKey: ['branches', owner, repoName],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/branches`),
    enabled: !!owner && !!repoName,
  });

  const { data: readme } = useQuery({
    queryKey: ['readme', owner, repoName, branch],
    queryFn: () => api.get(`/repos/${owner}/${repoName}/readme`, { params: { ref: branch } }),
    enabled: !!owner && !!repoName,
  });

  const r = repo as any;
  const files = Array.isArray(contents) ? contents as any[] : [];
  const branchList = Array.isArray(branches) ? branches as any[] : [];
  const readmeText = useMemo(() => {
    if (!readme || !(readme as any).content) return null;
    try { return atob((readme as any).content); } catch { return (readme as any).content; }
  }, [readme]);

  if (!owner || !repoName) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-text-disabled mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid URL</h2>
          <p className="text-sm text-text-secondary">Expected: /owner/repository-name</p>
          <Link to="/" className="text-accent-blue hover:underline text-sm mt-4 inline-block">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="border-b border-[#30363D]">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="skeleton h-6 w-64" />
            <div className="flex gap-6">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-8 w-20" />)}</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <div className="w-[280px] space-y-2">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="skeleton h-5" />)}</div>
          <div className="flex-1 space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-4" style={{ width: `${50 + Math.random() * 50}%` }} />)}</div>
        </div>
      </div>
    );
  }

  if (error || !r) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Repository not found</h2>
          <p className="text-sm text-text-secondary mb-1 font-mono text-accent-gold">{owner}/{repoName}</p>
          <p className="text-xs text-text-disabled mb-6">The repository may be private or does not exist.</p>
          <Link to="/" className="text-accent-blue hover:underline text-sm">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* ═══ Spec: Repo header above tabs ═══ */}
      <div className="border-b border-[#30363D] bg-[#161B22]/80">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center flex-wrap gap-1.5 mb-3">
            <Link to={`/${owner}`} className="text-sm text-accent-blue hover:underline font-medium">{owner}</Link>
            <span className="text-text-disabled">/</span>
            <span className="text-sm font-semibold text-text-primary">{repoName}</span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full border',
              r?.isPrivate ? 'border-danger/30 text-danger bg-danger-muted' : 'border-success/30 text-success bg-success-muted'
            )}>{r?.isPrivate ? 'Private' : 'Public'}</span>
            {r?.isFork && <span className="text-xs text-text-secondary">forked from <Link to="#" className="text-accent-blue hover:underline">upstream/repo</Link></span>}
          </div>

          {/* Action buttons row - Spec: Star N▼ Watch N▼ Fork N */}
          <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
            <CloneDropdown owner={owner} repo={repoName} />
            <StarButton count={r?.starsCount || 0} />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363D] bg-surface-3 hover:bg-[#30363D] text-text-primary transition-colors">
              <Eye size={14} /> Watch <span className="text-text-secondary">{r?.watchersCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363D] bg-surface-3 hover:bg-[#30363D] text-text-primary transition-colors">
              <GitFork size={14} /> Fork <span className="text-text-secondary">{r?.forksCount || 0}</span>
            </button>
          </div>

          {/* Spec: Tabs - underline style, active=gold underline */}
          <div className="flex gap-0 -mb-4 overflow-x-auto">
            {REPO_TABS.map(tab => {
              const active = tab.path === '' ? location.pathname === baseUrl : location.pathname.startsWith(baseUrl + tab.path);
              return (
                <Link key={tab.id} to={`${baseUrl}${tab.path}`}
                  className={cn(
                    'tab-underline flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors',
                    active ? 'active text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  )}>
                  <tab.icon size={14} />
                  {tab.label}
                  {(tab.countKey && (r as any)?.[tab.countKey] > 0) && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-surface-2 text-text-secondary">{(r as any)?.[tab.countKey]}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Spec: Code Tab content ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left: File tree + README */}
          <div className="flex-1 min-w-0">
            {/* Spec: Branch selector + commit info banner */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-surface-3 border border-[#30363D] rounded-md hover:bg-[#30363D] transition-colors">
                  <GitBranch size={14} /> <span>{branch}</span> <ChevronDown size={12} className="text-text-secondary" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary flex-1 min-w-0">
                <div className="w-5 h-5 rounded-full bg-accent-gold-muted flex items-center justify-center text-[10px] text-accent-gold font-bold shrink-0">V</div>
                <span className="truncate">Latest commit to <span className="font-medium text-text-primary">{branch}</span></span>
              </div>
              <Link to={`${baseUrl}/branches`} className="text-xs text-text-secondary hover:text-accent-blue shrink-0">{branchList.length} branches</Link>
            </div>

            {/* Spec: File tree */}
            <div className="card overflow-hidden mb-6">
              <div className="bg-surface-1 border-b border-[#30363D]">
                {files.length === 0 ? (
                  <div className="px-8 py-12 text-center">
                    <div className="text-5xl mb-4">📂</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">This repository is empty</h3>
                    <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">Create a new file or push an existing repository to get started.</p>
                    <code className="px-4 py-2 bg-[#0D1117] rounded-lg text-xs font-mono text-accent-gold border border-[#30363D]">
                      git remote add origin {cloneUrl(owner, repoName)}
                    </code>
                  </div>
                ) : (
                  <>
                    {path && (
                      <div onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs text-accent-blue hover:bg-surface-2 cursor-pointer border-b border-[#30363D]">
                        <Folder size={14} /> ..
                      </div>
                    )}
                    {files.map((item: any) => (
                      <FileRow key={item.name} item={item} depth={0} onOpen={(name) => {
                        if (item.type === 'dir') setPath(name);
                        else setSelectedFile(name);
                      }} />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Spec: README section */}
            {readmeText && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-1 border-b border-[#30363D] text-xs font-medium text-text-secondary">
                  <Book size={14} /> README.md
                </div>
                <div className="p-6 text-sm leading-relaxed">
                  <MarkdownRenderer content={readmeText} />
                </div>
              </div>
            )}
          </div>

          {/* ═══ Spec: About sidebar (right, visible on xl) ═══ */}
          <div className="w-[280px] hidden xl:block shrink-0">
            <div className="text-sm space-y-4">
              {r?.description && <p className="text-text-secondary leading-relaxed">{r.description}</p>}
              {r?.homepageUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <ExternalLink size={14} className="text-text-disabled" />
                  <a href={r.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">{r.homepageUrl}</a>
                </div>
              )}

              {/* Topics - colored tag chips */}
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(r?.topics) ? r.topics : typeof r?.topics === 'string' ? JSON.parse(r.topics || '[]') : []).map((topic: string) => (
                  <Link key={topic} to={`/explore/topics/${topic}`}
                    className="px-2 py-0.5 text-xs rounded-full bg-accent-blue-muted text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20 transition-colors">
                    {topic}
                  </Link>
                ))}
              </div>

              {/* Stats - Spec: ⭐ N stars / 👁 N watching / ⋲ N forks */}
              <div className="space-y-2 text-xs text-text-secondary border-t border-[#30363D] pt-4">
                <div className="flex items-center gap-2"><Star size={14} className="text-text-disabled" /> <strong className="text-text-primary">{r?.starsCount || 0}</strong> stars</div>
                <div className="flex items-center gap-2"><Eye size={14} className="text-text-disabled" /> <strong className="text-text-primary">{r?.watchersCount || 0}</strong> watching</div>
                <div className="flex items-center gap-2"><GitFork size={14} className="text-text-disabled" /> <strong className="text-text-primary">{r?.forksCount || 0}</strong> forks</div>
              </div>

              {/* Spec: Language breakdown / License / Updated */}
              <div className="border-t border-[#30363D] pt-4 space-y-2 text-xs text-text-secondary">
                {r?.language && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E8B84B' }} />
                    <span>{r.language}</span>
                  </div>
                )}
                {r?.license && <div className="flex items-center gap-2"><Book size={14} className="text-text-disabled" /> {r.license}</div>}
                <div className="flex items-center gap-2"><Clock size={14} className="text-text-disabled" /> Last updated {timeAgo(r?.updatedAt)}</div>
              </div>

              {/* Contributors / Releases placeholders */}
              <div className="border-t border-[#30363D] pt-4 space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2 text-text-disabled"><Users size={14} /> No contributors yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
