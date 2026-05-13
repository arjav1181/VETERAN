import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Star, GitFork, Eye, Lock, Globe, Shield, Heart, Copy, Check,
  Book, Code, CircleDot, GitPullRequest, Play, SquareKanban, BookOpen,
  MessageSquare, ShieldCheck, BarChart3, Package, Settings, ChevronDown,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import type { Repository } from '@/types';

interface RepoHeaderProps {
  repo: Repository;
  owner: string;
  name: string;
  starCount: number;
  forkCount: number;
  watchCount: number;
  isStarred?: boolean;
  onStar?: () => void;
  onFork?: () => void;
  onWatch?: () => void;
  className?: string;
}

const TABS = [
  { id: 'code', label: 'Code', icon: Code, path: '' },
  { id: 'issues', label: 'Issues', icon: CircleDot, path: '/issues' },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/pulls' },
  { id: 'actions', label: 'Actions', icon: Play, path: '/actions' },
  { id: 'projects', label: 'Projects', icon: SquareKanban, path: '/projects' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, path: '/wiki' },
  { id: 'security', label: 'Security', icon: ShieldCheck, path: '/security' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/packages' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
] as const;

function CloneDialog({ repo, owner, name, onClose }: {
  repo: Repository; owner: string; name: string; onClose: () => void;
}) {
  const [protocol, setProtocol] = useState<'https' | 'ssh'>('https');
  const [copied, setCopied] = useState(false);

  const httpsUrl = `https://veteran.dev/${owner}/${name}.git`;
  const sshUrl = `git@veteran.dev:${owner}/${name}.git`;
  const currentUrl = protocol === 'https' ? httpsUrl : sshUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Clone</h3>

        <div className="flex border-b border-border mb-4">
          {(['https', 'ssh'] as const).map(p => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors relative',
                protocol === p ? 'text-accent' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {p.toUpperCase()}
              {protocol === p && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm font-mono text-text-primary truncate">
            {currentUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="px-3 py-2 bg-primary-dark border border-border rounded-lg">
          <p className="text-xs text-text-muted mb-1">CLI command</p>
          <code className="text-sm text-text-primary font-mono">gh repo clone {owner}/{name}</code>
        </div>
      </div>
    </div>
  );
}

export function RepoHeader({
  repo, owner, name, starCount, forkCount, watchCount,
  isStarred, onStar, onFork, onWatch, className,
}: RepoHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showClone, setShowClone] = useState(false);

  const currentPath = location.pathname.replace(`/${owner}/${name}`, '') || '/';
  const activeTab = TABS.find(t => {
    if (t.path === '') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(t.path);
  });

  const visibilityIcon = repo.visibility === 'private' ? Lock :
    repo.visibility === 'internal' ? Shield : Globe;
  const visibilityColor = repo.visibility === 'private' ? 'text-danger' :
    repo.visibility === 'internal' ? 'text-warning' : 'text-success';

  return (
    <div className={cn('border-b border-border pb-0', className)}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-text-secondary hover:text-accent transition-colors cursor-pointer text-sm" onClick={() => navigate(`/${owner}`)}>
            {owner}
          </span>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-semibold text-lg cursor-pointer hover:text-accent transition-colors" onClick={() => navigate(`/${owner}/${name}`)}>
            {name}
          </span>
          <span className={cn(
            'flex items-center gap-1 px-2 py-0.5 text-2xs font-medium rounded-full border',
            visibilityColor, `border-${visibilityColor}/30`
          )}>
            {visibilityIcon({ size: 10 })}
            {repo.visibility}
          </span>
          {repo.isFork && (
            <span className="text-xs text-text-muted">Forked from {repo.parentFullName}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onStar}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors',
              isStarred
                ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface/80'
            )}
          >
            <Star size={14} className={isStarred ? 'fill-accent' : ''} />
            {isStarred ? 'Starred' : 'Star'} {formatCount(starCount)}
          </button>
          <button
            onClick={onFork}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
          >
            <GitFork size={14} /> Fork {formatCount(forkCount)}
          </button>
          <button
            onClick={onWatch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
          >
            <Eye size={14} /> Watch {formatCount(watchCount)}
          </button>
          <button
            onClick={() => setShowClone(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
          >
            <Code size={14} /> Clone
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30 transition-colors">
            <Heart size={14} /> Sponsor
          </button>
        </div>
      </div>

      <nav className="flex overflow-x-auto gap-1 -mb-px">
        {TABS.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(`/${owner}/${name}${path}`)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap transition-colors relative',
              activeTab?.id === id
                ? 'text-text-primary font-medium'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Icon size={14} />
            {label}
            {(id === 'issues' && repo.openIssueCount > 0) && (
              <span className="text-xs text-text-muted ml-1">{repo.openIssueCount}</span>
            )}
            {(id === 'pulls' && repo.openPullCount > 0) && (
              <span className="text-xs text-text-muted ml-1">{repo.openPullCount}</span>
            )}
            {activeTab?.id === id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {showClone && <CloneDialog repo={repo} owner={owner} name={name} onClose={() => setShowClone(false)} />}
    </div>
  );
}
