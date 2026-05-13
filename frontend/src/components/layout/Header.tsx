import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@stores/authStore';
import { useThemeStore } from '@stores/themeStore';
import { useNotificationStore } from '@stores/notificationStore';
import { VeteranSearchBar } from '@ui/VeteranSearchBar';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranDropdown } from '@ui/VeteranDropdown';
import { VeteranTooltip } from '@ui/VeteranTooltip';
import {
  Bell,
  Moon,
  Sun,
  Plus,
  GitFork,
  LogOut,
  Settings,
  User,
  HelpCircle,
  Command,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  onCommandPalette?: () => void;
}

export function Header({ onMenuClick, onCommandPalette }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))]/80 backdrop-blur-lg">
      <div className="flex items-center h-full px-4 gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veteran-500 to-brand-500 flex items-center justify-center">
            <GitFork className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">VETERAN</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <VeteranSearchBar
            value=""
            onChange={() => {}}
            placeholder="Search repositories, issues, pull requests..."
            className="hidden sm:block"
            suggestions={[]}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {user && (
            <VeteranTooltip content="Create new...">
              <VeteranDropdown
                trigger={
                  <button className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                }
                items={[
                  { id: 'new-repo', label: 'New repository', icon: <GitFork className="w-4 h-4" />, onClick: () => {} },
                  { id: 'new-org', label: 'New organization', icon: <User className="w-4 h-4" />, onClick: () => {} },
                ]}
              />
            </VeteranTooltip>
          )}

          <VeteranTooltip content={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </VeteranTooltip>

          <VeteranTooltip content="Command palette">
            <button
              onClick={onCommandPalette}
              className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors hidden sm:flex items-center gap-1"
            >
              <Command className="w-4 h-4" />
              <kbd className="text-2xs px-1 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono hidden md:inline">⌘K</kbd>
            </button>
          </VeteranTooltip>

          {user ? (
            <>
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-2xs flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <VeteranDropdown
                trigger={
                  <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                    <VeteranAvatar src={user.avatar_url} name={user.name || user.username} size="sm" />
                    <span className="text-sm font-medium text-[rgb(var(--veteran-fg))] hidden md:block max-w-[120px] truncate">
                      {user.name || user.username}
                    </span>
                  </button>
                }
                align="end"
                items={[
                  {
                    id: 'profile',
                    label: 'Profile',
                    icon: <User className="w-4 h-4" />,
                    onClick: () => {},
                  },
                  {
                    id: 'settings',
                    label: 'Settings',
                    icon: <Settings className="w-4 h-4" />,
                    onClick: () => {},
                  },
                  { id: 'divider-1', label: '', divider: true },
                  {
                    id: 'help',
                    label: 'Help',
                    icon: <HelpCircle className="w-4 h-4" />,
                    onClick: () => {},
                  },
                  { id: 'divider-2', label: '', divider: true },
                  {
                    id: 'logout',
                    label: 'Sign out',
                    icon: <LogOut className="w-4 h-4" />,
                    danger: true,
                    onClick: logout,
                  },
                ]}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm font-medium bg-veteran-600 text-white rounded-lg hover:bg-veteran-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
