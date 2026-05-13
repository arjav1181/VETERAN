import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, File, FileText,
  Search, MoreVertical, Download, GitCommit, Copy, ExternalLink,
} from 'lucide-react';
import { cn, formatFileSize, formatRelativeTime, getFileExtension, getSetiIcon } from '@/lib/utils';
import { SearchBar } from '@/components/shared/SearchBar';

interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
  lastCommit?: { message: string; date: string };
}

interface FileTreeProps {
  files: FileTreeItem[];
  onFileSelect: (path: string) => void;
  onDirToggle?: (path: string, expanded: boolean) => void;
  loading?: boolean;
  selectedPath?: string;
  className?: string;
}

function FileIcon({ name, type }: { name: string; type: string }) {
  if (type === 'dir') return <Folder size={16} className="text-info shrink-0" />;
  const ext = getFileExtension(name);
  const iconMap: Record<string, string> = {
    js: 'text-warning', ts: 'text-info', tsx: 'text-info', jsx: 'text-warning',
    py: 'text-warning', rs: 'text-orange-400', go: 'text-info', java: 'text-danger',
    html: 'text-danger', css: 'text-purple-400', scss: 'text-pink-400',
    json: 'text-text-muted', md: 'text-info', yml: 'text-danger', yaml: 'text-danger',
    svg: 'text-warning', png: 'text-purple-400', jpg: 'text-success', gif: 'text-brand-500',
    lock: 'text-text-muted', toml: 'text-text-muted', sh: 'text-success',
  };
  if (name === 'Dockerfile') return <FileText size={16} className="text-info shrink-0" />;
  if (name === '.gitignore') return <FileText size={16} className="text-text-muted shrink-0" />;
  return <File size={16} className={cn(iconMap[ext] || 'text-text-muted', 'shrink-0')} />;
}

function ContextMenu({ x, y, item, onClose }: { x: number; y: number; item: FileTreeItem; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-56 rounded-lg border border-border bg-surface shadow-2xl py-1 animate-scale-in"
      style={{ left: x, top: y }}
    >
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface/80 transition-colors">
        <Copy size={14} /> Copy Path
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface/80 transition-colors">
        <Copy size={14} /> Copy Permalink
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface/80 transition-colors">
        <GitCommit size={14} /> View History
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface/80 transition-colors">
        <Download size={14} /> Download
      </button>
      {item.type === 'dir' && (
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface/80 transition-colors">
          <ExternalLink size={14} /> Open in New Tab
        </button>
      )}
    </div>
  );
}

function TreeRow({
  item, depth, selected, onSelect, onContextMenu, onToggle,
}: {
  item: FileTreeItem & { children?: FileTreeItem[]; expanded?: boolean; loading?: boolean };
  depth: number; selected: boolean; onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggle: () => void;
}) {
  const isDir = item.type === 'dir';

  return (
    <div
      className={cn(
        'group flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors text-sm',
        'hover:bg-surface/60',
        selected ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'border-l-2 border-transparent text-text-primary',
      )}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onClick={isDir ? onToggle : onSelect}
      onContextMenu={onContextMenu}
    >
      {isDir ? (
        <span className="text-text-muted shrink-0">
          {item.loading ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : item.expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </span>
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
      <FileIcon name={item.name} type={item.type} />
      <span className="truncate flex-1 ml-1">{item.name}</span>
      {!isDir && item.size > 0 && (
        <span className="text-2xs text-text-muted hidden sm:inline mr-2">{formatFileSize(item.size)}</span>
      )}
      {item.lastCommit && (
        <span className="text-2xs text-text-muted truncate max-w-[120px] hidden md:inline group-hover:block" title={item.lastCommit.message}>
          {item.lastCommit.message}
        </span>
      )}
      {!isDir && item.lastCommit && (
        <span className="text-2xs text-text-muted hidden lg:inline shrink-0">{formatRelativeTime(item.lastCommit.date)}</span>
      )}
    </div>
  );
}

export function FileTree({
  files,
  onFileSelect,
  onDirToggle,
  loading = false,
  selectedPath,
  className,
}: FileTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileTreeItem } | null>(null);
  const [localLoading, setLocalLoading] = useState<Set<string>>(new Set());

  const toggleDir = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else {
        next.add(path);
        setLocalLoading(prev => new Set(prev).add(path));
        setTimeout(() => setLocalLoading(prev => { const n = new Set(prev); n.delete(path); return n; }), 500);
      }
      return next;
    });
    onDirToggle?.(path, !expandedPaths.has(path));
  }, [expandedPaths, onDirToggle]);

  const filteredFiles = useCallback((items: FileTreeItem[]): FileTreeItem[] => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderTree = (items: FileTreeItem[], depth = 0): React.ReactNode => {
    const sorted = [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map((item) => {
      const isExpanded = expandedPaths.has(item.path);
      const isSelected = selectedPath === item.path;
      const children = (item as FileTreeItem & { children?: FileTreeItem[] }).children;

      return (
        <div key={item.path}>
          <TreeRow
            item={{
              ...item,
              expanded: isExpanded,
              loading: localLoading.has(item.path),
              children,
            }}
            depth={depth}
            selected={isSelected}
            onSelect={() => onFileSelect(item.path)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY, item });
            }}
            onToggle={() => toggleDir(item.path)}
          />
          {isExpanded && children && (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {renderTree(children, depth + 1)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={cn('border border-border rounded-lg bg-primary-dark', className)}>
        <div className="p-3 border-b border-border">
          <div className="h-8 bg-surface rounded animate-pulse" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2" style={{ paddingLeft: `${16 + (i % 4) * 16}px` }}>
            <div className="w-4 h-4 bg-surface rounded animate-pulse" />
            <div className="h-4 bg-surface rounded animate-pulse" style={{ width: `${60 + Math.random() * 100}px` }} />
          </div>
        ))}
      </div>
    );
  }

  const buildTree = (flatFiles: FileTreeItem[]): (FileTreeItem & { children?: FileTreeItem[] })[] => {
    const tree: (FileTreeItem & { children?: FileTreeItem[] })[] = [];
    const map = new Map<string, FileTreeItem & { children?: FileTreeItem[] }>();

    flatFiles.forEach(f => map.set(f.path, { ...f, children: f.type === 'dir' ? [] : undefined }));

    flatFiles.forEach(f => {
      const parts = f.path.split('/');
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = map.get(parentPath);
        if (parent && parent.children) {
          const node = map.get(f.path)!;
          if (!parent.children.find(c => c.path === f.path)) {
            parent.children.push(node);
          }
          if (f.type === 'dir') return;
        }
      }
      if (parts.length === 1 || !map.get(parts.slice(0, -1).join('/'))) {
        const node = map.get(f.path)!;
        if (!tree.find(c => c.path === f.path)) {
          tree.push(node);
        }
      }
    });

    return tree;
  };

  const treeData = buildTree(files);
  const filtered = filteredFiles(treeData);

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-3 border-b border-border">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Find file..."
        />
      </div>
      <div className="overflow-y-auto max-h-[600px]" onContextMenu={(e) => e.preventDefault()}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        ) : (
          renderTree(filtered)
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
