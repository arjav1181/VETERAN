import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, Ban, CheckCircle, XCircle, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function AdminUsers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.listUsers({ search: search || undefined, per_page: 100 }),
  });

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Users</h1>
            {users && <span className="text-sm text-text-muted">{users.length} total</span>}
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2"><VeteranSkeleton variant="table" /></div>
        ) : error ? (
          <VeteranEmptyState icon="alert" title="Failed to load users" description="Could not fetch user data. Please try again." />
        ) : !users || users.length === 0 ? (
          <VeteranEmptyState icon="search" title="No users found" description={search ? 'Try a different search term.' : 'No users have been created yet.'} />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Joined</th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-medium shrink-0">
                          {user.name?.charAt(0) || user.username.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">{user.name || user.username}</span>
                          <span className="text-xs text-text-muted block">@{user.username}</span>
                        </div>
                        {(user.role === 'admin' || user.role === 'super_admin') && <Shield size={14} className="text-accent shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        {user.banned ? (
                          <><Ban size={14} className="text-danger" /><span className="text-xs">Banned</span></>
                        ) : user.confirmed ? (
                          <><CheckCircle size={14} className="text-success" /><span className="text-xs">Active</span></>
                        ) : (
                          <><XCircle size={14} className="text-text-muted" /><span className="text-xs">Unconfirmed</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary capitalize">{user.role.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
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
