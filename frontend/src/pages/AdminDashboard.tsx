import { useNavigate } from 'react-router-dom';
import { Shield, Users, GitFork, AlertTriangle, BarChart3, Activity, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const STATS = [
  { label: 'Total Users', value: '12,847', change: '+12%', icon: Users, color: 'text-info' },
  { label: 'Total Repos', value: '34,291', change: '+8%', icon: GitFork, color: 'text-success' },
  { label: 'Active Today', value: '3,421', change: '+5%', icon: Activity, color: 'text-accent' },
  { label: 'Open Incidents', value: '3', change: '-2', icon: AlertTriangle, color: 'text-danger' },
];

const CHART_DATA = Array.from({ length: 14 }).map((_, i) => ({
  name: `${i + 1}d`,
  users: Math.floor(Math.random() * 1000 + 2000),
  repos: Math.floor(Math.random() * 500 + 1000),
}));

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="border border-border rounded-lg bg-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
                <Icon size={18} className={color} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-text-primary">{value}</span>
                <span className={cn('text-xs font-medium mb-1', change.startsWith('+') ? 'text-success' : 'text-danger')}>{change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="border border-border rounded-lg bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">User Growth (14 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="name" stroke="#484F58" fontSize={12} />
                <YAxis stroke="#484F58" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#13161E', border: '1px solid #21262D', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="users" stroke="#58A6FF" fill="#58A6FF" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="border border-border rounded-lg bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Repository Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="name" stroke="#484F58" fontSize={12} />
                <YAxis stroke="#484F58" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#13161E', border: '1px solid #21262D', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="repos" stroke="#3FB950" fill="#3FB950" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Users', icon: Users, path: '/admin/users', count: '12,847' },
            { label: 'Repositories', icon: GitFork, path: '/admin/repos', count: '34,291' },
            { label: 'Organizations', icon: Shield, path: '/admin/orgs', count: '847' },
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
                <span className="text-xs text-text-muted">{count} total</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
