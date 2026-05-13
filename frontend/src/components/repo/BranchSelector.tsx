import { useState, useMemo, useEffect, useRef } from 'react';
import { GitBranch, Tag, Search, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Branch, Tag as TagType } from '@/types';

interface BranchSelectorProps {
  branches: Branch[];
  tags: TagType[];
  currentBranch: string;
  onSelectBranch: (name: string) => void;
  onSelectTag?: (name: string) => void;
  className?: string;
}

export function BranchSelector({
  branches, tags, currentBranch, onSelectBranch, onSelectTag, className,
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'branches' | 'tags'>('branches');
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredBranches = useMemo(() =>
    branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [branches, search]
  );

  const filteredTags = useMemo(() =>
    tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase())),
    [tags, search]
  );

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg hover:bg-surface/80 transition-colors text-text-primary"
      >
        <GitBranch size={14} className="text-text-muted" />
        <span className="font-medium">{currentBranch}</span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find branch or tag..."
                className="w-full pl-9 pr-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
            </div>
          </div>

          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('branches')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors',
                tab === 'branches' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'
              )}
            >
              <GitBranch size={14} />
              Branches
            </button>
            <button
              onClick={() => setTab('tags')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors',
                tab === 'tags' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'
              )}
            >
              <Tag size={14} />
              Tags
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {tab === 'branches' && (
              filteredBranches.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">No branches found</div>
              ) : (
                filteredBranches.map(branch => (
                  <button
                    key={branch.name}
                    onClick={() => { onSelectBranch(branch.name); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-surface/60 transition-colors text-left',
                      branch.name === currentBranch && 'bg-accent/5'
                    )}
                  >
                    <GitBranch size={14} className={branch.name === currentBranch ? 'text-accent' : 'text-text-muted'} />
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'block truncate',
                        branch.name === currentBranch ? 'text-accent font-medium' : 'text-text-primary'
                      )}>
                        {branch.name}
                      </span>
                      {branch.aheadBy > 0 || branch.behindBy > 0 ? (
                        <span className="text-xs text-text-muted">
                          {branch.aheadBy > 0 && <span className="text-success">ahead by {branch.aheadBy}</span>}
                          {branch.aheadBy > 0 && branch.behindBy > 0 && ' '}
                          {branch.behindBy > 0 && <span className="text-danger">behind by {branch.behindBy}</span>}
                        </span>
                      ) : null}
                    </div>
                    {branch.name === currentBranch && <Check size={14} className="text-accent shrink-0" />}
                    {branch.isDefault && (
                      <span className="text-2xs text-text-muted border border-border rounded px-1 py-0.5">default</span>
                    )}
                  </button>
                ))
              )
            )}

            {tab === 'tags' && (
              filteredTags.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">No tags found</div>
              ) : (
                filteredTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => { onSelectTag?.(tag.name); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface/60 transition-colors text-left"
                  >
                    <Tag size={14} className="text-text-muted" />
                    <span className="font-mono">{tag.name}</span>
                  </button>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
