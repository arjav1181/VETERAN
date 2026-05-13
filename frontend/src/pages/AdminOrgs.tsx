import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, Shield, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function AdminOrgs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: orgs, isLoading, error } = useQuery({
    queryKey: ['admin', 'orgs'],
    queryFn: () => adminApi.listOrgs({ per_page: 100 }),
  });

  const orgList = Array.isArray(orgs) ? orgs : [];

  const filtered = search
    ? orgList.filter((o: any) =>
        (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.slug || '').toLowerCase().includes(search.toLowerCase())
      )
    : orgList;

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Organizations</h1>
            <span className="text-sm text-text-muted">{orgList.length} total</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2"><VeteranSkeleton variant="table" /></div>
        ) : error ? (
          <VeteranEmptyState icon="alert" title="Failed to load organizations" description="Could not fetch organization data. Please try again." />
        ) : filtered.length === 0 ? (
          <VeteranEmptyState icon="search" title="No organizations found" description={search ? 'Try a different search term.' : 'No organizations have been created yet.'} />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Organization</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Members</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Repos</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Created</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((org: any) => (
                  <tr key={org.id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                          <Building2 size={16} className="text-accent" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">{org.name}</span>
                          <span className="text-xs text-text-muted block">@{org.slug}</span>
                        </div>
                        {org.verified && <Shield size={14} className="text-info shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{org.public_members ?? org.memberCount ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{org.repos_count ?? org.repoCount ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden md:table-cell">{new Date(org.created_at || org.createdAt).toLocaleDateString()}</td>
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
