import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
  content: ReactNode;
};

export interface VeteranTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
}

export function VeteranTabs({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  variant = 'underline',
  className,
  tabListClassName,
  tabPanelClassName,
}: VeteranTabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id || '');
  const activeId = controlledTab ?? internalTab;

  const handleChange = (id: string) => {
    if (id !== activeId) {
      setInternalTab(id);
      onChange?.(id);
    }
  };

  const activeTabContent = tabs.find((t) => t.id === activeId)?.content;

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className={cn(
          'flex overflow-x-auto scrollbar-thin',
          variant === 'underline'
            ? 'border-b border-surface-200 dark:border-surface-700 gap-0'
            : 'gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg',
          tabListClassName
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-colors',
                tab.disabled && 'opacity-50 cursor-not-allowed',
                variant === 'underline'
                  ? 'px-4 py-3 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  : 'px-4 py-2 rounded-md text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100',
                isActive && variant === 'underline' && 'text-veteran-600 dark:text-veteran-400',
                isActive && variant === 'pills' && 'text-veteran-700 dark:text-veteran-300 bg-[rgb(var(--veteran-bg))] shadow-sm'
              )}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-2xs font-semibold',
                    isActive
                      ? 'bg-veteran-100 dark:bg-veteran-900/40 text-veteran-700 dark:text-veteran-400'
                      : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && variant === 'underline' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-veteran-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className={cn('mt-4', tabPanelClassName)} role="tabpanel">
        {activeTabContent}
      </div>
    </div>
  );
}
