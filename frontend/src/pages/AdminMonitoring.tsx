import { useNavigate } from 'react-router-dom';
import { Activity, Server, Database, Cpu, HardDrive, Wifi, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const METRICS = [
  { label: 'CPU Usage', value: '34%', icon: Cpu, color: 'text-info', status: 'ok' as const },
  { label: 'Memory', value: '6.2 / 16 GB', icon: HardDrive, color: 'text-success', status: 'ok' as const },
  { label: 'Disk Usage', value: '234 / 512 GB', icon: Database, color: 'text-accent', status: 'ok' as const },
  { label: 'Network', value: '1.2 Gbps', icon: Wifi, color: 'text-success', status: 'ok' as const },
];

const SERVICES = [
  { name: 'API Server', status: 'healthy', uptime: '99.99%', responseTime: '45ms' },
  { name: 'Database', status: 'healthy', uptime: '99.99%', responseTime: '12ms' },
  { name: 'Cache (Redis)', status: 'healthy', uptime: '99.95%', responseTime: '3ms' },
  { name: 'Queue (RabbitMQ)', status: 'healthy', uptime: '99.98%', responseTime: '5ms' },
  { name: 'WebSocket Server', status: 'degraded', uptime: '99.50%', responseTime: '89ms' },
];

const CHART_DATA = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  latency: Math.floor(Math.random() * 50 + 20),
  requests: Math.floor(Math.random() * 1000 + 500),
}));

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

export function AdminMonitoring() {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="border border-border rounded-lg bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">API Latency (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="time" stroke="#484F58" fontSize={11} />
                <YAxis stroke="#484F58" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#13161E', border: '1px solid #21262D', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="latency" stroke="#58A6FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border border-border rounded-lg bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Request Rate (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="time" stroke="#484F58" fontSize={11} />
                <YAxis stroke="#484F58" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#13161E', border: '1px solid #21262D', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="requests" stroke="#3FB950" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Service Status</h3>
          </div>
          <div className="divide-y divide-border/50">
            {SERVICES.map(service => {
              const StatusIcon = STATUS_ICONS[service.status] || CheckCircle;
              return (
                <div key={service.name} className="flex items-center gap-3 px-4 py-3">
                  <Server size={16} className="text-text-muted shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-text-primary font-medium">{service.name}</span>
                    <div className="text-xs text-text-muted">
                      Uptime: {service.uptime} · Response: {service.responseTime}
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1', STATUS_COLORS[service.status])}>
                    <StatusIcon size={14} />
                    <span className="text-xs capitalize">{service.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
