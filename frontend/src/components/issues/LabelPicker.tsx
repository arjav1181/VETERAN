import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IssueLabel } from '@/types';

interface LabelPickerProps {
  labels: IssueLabel[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onCreate?: (label: { name: string; color: string; description?: string }) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#E8B84B', '#F85149', '#3FB950', '#58A6FF', '#D29922',
  '#BC8CFF', '#F778BA', '#79C0FF', '#7EE787', '#FFA657',
];

export function LabelPicker({ labels, selectedIds, onSelect, onCreate, className }: LabelPickerProps) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newDescription, setNewDescription] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() =>
    labels.filter(l => l.name.toLowerCase().includes(search.toLowerCase())),
    [labels, search]
  );

  const toggleLabel = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(s => s !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate?.({ name: newName.trim(), color: newColor, description: newDescription || undefined });
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setNewDescription('');
    setShowCreate(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter labels..."
          className="w-full pl-9 pr-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-4 text-center text-sm text-text-muted">
            {search ? 'No labels found' : 'No labels yet'}
          </div>
        ) : (
          filtered.map(label => {
            const isSelected = selectedIds.includes(label.id);
            return (
              <button
                key={label.id}
                onClick={() => toggleLabel(label.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
                  isSelected ? 'bg-accent/10' : 'hover:bg-surface/60'
                )}
              >
                <div
                  className={cn(
                    'w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors',
                    isSelected ? 'bg-accent border-accent' : 'border-border'
                  )}
                >
                  {isSelected && <Check size={10} className="text-primary-dark" />}
                </div>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 text-text-primary truncate">{label.name}</span>
                {label.description && (
                  <span className="text-xs text-text-muted truncate max-w-[120px] hidden sm:inline">{label.description}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {onCreate && (
        <div className="mt-2 pt-2 border-t border-border">
          {showCreate ? (
            <div className="space-y-2 animate-slide-down">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name"
                className="w-full px-2 py-1.5 bg-primary-dark border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-2 py-1.5 bg-primary-dark border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      'w-5 h-5 rounded-full transition-all',
                      newColor === color ? 'ring-2 ring-accent scale-110' : 'ring-1 ring-border'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-primary-dark rounded-md hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
                >
                  <Plus size={12} /> Create
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/60 transition-colors w-full"
            >
              <Plus size={14} /> Create new label
            </button>
          )}
        </div>
      )}
    </div>
  );
}
