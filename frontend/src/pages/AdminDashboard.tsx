import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, GitFork, AlertTriangle, BarChart3, Activity, Database,
  Server, HardDrive, Cpu, MemoryStick, Wifi, ChevronRight,
  GitCommit, UserPlus, GitMerge, ArrowUp, ArrowDown,
} from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton, VeteranSkeletonGroup } from '@ui/VeteranSkeleton';

type ActivityEvent = {
  id: string;
  type: 'push' | 'new_user' | 'pr_merged';
  message: string;
  timestamp: string;
  actor?: string;
};

function generateMockActivity(): ActivityEvent[] {
  const types: ActivityEvent['type'][] = ['push', 'new_user', 'pr_merged'];
  const msgs = {
    push: ['Pushed to main', 'Pushed to dev', 'Pushed to feature/auth', 'Pushed to fix/login'],
    new_user: ['New user registered', 'New account created', 'New signup'],
    pr_merged: ['PR #142 merged', 'PR #156 merged', 'PR #161 merged', 'PR #178 merged'],
  };
  const actors = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];
  return Array.from({ length: 20 }, (_, i) => {
    const type = types[i % 3];
    const msgsList = msgs[type];
    return {
      id: `evt-${i}`,
      type,
      message: msgsList[i % msgsList.length],
      timestamp: new Date(Date.now() - i * 180000).toISOString(),
      actor: actors[i % actors.length],
    };
  });
}

const MOCK_ACTIVITY = generateMockActivity();

function generateChartData(days: number, base: number, variance: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
    value: Math.max(0, base + Math.round((Math.random() - 0.5) * variance * 2)),
  }));
}

const mockSignups = generateChartData(30, 24, 18);
const mockGitOps = generateChartData(24, 120, 80);
const mockStorage = generateChartData(30, 800, 60);

type NavItem = {
  id: string;
  label: string;
  icon: typeof Shield;
  path: string;
  badge?: number | string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield, path: '/admin' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'repos', label: 'Repositories', icon: GitFork, path: '/admin/repos' },
  { id: 'organizations', label: 'Organizations', icon: Shield, path: '/admin/orgs' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, path: '/admin/monitoring' },
  { id: 'audit', label: 'Audit Log', icon: BarChart3, path: '/admin/audit' },
  { id: 'settings', label: 'Settings', icon: Server, path: '/admin/settings' },
];

function Sparkline({ data, color = '#3FB950' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = data.length * 4;
  const h = 24;
  const pts = data.map((v, i) => `${i * 4 + 1},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}

function BarChart({ data, height = 80, color = '#4493F8' }: { data: { date: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100 / data.length;
  return (
    <div className="flex items-end gap-[2px] h-full">
      {data.map((d, i) => (
        <motion.div
          key={d.date}
          initial={{ height: 0 }}
          animate={{ height: `${(d.value / max) * 100}%` }}
          transition={{ duration: 0.4, delay: i * 0.01 }}
          className="flex-1 rounded-sm"
          style={{ backgroundColor: color, minHeight: 1 }}
        />
      ))}
    </div>
  );
}

function LineChart({ data, height = 80, color = '#E8B84B' }: { data: { date: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100 / data.length;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${height - (d.value / max) * (height - 10) - 5}`).join(' ');
  return (
    <svg width="100%" height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts} className="drop-shadow-[0_0_4px_rgba(232,184,75,0.3)]" />
      {data.filter((_, i) => i % 4 === 0 || i === data.length - 1).map((d, i) => (
        <circle key={d.date} cx={(data.indexOf(d) / (data.length - 1)) * 100} cy={height - (d.value / max) * (height - 10) - 5} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

function AreaChart({ data, height = 80, color = '#3FB950' }: { data: { date: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = data.length;
  const pts = data.map((d, i) => `${(i / (w - 1)) * 100},${height - (d.value / max) * (height - 10) - 5}`).join(' ');
  const areaPts = `0,${height} ${pts} 100,${height}`;
  return (
    <svg width="100%" height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`area-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon fill={`url(#area-grad)`} points={areaPts} />
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts} />
    </svg>
  );
}

function Gauge({ value, label, color, icon: Icon }: { value: number; label: string; color: string; icon: typeof Cpu }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 shrink-0">
        <svg width={64} height={64} className="-rotate-90">
          <circle cx={32} cy={32} r={r} fill="none" stroke="#1C2128" strokeWidth={6} />
          <circle
            cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={14} className={color.replace('text-', 'text-')} style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-lg font-bold text-[#E6EDF3]">{value}%</div>
        <div className="text-[10px] text-[#484F58] uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 30000,
  });

  const { data: health } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: 15000,
  });

  const activityEvents = MOCK_ACTIVITY;

  const signupTrend = useMemo(() => {
    if (!mockSignups || mockSignups.length < 2) return 0;
    const recent = mockSignups.slice(-7).reduce((s, d) => s + d.value, 0);
    const prev = mockSignups.slice(-14, -7).reduce((s, d) => s + d.value, 0);
    return prev > 0 ? Math.round(((recent - prev) / prev) * 100) : 0;
  }, []);

  const statCards = [
    {
      label: 'Users', value: stats?.totalUsers ?? 0, icon: Users, color: '#58A6FF',
      trend: '+12%', trendUp: true,
    },
    {
      label: 'Repositories', value: stats?.totalRepos ?? 0, icon: GitFork, color: '#3FB950',
      trend: '+5%', trendUp: true,
    },
    {
      label: 'Issues', value: stats?.totalIssues ?? 0, icon: AlertTriangle, color: '#D29922',
      trend: '-3%', trendUp: false,
    },
    {
      label: 'Pull Requests', value: stats?.totalPulls ?? 0, icon: GitMerge, color: '#BC8CFF',
      trend: '+8%', trendUp: true,
    },
  ];

  const renderSidebar = () => (
    <aside className={cn(
      'bg-[#0D1117] border-r border-[#21262D] flex flex-col transition-all duration-200 shrink-0',
      sidebarCollapsed ? 'w-16' : 'w-56'
    )}>
      <div className="p-4 border-b border-[#21262D] flex items-center gap-3">
        <Shield size={20} className="text-[#E8B84B]" />
        {!sidebarCollapsed && <span className="text-sm font-bold text-[#E6EDF3]">VETERAN CMD</span>}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-[#1C2128] text-[#E8B84B] border border-[#30363D]'
                  : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50 border border-transparent'
              )}
            >
              <item.icon size={16} className={cn('shrink-0', active ? 'text-[#E8B84B]' : 'text-[#484F58]')} />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge != null && (
                    <span className="ml-auto text-[10px] bg-[#1C2128] text-[#8D96A0] px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#21262D]">
        <div className={cn(
          'flex items-center gap-2 px-2 py-1',
          !sidebarCollapsed && 'justify-between'
        )}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
            {!sidebarCollapsed && <span className="text-[10px] text-[#3FB950]">ONLINE</span>}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-[#484F58] hover:text-[#8D96A0] rounded transition-colors"
          >
            <ChevronRight size={14} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>
      </div>
    </aside>
  );

  const renderLoading = () => (
    <div className="flex-1 bg-[#0D1117] p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="h-6 w-48 bg-[#1C2128] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 space-y-2">
              <div className="h-4 w-16 bg-[#1C2128] rounded animate-pulse" />
              <div className="h-8 w-20 bg-[#1C2128] rounded animate-pulse" />
              <div className="h-3 w-12 bg-[#1C2128] rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 h-64">
            <VeteranSkeleton variant="card" />
          </div>
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 h-64">
            <VeteranSkeleton variant="card" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 h-40">
              <VeteranSkeleton variant="card" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0D1117]">
      {renderSidebar()}

      {statsLoading ? renderLoading() : (
        <main className="flex-1 bg-[#0D1117] overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-bold text-[#E6EDF3]">Command Dashboard</h1>
                <p className="text-sm text-[#484F58] mt-0.5">
                  System status: <span className="text-[#3FB950]">All systems nominal</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#484F58]">
                <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                Live
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="bg-[#161B22] border border-[#21262D] rounded-lg p-5 hover:border-[#30363D] transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-[#484F58] uppercase tracking-widest">{card.label}</span>
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <div className="flex items-end justify-between">
                    <motion.span
                      className="text-3xl font-bold text-[#E6EDF3] tabular-nums"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      {formatCount(card.value)}
                    </motion.span>
                    <div className={cn(
                      'flex items-center gap-0.5 text-xs',
                      card.trendUp ? 'text-[#3FB950]' : 'text-[#F85149]'
                    )}>
                      {card.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {card.trend}
                    </div>
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkline
                      data={Array.from({ length: 12 }, () => Math.round(card.value * (0.8 + Math.random() * 0.4)))}
                      color={card.color}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Two-column: Activity + Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Activity feed */}
              <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]">
                  <h3 className="text-sm font-semibold text-[#E6EDF3]">Activity Feed</h3>
                  <span className="text-[10px] text-[#484F58]">Live</span>
                </div>
                <div className="p-2 max-h-[280px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {activityEvents.slice(0, 15).map((evt, i) => (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1C2128]/50 transition-colors"
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                          evt.type === 'push' && 'bg-[#58A6FF]/15',
                          evt.type === 'new_user' && 'bg-[#3FB950]/15',
                          evt.type === 'pr_merged' && 'bg-[#BC8CFF]/15',
                        )}>
                          {evt.type === 'push' && <GitCommit size={12} className="text-[#58A6FF]" />}
                          {evt.type === 'new_user' && <UserPlus size={12} className="text-[#3FB950]" />}
                          {evt.type === 'pr_merged' && <GitMerge size={12} className="text-[#BC8CFF]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[#E6EDF3] truncate">{evt.message}</div>
                          <div className="text-[10px] text-[#484F58]">
                            {evt.actor} &middot; {formatRelativeTime(evt.timestamp)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* System health */}
              <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]">
                  <h3 className="text-sm font-semibold text-[#E6EDF3]">System Health</h3>
                  <span className={cn(
                    'text-[10px] flex items-center gap-1',
                    health?.status === 'healthy' ? 'text-[#3FB950]' : 'text-[#D29922]'
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      health?.status === 'healthy' ? 'bg-[#3FB950] animate-pulse' : 'bg-[#D29922]'
                    )} />
                    {health?.status ?? 'unknown'}
                  </span>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <Gauge value={62} label="CPU" color="#58A6FF" icon={Cpu} />
                    <Gauge value={78} label="Memory" color="#E8B84B" icon={MemoryStick} />
                    <Gauge value={45} label="Disk" color="#3FB950" icon={HardDrive} />
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#1C2128] flex items-center justify-center">
                        <Wifi size={24} className="text-[#3FB950]" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#3FB950]">OK</div>
                        <div className="text-[10px] text-[#484F58] uppercase tracking-wider">Redis</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#21262D]">
                    <div className="flex justify-between text-[10px] text-[#484F58]">
                      <span>Uptime: {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '--'}</span>
                      <span>API: {stats?.apiRequests24h ? formatCount(stats.apiRequests24h) : '--'} / 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[#E6EDF3]">New Signups / Day</h3>
                  <span className={cn(
                    'text-[10px] flex items-center gap-0.5',
                    signupTrend >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]'
                  )}>
                    {signupTrend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(signupTrend)}%
                  </span>
                </div>
                <div className="h-24">
                  <BarChart data={mockSignups} height={80} color="#4493F8" />
                </div>
                <div className="flex justify-between text-[10px] text-[#484F58] mt-2">
                  <span>{mockSignups[0]?.date?.slice(5) ?? ''}</span>
                  <span>{mockSignups[mockSignups.length - 1]?.date?.slice(5) ?? ''}</span>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[#E6EDF3]">Git Operations / Hour</h3>
                  <span className="text-[10px] text-[#484F58]">
                    avg {Math.round(mockGitOps.reduce((s, d) => s + d.value, 0) / mockGitOps.length)}
                  </span>
                </div>
                <div className="h-24 flex items-end">
                  <LineChart data={mockGitOps} height={80} color="#E8B84B" />
                </div>
                <div className="flex justify-between text-[10px] text-[#484F58] mt-2">
                  <span>-24h</span>
                  <span>now</span>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[#E6EDF3]">Storage Growth</h3>
                  <span className="text-[10px] text-[#484F58]">
                    {(mockStorage[mockStorage.length - 1]?.value ?? 0) >= 1024
                      ? `${((mockStorage[mockStorage.length - 1]?.value ?? 0) / 1024).toFixed(1)} GB`
                      : `${mockStorage[mockStorage.length - 1]?.value ?? 0} MB`
                    }
                  </span>
                </div>
                <div className="h-24 flex items-end">
                  <AreaChart data={mockStorage} height={80} color="#3FB950" />
                </div>
                <div className="flex justify-between text-[10px] text-[#484F58] mt-2">
                  <span>{mockStorage[0]?.date?.slice(5) ?? ''}</span>
                  <span>{mockStorage[mockStorage.length - 1]?.date?.slice(5) ?? ''}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
