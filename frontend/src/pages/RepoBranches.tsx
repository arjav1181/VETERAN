import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, GitPullRequest, Shield, Search as SearchIcon } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import { useRepoBranches } from '@hooks/useRepo';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import type { Branch } from '@lib/api/endpoints/repos';
import { getRepoParams } from '@lib/route-utils';

export function RepoBranches() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: branches, isLoading, error } = useRepoBranches(owner!, name!);

  const filtered = (branches ?? []).filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <GitBranch size={24} className="text-accent" />
            <div className="h-7 w-40 bg-surface rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <VeteranSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <VeteranEmptyState
            icon="alert"
            title="Failed to load branches"
            description="There was an error loading the branches. Please try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Branches</h1>
          <span className="text-sm text-text-muted">{branches?.length ?? 0} branches</span>
        </div>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Find a branch..." />
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
          {filtered.map(branch => (
            <div key={branch.name} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/20 transition-colors">
              <GitBranch size={16} className={branch.name === 'main' || branch.name === 'master' ? 'text-accent' : 'text-text-muted'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/${owner}/${name}/tree/${branch.name}`)}
                    className="text-sm font-mono font-medium text-info hover:text-info/80 transition-colors truncate"
                  >
                    {branch.name}
                  </button>
                  {branch.protected && <Shield size={14} className="text-success" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                  <span className="text-text-secondary font-medium">View commit</span>
                  <span className="font-mono">{branch.commit.sha.substring(0, 7)}</span>
                </div>
              </div>
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
          <VeteranEmptyState
            icon="search"
            title="No branches found"
            description={search ? 'Try a different search' : 'This repository has no branches'}
          />
        )}
      </div>
    </div>
  );
}
