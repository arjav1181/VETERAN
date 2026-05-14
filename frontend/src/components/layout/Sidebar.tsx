import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { VeteranTooltip } from '@ui/VeteranTooltip';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import {
  Home,
  BookOpen,
  GitPullRequest,
  Play,
  Package,
  Laptop,
  Star,
  GitFork,
  Plus,
  Compass,
  TrendingUp,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Building2,
  Command,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const primaryItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'issues', label: 'Issues', icon: BookOpen, path: '/dashboard?tab=issues', countType: 'issues' as const },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/dashboard?tab=pulls', countType: 'pulls' as const },
  { id: 'actions', label: 'Actions', icon: Play, path: '/dashboard?tab=actions' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/dashboard?tab=packages' },
  { id: 'codespaces', label: 'Codespaces', icon: Laptop, path: '/codespaces', countType: 'codespaces' as const },
  { id: 'starred', label: 'Starred repos', icon: Star, path: '/starred' },
];

const exploreItems = [
  { id: 'trending', label: 'Trending', icon: TrendingUp, path: '/explore' },
  { id: 'topics', label: 'Topics', icon: Compass, path: '/explore/topics' },
  { id: 'people', label: 'People', icon: Users, path: '/explore/people' },
];

const recentRepos = [
  { owner: 'veteran', name: 'veteran', label: 'veteran/veteran' },
  { owner: 'veteran', name: 'cli', label: 'veteran/cli' },
  { owner: 'veteran', name: 'docs', label: 'veteran/docs' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [reposExpanded, setReposExpanded] = useState(true);
  const [orgsExpanded, setOrgsExpanded] = useState(true);

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-[#30363D] bg-[#161B22] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      <div className={cn(
        'flex items-center border-b border-[#30363D]',
        collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
      )}>
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#484F58]">
            Navigation
          </span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-md text-[#484F58] hover:text-[#E6EDF3] hover:bg-[#1C2128] transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 space-y-0.5 px-2">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path.split('?')[0]);

          const link = (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'relative flex items-center rounded-md text-sm font-medium transition-all duration-150',
                collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-[#1C2128] text-[#E6EDF3]'
                  : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#E8B84B]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive && 'text-[#E8B84B]')} />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.countType === 'issues' && (
                    <span className="text-xs font-medium text-[#8D96A0] bg-[#1C2128] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      24
                    </span>
                  )}
                  {item.countType === 'pulls' && (
                    <span className="text-xs font-medium text-[#8D96A0] bg-[#1C2128] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      7
                    </span>
                  )}
                  {item.countType === 'codespaces' && (
                    <span className="relative flex items-center justify-center w-2 h-2">
                      <span className="absolute inline-flex w-2 h-2 rounded-full bg-[#3FB950] opacity-75 animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-[#3FB950]" />
                    </span>
                  )}
                </>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <VeteranTooltip key={item.id} content={item.label} position="right">
                {link}
              </VeteranTooltip>
            );
          }
          return link;
        })}

        {user && !collapsed && (
          <>
            <div className="pt-5 pb-1">
              <div className="flex items-center justify-between px-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#484F58]">
                  Your repositories
                </span>
                <VeteranTooltip content="New repository">
                  <Link
                    to="/new"
                    className="p-1 rounded text-[#484F58] hover:text-[#E6EDF3] hover:bg-[#1C2128] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </VeteranTooltip>
              </div>
            </div>
            <button
              onClick={() => setReposExpanded(!reposExpanded)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50 transition-colors"
            >
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform duration-150',
                reposExpanded && 'rotate-0',
                !reposExpanded && '-rotate-90'
              )} />
              <span className="font-medium">Recent</span>
            </button>
            <AnimatePresence initial={false}>
              {reposExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {recentRepos.map((repo) => {
                    const repoPath = `/${repo.owner}/${repo.name}`;
                    const isRepoActive = location.pathname.startsWith(repoPath);
                    return (
                      <Link
                        key={repo.label}
                        to={repoPath}
                        className={cn(
                          'flex items-center gap-3 px-3 py-1.5 ml-1 rounded-md text-sm transition-colors',
                          isRepoActive
                            ? 'text-[#E6EDF3] bg-[#1C2128] border-l-[3px] border-[#E8B84B]'
                            : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50'
                        )}
                      >
                        <GitFork className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{repo.label}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 pb-1 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#484F58]">
                Organizations
              </span>
            </div>
            <button
              onClick={() => setOrgsExpanded(!orgsExpanded)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50 transition-colors"
            >
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform duration-150',
                orgsExpanded && 'rotate-0',
                !orgsExpanded && '-rotate-90'
              )} />
              <span className="font-medium">Your orgs</span>
            </button>
            <AnimatePresence initial={false}>
              {orgsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <Link
                    to="/orgs/veteran"
                    className="flex items-center gap-3 px-3 py-1.5 ml-1 rounded-md text-sm text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50 transition-colors"
                  >
                    <VeteranAvatar name="Veteran" size="xs" />
                    <span className="truncate">veteran</span>
                  </Link>
                  <Link
                    to="/orgs/veteran-labs"
                    className="flex items-center gap-3 px-3 py-1.5 ml-1 rounded-md text-sm text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50 transition-colors"
                  >
                    <VeteranAvatar name="Labs" size="xs" />
                    <span className="truncate">veteran-labs</span>
                  </Link>
                  <Link
                    to="/organizations/new"
                    className="flex items-center gap-3 px-3 py-1.5 ml-1 rounded-md text-sm text-[#4493F8] hover:text-[#4493F8]/80 hover:bg-[#1C2128]/50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create organization</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 pb-1 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#484F58]">
                Explore
              </span>
            </div>
            {exploreItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#1C2128] text-[#E6EDF3] border-l-[3px] border-[#E8B84B]'
                      : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50'
                  )}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      <div className={cn(
        'border-t border-[#30363D] py-2 space-y-0.5',
        collapsed ? 'px-1.5' : 'px-2'
      )}>
        <SidebarBottomItem
          icon={Bell}
          label="Notifications"
          path="/notifications"
          collapsed={collapsed}
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <SidebarBottomItem
          icon={Settings}
          label="Settings"
          path="/settings"
          collapsed={collapsed}
        />
        {user?.isAdmin && (
          <SidebarBottomItem
            icon={Shield}
            label="Admin"
            path="/admin"
            collapsed={collapsed}
          />
        )}
      </div>
    </aside>
  );
}

function SidebarBottomItem({
  icon: Icon,
  label,
  path,
  collapsed,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  collapsed: boolean;
  badge?: number;
}) {
  const location = useLocation();
  const isActive = location.pathname === path;

  const link = (
    <Link
      to={path}
      className={cn(
        'flex items-center rounded-md text-sm font-medium transition-colors',
        collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
        isActive
          ? 'bg-[#1C2128] text-[#E6EDF3]'
          : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#1C2128]/50'
      )}
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          {badge !== undefined && (
            <span className="text-xs font-bold text-white bg-[#F85149] px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <VeteranTooltip key={label} content={label} position="right">
        {link}
      </VeteranTooltip>
    );
  }
  return link;
}
