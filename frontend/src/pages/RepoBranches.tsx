import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, GitMerge, GitPullRequest, Shield, Search, Star, Clock } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';
import { useState } from 'react';

interface BranchItem {
  name: string;
  sha: string;
  message: string;
  author: string;
  date: string;
  isProtected: boolean;
  isDefault: boolean;
  aheadBy: number;
  behindBy: number;
}

const MOCK_BRANCHES: BranchItem[] = [
  { name: 'main', sha: 'abc123def', message: 'feat: final release v2.0', author: 'Jane Dev', date: new Date(Date.now() - 3600000).toISOString(), isProtected: true, isDefault: true, aheadBy: 0, behindBy: 0 },
  { name: 'develop', sha: 'ghi456jkl', message: 'feat: add new API endpoints', author: 'John Doe', date: new Date(Date.now() - 7200000).toISOString(), isProtected: false, isDefault: false, aheadBy: 12, behindBy: 3 },
  { name: 'feature/new-ui', sha: 'mno789pqr', message: 'WIP: redesign dashboard', author: 'Alice', date: new Date(Date.now() - 14400000).toISOString(), isProtected: false, isDefault: false, aheadBy: 23, behindBy: 5 },
  { name: 'bugfix/login-error', sha: 'stu012vwx', message: 'fix: login validation error', author: 'Bob', date: new Date(Date.now() - 28800000).toISOString(), isProtected: false, isDefault: false, aheadBy: 2, behindBy: 1 },
  { name: 'release/v2.1', sha: 'yza345bcd', message: 'chore: prepare v2.1 release', author: 'Jane Dev', date: new Date(Date.now() - 86400000).toISOString(), isProtected: true, isDefault: false, aheadBy: 0, behindBy: 4 },
];

export function RepoBranches() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = MOCK_BRANCHES.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Branches</h1>
          <span className="text-sm text-text-muted">{MOCK_BRANCHES.length} branches</span>
        </div>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Find a branch..." />
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
          {filtered.map(branch => (
            <div key={branch.name} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/20 transition-colors">
              <GitBranch size={16} className={branch.isDefault ? 'text-accent' : 'text-text-muted'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/${owner}/${name}/tree/${branch.name}`)}
                    className="text-sm font-mono font-medium text-info hover:text-info/80 transition-colors truncate"
                  >
                    {branch.name}
                  </button>
                  {branch.isProtected && <Shield size={14} className="text-success" />}
                  {branch.isDefault && (
                    <span className="px-1.5 py-0.5 text-2xs bg-accent/20 text-accent rounded font-medium">default</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                  <span className="text-text-secondary font-medium">{branch.author}</span>
                  <span>{branch.message}</span>
                  <span>{formatRelativeTime(branch.date)}</span>
                </div>
              </div>
              {(branch.aheadBy > 0 || branch.behindBy > 0) && (
                <div className="text-xs text-text-muted shrink-0 hidden sm:block">
                  {branch.aheadBy > 0 && <span className="text-success">{branch.aheadBy} ahead</span>}
                  {branch.aheadBy > 0 && branch.behindBy > 0 && ' '}
                  {branch.behindBy > 0 && <span className="text-danger">{branch.behindBy} behind</span>}
                </div>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/${owner}/${name}/compare/${branch.name}`)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface/80 transition-colors"
                  title="Compare"
                >
                  <GitPullRequest size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <GitBranch size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium text-text-primary mb-1">No branches found</p>
            <p className="text-sm">{search ? 'Try a different search' : 'This repository has no branches'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
