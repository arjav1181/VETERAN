import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, Server, Database, Cpu, HardDrive, Wifi, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton, VeteranSkeletonGroup } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  healthy: 'text-success',
  degraded: 'text-warning',
  down: 'text-danger',
};

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function AdminMonitoring() {
  const navigate = useNavigate();

  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: 15_000,
  });

  const { data: queues, isLoading: queuesLoading } = useQuery({
    queryKey: ['admin', 'queues'],
    queryFn: () => adminApi.getQueueStats(),
    refetchInterval: 15_000,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => adminApi.getServerLogs({ lines: 50 }),
    refetchInterval: 30_000,
  });

  const isLoading = healthLoading || queuesLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          <div className="flex items-center gap-3 mb-8">
            <Activity size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">System Monitoring</h1>
          </div>
          <VeteranSkeletonGroup count={4} variant="card" />
          <div className="mt-6"><VeteranSkeleton variant="table" /></div>
        </div>
      </div>
    );
  }

  if (healthError) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load monitoring data" description="Could not fetch system health information." />
        </div>
      </div>
    );
  }

  const memory = health?.memory as Record<string, number> | undefined;
  const cpu = health?.cpu as Record<string, number> | undefined;

  const METRICS = [
    { label: 'CPU Usage', value: cpu ? `${cpu.user ?? 0}%` : 'N/A', icon: Cpu, color: 'text-info', status: 'ok' as const },
    { label: 'Memory', value: memory ? `${formatBytes(memory.used ?? 0)} / ${formatBytes(memory.total ?? 0)}` : 'N/A', icon: HardDrive, color: 'text-success', status: 'ok' as const },
    { label: 'Uptime', value: health ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A', icon: Database, color: 'text-accent', status: 'ok' as const },
    { label: 'Status', value: health?.status ?? 'N/A', icon: Wifi, color: health?.status === 'healthy' ? 'text-success' : 'text-warning', status: (health?.status === 'healthy' ? 'ok' : 'warning') as const },
  ];

  const services = [
    { name: 'API Server', status: health?.status ?? 'unknown', uptime: health ? `${Math.floor(health.uptime / 3600)}h` : 'N/A', responseTime: 'N/A' },
    ...(queues ? Object.entries(queues).map(([name, stats]) => ({
      name: `Queue: ${name}`,
      status: stats.failed > 0 ? 'degraded' : 'healthy' as string,
      uptime: `${stats.completed} completed`,
      responseTime: `${stats.waiting} waiting, ${stats.active} active`,
    })) : []),
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Activity size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">System Monitoring</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRICS.map(({ label, value, icon: Icon, color, status }) => (
            <div key={label} className="border border-border rounded-lg bg-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
                <Icon size={18} className={color} />
              </div>
              <span className="text-xl font-bold text-text-primary">{value}</span>
              <div className="flex items-center gap-1 mt-1">
                {status === 'ok' ? <CheckCircle size={12} className="text-success" /> : <AlertTriangle size={12} className="text-warning" />}
                <span className="text-xs text-text-muted">Operational</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-lg bg-surface overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Service Status</h3>
          </div>
          <div className="divide-y divide-border/50">
            {services.map(service => {
              const StatusIcon = STATUS_ICONS[service.status] || CheckCircle;
              return (
                <div key={service.name} className="flex items-center gap-3 px-4 py-3">
                  <Server size={16} className="text-text-muted shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-text-primary font-medium">{service.name}</span>
                    <div className="text-xs text-text-muted">
                      {service.uptime} · {service.responseTime}
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1', STATUS_COLORS[service.status] || 'text-text-muted')}>
                    <StatusIcon size={14} />
                    <span className="text-xs capitalize">{service.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {logs && logs.logs && logs.logs.length > 0 && (
          <div className="border border-border rounded-lg bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary">Server Logs (last {logs.logs.length} lines)</h3>
            </div>
            <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-96 overflow-y-auto">
              {logs.logs.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
