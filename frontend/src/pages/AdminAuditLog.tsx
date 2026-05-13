import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search, ArrowLeft, Filter } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function AdminAuditLog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit-logs', search],
    queryFn: () => adminApi.getAuditLogs({ per_page: 100 }),
  });

  const logEntries = Array.isArray(entries) ? entries : [];

  const filtered = search
    ? logEntries.filter(e =>
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.actor.username.toLowerCase().includes(search.toLowerCase()) ||
        e.target_type.toLowerCase().includes(search.toLowerCase())
      )
    : logEntries;

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Audit Log</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
            <Filter size={14} /> Export
          </button>
        </div>

        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit log..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2"><VeteranSkeleton variant="table" /></div>
        ) : error ? (
          <VeteranEmptyState icon="alert" title="Failed to load audit log" description="Could not fetch audit log entries. Please try again." />
        ) : filtered.length === 0 ? (
          <VeteranEmptyState icon="search" title="No entries found" description={search ? 'Try a different search term.' : 'No audit log entries yet.'} />
        ) : (
          <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Actor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Target</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">Details</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono text-text-primary">{entry.action}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{entry.actor.username}</td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden md:table-cell">{entry.target_type}#{entry.target_id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden lg:table-cell">{JSON.stringify(entry.metadata)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatRelativeTime(entry.created_at)}</td>
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
