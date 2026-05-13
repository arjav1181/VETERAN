import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Search, ChevronRight } from 'lucide-react';

export type DropdownItem = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  rightContent?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  children?: DropdownItem[];
};

export interface VeteranDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  searchable?: boolean;
  className?: string;
  menuClassName?: string;
  maxHeight?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export function VeteranDropdown({
  trigger,
  items,
  align = 'start',
  side = 'bottom',
  searchable,
  className,
  menuClassName,
  maxHeight = 300,
  onOpen,
  onClose,
}: VeteranDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = search
    ? items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()) && !item.divider)
    : items;

  const flatItems = filteredItems.filter((item) => !item.divider);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && flatItems[activeIndex] && !flatItems[activeIndex].disabled) {
            flatItems[activeIndex].onClick?.();
            setIsOpen(false);
          }
          break;
      }
    },
    [flatItems, activeIndex]
  );

  return (
    <div className={cn('relative inline-block', className)}>
      <div ref={triggerRef} onClick={() => { setIsOpen(!isOpen); if (!isOpen) onOpen?.(); }}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 min-w-[200px] rounded-lg border border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] shadow-xl',
              side === 'bottom' ? 'mt-1' : 'bottom-full mb-1',
              align === 'end' ? 'right-0' : 'left-0',
              menuClassName
            )}
            onKeyDown={handleKeyDown}
          >
            {searchable && (
              <div className="p-2 border-b border-surface-200 dark:border-surface-700">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setActiveIndex(-1); }}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 focus:outline-none focus:ring-1 focus:ring-veteran-500"
                  />
                </div>
              </div>
            )}

            <div className="py-1 overflow-y-auto scrollbar-thin" style={{ maxHeight }}>
              {flatItems.length === 0 ? (
                <div className="px-3 py-2 text-sm text-surface-400 text-center">No results</div>
              ) : (
                flatItems.map((item, index) => (
                  <div key={item.id}>
                    {item.divider ? (
                      <div className="my-1 border-t border-surface-200 dark:border-surface-700" />
                    ) : (
                      <button
                        onClick={() => {
                          if (!item.disabled) {
                            item.onClick?.();
                            if (!item.children) setIsOpen(false);
                          }
                        }}
                        disabled={item.disabled}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                          item.danger ? 'text-red-600 dark:text-red-400' : 'text-surface-700 dark:text-surface-300',
                          index === activeIndex && 'bg-surface-100 dark:bg-surface-800',
                          !item.disabled && 'hover:bg-surface-100 dark:hover:bg-surface-800',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-surface-400 truncate">{item.description}</div>
                          )}
                        </div>
                        {item.rightContent && (
                          <span className="flex-shrink-0">{item.rightContent}</span>
                        )}
                        {item.children && (
                          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
