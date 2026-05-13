import { Search, X, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value, onChange, placeholder = 'Search...', className, onClear, autoFocus,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={cn(
        'relative flex items-center transition-all duration-200',
        focused ? 'ring-2 ring-accent/50 border-accent' : 'border-border',
        'border rounded-lg bg-surface',
        className
      )}
    >
      <Search size={16} className="absolute left-3 text-text-muted pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent py-2 pl-9 pr-8 text-sm text-text-primary placeholder-text-muted focus:outline-none"
      />
      {value ? (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2 p-0.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      ) : (
        <kbd className="absolute right-2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs text-text-muted bg-primary-dark rounded border border-border">
          <Command size={10} />K
        </kbd>
      )}
    </div>
  );
}
