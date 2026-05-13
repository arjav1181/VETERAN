import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, ArrowLeft, Filter } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const MOCK_ENTRIES = Array.from({ length: 30 }).map((_, i) => ({
  id: `log-${i}`,
  action: ['user.login', 'repo.create', 'user.delete', 'repo.archive', 'org.update', 'user.suspend', 'repo.transfer'][i % 7],
  actor: ['admin-1', 'admin-2'][i % 2],
  target: [`user-${i % 10}`, `repo-${i % 15}`][i % 2],
  details: `Performed ${['login', 'creation', 'deletion', 'archival', 'update', 'suspension', 'transfer'][i % 7]}`,
  ip: `192.168.1.${(i % 254) + 1}`,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export function AdminAuditLog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = MOCK_ENTRIES.filter(e =>
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.actor.toLowerCase().includes(search.toLowerCase()) ||
    e.target.toLowerCase().includes(search.toLowerCase())
  );

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
                  <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{entry.actor}</td>
                  <td className="px-4 py-3 text-sm text-text-muted hidden md:table-cell">{entry.target}</td>
                  <td className="px-4 py-3 text-sm text-text-muted hidden lg:table-cell">{entry.details}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{formatRelativeTime(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
