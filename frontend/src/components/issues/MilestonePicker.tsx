import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, X, Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IssueMilestone } from '@/types';

interface MilestonePickerProps {
  milestones: IssueMilestone[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreate?: (data: { title: string; description?: string; dueOn?: string }) => void;
  className?: string;
}

export function MilestonePicker({ milestones, selectedId, onSelect, onCreate, className }: MilestonePickerProps) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const filtered = useMemo(() =>
    milestones.filter(m => m.title.toLowerCase().includes(search.toLowerCase())),
    [milestones, search]
  );

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreate?.({ title: newTitle.trim(), dueOn: newDueDate || undefined });
    setNewTitle('');
    setNewDueDate('');
    setShowCreate(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter milestones..."
          className="w-full pl-9 pr-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
            !selectedId && 'bg-accent/10'
          )}
        >
          <div className={cn(
            'w-3.5 h-3.5 rounded border flex items-center justify-center',
            !selectedId ? 'bg-accent border-accent' : 'border-border'
          )}>
            {!selectedId && <Check size={10} className="text-primary-dark" />}
          </div>
          <span className="text-text-muted">No milestone</span>
        </button>
        {filtered.length === 0 ? (
          <div className="py-4 text-center text-sm text-text-muted">
            {search ? 'No milestones found' : 'No milestones yet'}
          </div>
        ) : (
          filtered.map(milestone => {
            const isSelected = selectedId === milestone.id;
            return (
              <button
                key={milestone.id}
                onClick={() => onSelect(isSelected ? null : milestone.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
                  isSelected && 'bg-accent/10'
                )}
              >
                <div className={cn(
                  'w-3.5 h-3.5 rounded border flex items-center justify-center',
                  isSelected ? 'bg-accent border-accent' : 'border-border'
                )}>
                  {isSelected && <Check size={10} className="text-primary-dark" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary truncate">{milestone.title}</span>
                    {milestone.dueOn && (
                      <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={10} />{new Date(milestone.dueOn).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-primary-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <span className="text-2xs text-text-muted">{milestone.closedIssueCount}/{milestone.openIssueCount + milestone.closedIssueCount}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {onCreate && (
        <div className="pt-2 border-t border-border">
          {showCreate ? (
            <div className="space-y-2 animate-slide-down">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Milestone title"
                className="w-full px-2 py-1.5 bg-primary-dark border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-primary-dark border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} disabled={!newTitle.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-primary-dark rounded-md hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
                  <Plus size={12} /> Create
                </button>
                <button onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/60 transition-colors w-full"
            >
              <Plus size={14} /> Create milestone
            </button>
          )}
        </div>
      )}
    </div>
  );
}
