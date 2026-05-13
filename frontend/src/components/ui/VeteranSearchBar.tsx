import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  values: string[];
}

export interface VeteranSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
  autoFocus?: boolean;
  loading?: boolean;
}

export function VeteranSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  filters,
  onFilterChange,
  suggestions = [],
  recentSearches = [],
  className,
  autoFocus,
  loading,
}: VeteranSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
        setActiveFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuggestions =
    isFocused && value.length === 0 && (suggestions.length > 0 || recentSearches.length > 0);

  const handleSubmit = useCallback(
    (e?: React.KeyboardEvent) => {
      if (e?.key === 'Enter') {
        onSubmit?.(value);
        setShowDropdown(false);
      }
    },
    [value, onSubmit]
  );

  const handleFilterSelect = (filterId: string, value: string) => {
    const updated = { ...activeFilters, [filterId]: value };
    setActiveFilters(updated);
    onFilterChange?.(updated);
    setActiveFilter(null);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          isFocused
            ? 'border-veteran-500 ring-2 ring-veteran-500/20'
            : 'border-surface-300 dark:border-surface-600',
          'bg-[rgb(var(--veteran-bg))]'
        )}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-veteran-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-surface-400 flex-shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setIsFocused(true); setShowDropdown(true); }}
          onKeyDown={handleSubmit}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[rgb(var(--veteran-fg))] placeholder-surface-400 outline-none min-w-0"
          autoFocus={autoFocus}
        />

        {filters && filters.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setActiveFilter(activeFilter ? null : filters[0]?.id || null)}
              className="p-1 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <Filter className="w-4 h-4" />
            </button>
            {activeFilter && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] shadow-lg py-1">
                {filters
                  .find((f) => f.id === activeFilter)
                  ?.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleFilterSelect(activeFilter, val)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-surface-100 dark:hover:bg-surface-800',
                        activeFilters[activeFilter] === val && 'text-veteran-600 dark:text-veteran-400'
                      )}
                    >
                      {val}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="p-1 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-lg border border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] shadow-xl overflow-hidden"
          >
            {recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange(search); inputRef.current?.focus(); }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-2 border-t border-surface-200 dark:border-surface-700">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange(suggestion); inputRef.current?.focus(); }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showDropdown && value && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute z-50 w-full mt-1 rounded-lg border border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))] shadow-xl overflow-hidden p-2"
        >
          {suggestions
            .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 8)
            .map((suggestion, i) => (
              <button
                key={i}
                onClick={() => { onChange(suggestion); onSubmit?.(suggestion); setShowDropdown(false); }}
                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300"
              >
                {suggestion}
              </button>
            ))}
        </motion.div>
      )}
    </div>
  );
}
