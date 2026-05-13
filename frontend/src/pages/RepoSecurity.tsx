import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, AlertTriangle, Search as SearchIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-danger/20 text-danger border-danger/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-info/20 text-info border-info/30',
  low: 'bg-text-muted/20 text-text-muted border-text-muted/30',
};

export function RepoSecurity() {
  const p = useParams<{ owner: string; name?: string; repo?: string }>(); const owner = p.owner || ""; const name = p.name || p.repo || "";

  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['security-alerts', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/security-alerts`),
    enabled: !!owner && !!name,
  });

  const alertList = (alerts as any[]) ?? [];
  const openAlerts = alertList.filter((a: any) => a.state === 'open');
  const dependabotCount = openAlerts.filter((a: any) => a.type === 'dependabot').length;
  const codeScanningCount = openAlerts.filter((a: any) => a.type === 'code_scanning').length;
  const secretScanningCount = openAlerts.filter((a: any) => a.type === 'secret_scanning').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={24} className="text-accent" />
            <div className="h-7 w-32 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Security</h1>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Security alerts unavailable" description="The security feature is not available or there was an error loading alerts." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Dependabot alerts', count: dependabotCount, icon: AlertTriangle, color: 'text-warning' },
                { label: 'Code scanning', count: codeScanningCount, icon: FileText, color: 'text-danger' },
                { label: 'Secret scanning', count: secretScanningCount, icon: SearchIcon, color: 'text-info' },
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

              {openAlerts.length === 0 ? (
                <div className="py-12">
                  <VeteranEmptyState icon="inbox" title="All clear" description="No open security alerts for this repository." />
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {openAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
                      <div className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 text-2xs font-medium rounded border',
                        SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.low
                      )}>
                        {alert.severity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-text-primary font-medium truncate block">{alert.title}</span>
                        <div className="text-xs text-text-muted">
                          {alert.type} · {alert.packageName || alert.package_name || 'N/A'} · {alert.state}
                        </div>
                      </div>
                      <span className="text-xs text-text-muted shrink-0">{alert.created_at || alert.createdAt ? new Date(alert.created_at || alert.createdAt).toISOString().split('T')[0] : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
