import { useParams } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_ALERTS = [
  { id: 's1', type: 'dependabot', severity: 'high', title: 'Prototype Pollution in lodash', package: 'lodash', state: 'open', createdAt: '2026-01-10' },
  { id: 's2', type: 'code_scanning', severity: 'critical', title: 'SQL Injection in user query', package: null, state: 'open', createdAt: '2026-01-08' },
  { id: 's3', type: 'secret_scanning', severity: 'high', title: 'AWS Key exposed in config file', package: null, state: 'open', createdAt: '2026-01-05' },
  { id: 's4', type: 'dependabot', severity: 'medium', title: 'Cross-site Scripting in express', package: 'express', state: 'dismissed', createdAt: '2025-12-20' },
  { id: 's5', type: 'dependabot', severity: 'low', title: 'Regular Expression DoS in moment', package: 'moment', state: 'fixed', createdAt: '2025-12-15' },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-danger/20 text-danger border-danger/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-info/20 text-info border-info/30',
  low: 'bg-text-muted/20 text-text-muted border-text-muted/30',
};

export function RepoSecurity() {
  const { owner, name } = useParams<{ owner: string; name: string }>();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Security</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Dependabot alerts', count: 2, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Code scanning', count: 1, icon: FileText, color: 'text-danger' },
            { label: 'Secret scanning', count: 1, icon: Search, color: 'text-info' },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className="border border-border rounded-lg bg-surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={color} />
                <span className="text-sm text-text-primary">{label}</span>
              </div>
              <span className="text-2xl font-bold text-text-primary">{count}</span>
              <span className="text-sm text-text-muted ml-1">open</span>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Open alerts</h3>
          </div>
          <div className="divide-y divide-border/50">
            {MOCK_ALERTS.map(alert => (
              <div key={alert.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
                <div className={cn(
                  'flex items-center gap-1.5 px-2 py-0.5 text-2xs font-medium rounded border',
                  SEVERITY_COLORS[alert.severity]
                )}>
                  {alert.severity}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary font-medium truncate block">{alert.title}</span>
                  <div className="text-xs text-text-muted">
                    {alert.type} · {alert.package || 'N/A'} · {alert.state}
                  </div>
                </div>
                <span className="text-xs text-text-muted shrink-0">{alert.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
