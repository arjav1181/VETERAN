import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GitFork, Search, Globe, Lock, Archive, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function AdminRepos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: repos, isLoading, error } = useQuery({
    queryKey: ['admin', 'repos', search],
    queryFn: () => adminApi.listRepos({ search: search || undefined, per_page: 100 }),
  });

  const repoList = Array.isArray(repos) ? repos : [];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GitFork size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Repositories</h1>
            <span className="text-sm text-text-muted">{repoList.length} total</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search repos..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2"><VeteranSkeleton variant="table" /></div>
        ) : error ? (
          <VeteranEmptyState icon="alert" title="Failed to load repositories" description="Could not fetch repository data. Please try again." />
        ) : repoList.length === 0 ? (
          <VeteranEmptyState icon="search" title="No repositories found" description={search ? 'Try a different search term.' : 'No repositories have been created yet.'} />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Repository</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Visibility</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Stars</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Forks</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Updated</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {repoList.map((repo: any) => (
                  <tr key={repo.id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GitFork size={16} className="text-text-muted shrink-0" />
                        <span className="text-sm font-medium text-text-primary">{repo.fullName || repo.full_name}</span>
                        {repo.isArchived && <Archive size={14} className="text-warning" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('flex items-center gap-1 text-xs', !repo.isPrivate ? 'text-success' : 'text-danger')}>
                        {!repo.isPrivate ? <Globe size={12} /> : <Lock size={12} />}
                        {repo.isPrivate ? 'private' : 'public'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{repo.starsCount ?? repo.stargazers_count ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{repo.forksCount ?? repo.forks_count ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatRelativeTime(repo.updatedAt || repo.pushed_at || repo.updated_at)}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
