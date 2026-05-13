import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@stores/authStore';
import { VeteranTooltip } from '@ui/VeteranTooltip';
import {
  Home,
  Compass,
  GitFork,
  GitPullRequest,
  Bug,
  BookOpen,
  Clock,
  Star,
  Users,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'explore', label: 'Explore', icon: Compass, path: '/explore' },
];

const workItems = [
  { id: 'repos', label: 'Repositories', icon: GitFork, path: '/dashboard?tab=repos' },
  { id: 'issues', label: 'Issues', icon: Bug, path: '/dashboard?tab=issues' },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: '/dashboard?tab=pulls' },
  { id: 'projects', label: 'Projects', icon: BarChart3, path: '/dashboard?tab=projects' },
];

const personalItems = [
  { id: 'activity', label: 'Activity', icon: Clock, path: '/activity' },
  { id: 'starred', label: 'Starred', icon: Star, path: '/starred' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
];

const orgItems = [
  { id: 'orgs', label: 'Organizations', icon: Building2, path: '/orgs' },
  { id: 'teams', label: 'Teams', icon: Users, path: '/teams' },
];

const bottomItems = [
  { id: 'docs', label: 'Documentation', icon: BookOpen, path: '/docs' },
  { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-end p-2 border-b border-surface-200 dark:border-surface-700"
      >
        <div className="p-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </div>
      </button>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {user && !collapsed && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-surface-400">Work</p>
            </div>
            {workItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 pb-1 px-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-surface-400">Personal</p>
            </div>
            {personalItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-surface-200 dark:border-surface-700 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const link = (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
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
      </div>
    </aside>
  );
}
