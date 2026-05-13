import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, GitFork, AlertTriangle, BarChart3, Activity, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeletonGroup } from '@ui/VeteranSkeleton';

const STAT_ICONS: Record<string, typeof Users> = {
  total_users: Users,
  total_repos: GitFork,
  total_orgs: Shield,
  total_issues: BarChart3,
  total_pulls: GitFork,
  active_users_24h: Activity,
  active_users_7d: Activity,
  storage_used: Database,
  api_requests_24h: Activity,
};

function formatStatValue(key: string, value: number): string {
  if (key === 'storage_used') {
    return value >= 1073741824
      ? `${(value / 1073741824).toFixed(1)} GB`
      : value >= 1048576
        ? `${(value / 1048576).toFixed(1)} MB`
        : `${(value / 1024).toFixed(1)} KB`;
  }
  return value.toLocaleString();
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 30_000,
  });

  const statCards = stats
    ? [
        { label: 'Total Users', value: formatStatValue('total_users', stats.total_users), icon: Users, color: 'text-info' },
        { label: 'Total Repos', value: formatStatValue('total_repos', stats.total_repos), icon: GitFork, color: 'text-success' },
        { label: 'Active Today', value: formatStatValue('active_users_24h', stats.active_users_24h), icon: Activity, color: 'text-accent' },
        { label: 'Open Issues', value: formatStatValue('total_issues', stats.total_issues), icon: AlertTriangle, color: 'text-danger' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
        </div>

        {isLoading ? (
          <VeteranSkeletonGroup count={4} variant="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="border border-border rounded-lg bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-text-primary">{value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-border rounded-lg bg-surface p-4">
              <span className="text-xs text-text-muted uppercase tracking-wider">7-Day Active</span>
              <p className="text-xl font-bold text-text-primary mt-1">{stats.active_users_7d.toLocaleString()}</p>
            </div>
            <div className="border border-border rounded-lg bg-surface p-4">
              <span className="text-xs text-text-muted uppercase tracking-wider">API Requests (24h)</span>
              <p className="text-xl font-bold text-text-primary mt-1">{stats.api_requests_24h.toLocaleString()}</p>
            </div>
            <div className="border border-border rounded-lg bg-surface p-4">
              <span className="text-xs text-text-muted uppercase tracking-wider">Pull Requests</span>
              <p className="text-xl font-bold text-text-primary mt-1">{stats.total_pulls.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Users', icon: Users, path: '/admin/users', count: stats?.total_users },
            { label: 'Repositories', icon: GitFork, path: '/admin/repos', count: stats?.total_repos },
            { label: 'Organizations', icon: Shield, path: '/admin/orgs', count: stats?.total_orgs },
          ].map(({ label, icon: Icon, path, count }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 border border-border rounded-lg bg-surface p-4 hover:bg-surface/80 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Icon size={20} className="text-accent" />
              </div>
              <div>
                <span className="text-sm font-medium text-text-primary block">{label}</span>
                <span className="text-xs text-text-muted">{count?.toLocaleString() ?? '...'} total</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
