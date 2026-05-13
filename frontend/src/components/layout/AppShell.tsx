import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { Footer } from './Footer';
import { AICopilot } from '../shared/AICopilot';
import { Toaster } from 'react-hot-toast';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[rgb(var(--veteran-bg))]">
      <Header
        onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - visible on desktop, toggleable on mobile */}
        <div
          className={cn(
            'hidden lg:flex flex-shrink-0',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72">
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children || <Outlet />}
          </div>
          <Footer />
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* AI Copilot */}
      <AICopilot />

      {/* Global keyboard shortcut for command palette */}
      <div
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(!commandPaletteOpen);
          }
        }}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-[rgb(var(--veteran-bg))] !text-[rgb(var(--veteran-fg))] !border !border-surface-200 dark:!border-surface-700 !shadow-lg',
          duration: 4000,
        }}
      />
    </div>
  );
}
