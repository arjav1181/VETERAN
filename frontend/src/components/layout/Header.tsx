import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranTooltip } from '@ui/VeteranTooltip';
import { getRepoParams } from '@lib/route-utils';
import {
  Search,
  Plus,
  Bell,
  GitFork,
  GitPullRequest,
  Play,
  User,
  BookOpen,
  Star,
  Settings,
  LogOut,
  Command,
  Building2,
  Laptop,
  Zap,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  onCommandPalette?: () => void;
}

const createMenuItems = [
  {
    id: 'new-repo',
    label: 'New repository',
    icon: GitFork,
    description: 'Create a new Git repository',
    onClick: () => window.location.href = '/new',
  },
  {
    id: 'new-org',
    label: 'New organization',
    icon: Building2,
    description: 'Create a new organization',
    onClick: () => window.location.href = '/organizations/new',
  },
  {
    id: 'new-issue',
    label: 'New issue',
    icon: BookOpen,
    description: 'Create a new issue',
    onClick: () => {},
  },
  {
    id: 'new-codespace',
    label: 'New codespace',
    icon: Laptop,
    description: 'Create a new codespace',
    onClick: () => {},
  },
];

export function Header({ onMenuClick, onCommandPalette }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isRepoPage = /^\/[^/]+\/[^/]+/.test(location.pathname);
  const repoParams = isRepoPage ? getRepoParams() : null;
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isRepoPage) {
          searchRef.current?.focus();
        } else {
          onCommandPalette?.();
        }
      }
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setCreateMenuOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPalette, isRepoPage]);

  if (isLanding) return null;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8B84B] to-[#E8B84B]/60 rounded-lg rotate-3 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute inset-0 bg-[#1C2128] rounded-lg flex items-center justify-center border border-[#30363D]">
              <GitFork className="w-4 h-4 text-[#E8B84B]" />
            </div>
          </div>
          <span className="font-bold text-base text-[#E6EDF3] hidden sm:inline tracking-tight">VETERAN</span>
        </Link>

        {isRepoPage && repoParams && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 text-sm">
            <span className="text-[#484F58]">/</span>
            <Link
              to={`/${repoParams.owner}`}
              className="text-[#8D96A0] hover:text-[#4493F8] transition-colors font-medium"
            >
              {repoParams.owner}
            </Link>
            <span className="text-[#484F58]">/</span>
            <Link
              to={`/${repoParams.owner}/${repoParams.repo}`}
              className="text-[#E6EDF3] hover:text-[#4493F8] transition-colors font-semibold"
            >
              {repoParams.repo}
            </Link>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative w-full max-w-lg">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200',
                searchFocused
                  ? 'border-[#E8B84B] ring-1 ring-[#E8B84B]/20 w-full'
                  : 'border-[#30363D] w-full',
                'bg-[#161B22]'
              )}
            >
              <Search className="w-4 h-4 text-[#484F58] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search repositories, issues, pull requests..."
                className="flex-1 bg-transparent text-sm text-[#E6EDF3] placeholder-[#484F58] outline-none min-w-0"
              />
              {!searchFocused && !searchValue && (
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#484F58] bg-[#1C2128] border border-[#30363D]">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {user && (
            <div ref={createMenuRef} className="relative">
              <VeteranTooltip content="Create new...">
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    createMenuOpen
                      ? 'bg-[#1C2128] text-[#E6EDF3]'
                      : 'text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3]'
                  )}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </VeteranTooltip>
              <AnimatePresence>
                {createMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 z-50 min-w-[220px] rounded-lg border border-[#30363D] bg-[#161B22] shadow-xl py-1 overflow-hidden"
                  >
                    {createMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { item.onClick(); setCreateMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-[#E6EDF3] hover:bg-[#1C2128] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-md bg-[#1C2128] border border-[#30363D] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#8D96A0]" />
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-[#8D96A0] mt-0.5">{item.description}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user && (
            <>
              <VeteranTooltip content="Issues">
                <Link
                  to="/dashboard?tab=issues"
                  className="p-2 rounded-lg text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                </Link>
              </VeteranTooltip>
              <VeteranTooltip content="Pull Requests">
                <Link
                  to="/dashboard?tab=pulls"
                  className="p-2 rounded-lg text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors"
                >
                  <GitPullRequest className="w-5 h-5" />
                </Link>
              </VeteranTooltip>
              <VeteranTooltip content="Actions">
                <Link
                  to="/dashboard?tab=actions"
                  className="p-2 rounded-lg text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors"
                >
                  <Play className="w-5 h-5" />
                </Link>
              </VeteranTooltip>
            </>
          )}

          <VeteranTooltip content={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-[#8D96A0] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-[#F85149] text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </Link>
          </VeteranTooltip>

          {user ? (
            <div ref={userMenuRef} className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  'flex items-center gap-2 p-1 rounded-lg transition-colors',
                  userMenuOpen ? 'bg-[#1C2128]' : 'hover:bg-[#1C2128]'
                )}
              >
                <VeteranAvatar
                  src={user.avatarUrl}
                  name={user.displayName || user.username}
                  size="sm"
                />
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 text-[#484F58] transition-transform duration-150',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 z-50 w-[240px] rounded-lg border border-[#30363D] bg-[#161B22] shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#30363D]">
                      <div className="flex items-center gap-3">
                        <VeteranAvatar
                          src={user.avatarUrl}
                          name={user.displayName || user.username}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#E6EDF3] truncate">
                            {user.displayName || user.username}
                          </div>
                          <div className="text-xs text-[#8D96A0] truncate">@{user.username}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <MenuItem icon={User} label="Your profile" onClick={() => window.location.href = `/${user.username}`} />
                      <MenuItem icon={GitFork} label="Your repositories" onClick={() => window.location.href = '/dashboard?tab=repos'} />
                      <MenuItem icon={Laptop} label="Your codespaces" onClick={() => window.location.href = '/codespaces'} />
                      <MenuItem icon={Building2} label="Your organizations" onClick={() => window.location.href = '/dashboard?tab=orgs'} />
                      <MenuItem icon={BookOpen} label="Your projects" onClick={() => window.location.href = '/dashboard?tab=projects'} />
                      <MenuItem icon={Star} label="Your stars" onClick={() => window.location.href = `/${user.username}?tab=stars`} />
                    </div>

                    <div className="border-t border-[#30363D] py-1">
                      <MenuItem icon={Sparkles} label="Feature preview" />
                    </div>

                    <div className="border-t border-[#30363D] py-1">
                      <MenuItem icon={Settings} label="Settings" onClick={() => window.location.href = '/settings'} />
                    </div>

                    <div className="border-t border-[#30363D] py-1">
                      <MenuItem
                        icon={LogOut}
                        label="Sign out"
                        danger
                        onClick={() => { logout(); window.location.href = '/'; }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-[#8D96A0] hover:text-[#E6EDF3] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm font-semibold bg-[#E8B84B] text-[#0D1117] rounded-lg hover:bg-[#E8B84B]/90 transition-colors"
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

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
        danger
          ? 'text-[#F85149] hover:bg-[#F85149]/10'
          : 'text-[#E6EDF3] hover:bg-[#1C2128]'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', danger ? 'text-[#F85149]' : 'text-[#8D96A0]')} />
      <span>{label}</span>
    </button>
  );
}
