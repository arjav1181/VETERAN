import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  GitForkHorizontal,
  Bug,
  GitPullRequest,
  Users,
  Settings,
  Command,
  Home,
  Compass,
  FileCode,
  Star,
  BookOpen,
  Moon,
  Sun,
  LogOut,
  Plus,
} from 'lucide-react';
import { useThemeStore } from '@stores/themeStore';
import { useAuthStore } from '@stores/authStore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const commands: CommandItem[] = [
    { id: 'go-dashboard', label: 'Go to Dashboard', icon: <Home className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/dashboard'); onClose(); }, shortcut: '⌘H' },
    { id: 'go-explore', label: 'Go to Explore', icon: <Compass className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/explore'); onClose(); } },
    { id: 'go-repos', label: 'Go to Repositories', icon: <GitForkHorizontal className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/dashboard?tab=repos'); onClose(); } },
    { id: 'go-issues', label: 'Go to Issues', icon: <Bug className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/dashboard?tab=issues'); onClose(); } },
    { id: 'go-pulls', label: 'Go to Pull Requests', icon: <GitPullRequest className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/dashboard?tab=pulls'); onClose(); } },
    { id: 'go-settings', label: 'Go to Settings', icon: <Settings className="w-4 h-4" />, category: 'Navigation', action: () => { navigate('/settings'); onClose(); } },
    { id: 'new-repo', label: 'New Repository', icon: <Plus className="w-4 h-4" />, category: 'Actions', action: () => { navigate('/new'); onClose(); }, shortcut: '⌘N' },
    { id: 'new-issue', label: 'New Issue', icon: <Bug className="w-4 h-4" />, category: 'Actions', action: () => {} },
    { id: 'new-pr', label: 'New Pull Request', icon: <GitPullRequest className="w-4 h-4" />, category: 'Actions', action: () => {} },
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, category: 'Preferences', action: () => { toggleTheme(); onClose(); }, shortcut: '⌘⇧T' },
    { id: 'sign-out', label: 'Sign Out', icon: <LogOut className="w-4 h-4" />, category: 'Account', action: () => { logout(); onClose(); } },
  ];

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[activeIndex]) {
            filtered[activeIndex].action();
          }
          break;
      }
    },
    [filtered, activeIndex]
  );

  const flatCommands = filtered;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl rounded-xl border border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-surface-200 dark:border-surface-700">
              <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 h-12 bg-transparent text-sm text-[rgb(var(--veteran-fg))] placeholder-surface-400 outline-none"
              />
              <kbd className="text-2xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-400 font-mono">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin p-2" onMouseDown={(e) => e.preventDefault()}>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-surface-400">
                    {category}
                  </div>
                  {items.map((item, index) => {
                    const globalIndex = flatCommands.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                          globalIndex === activeIndex
                            ? 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
                            : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                        )}
                      >
                        <span className="flex-shrink-0 w-5 h-5 text-surface-400">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="text-2xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-400 font-mono">
                            {item.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-surface-400">
                  No commands found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
