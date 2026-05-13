import { useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileType,
  Image,
  FileText,
  FileArchive,
} from 'lucide-react';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
  icon?: ReactNode;
  meta?: string;
  language?: string;
}

interface FileIconProps {
  name: string;
  language?: string;
  className?: string;
}

function getFileIcon(name: string, language?: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = 'w-4 h-4';

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode className={cn(iconClass, 'text-blue-500')} />;
    case 'js':
    case 'jsx':
      return <FileCode className={cn(iconClass, 'text-yellow-500')} />;
    case 'json':
      return <FileJson className={cn(iconClass, 'text-green-500')} />;
    case 'css':
    case 'scss':
    case 'sass':
      return <FileType className={cn(iconClass, 'text-pink-500')} />;
    case 'html':
      return <FileCode className={cn(iconClass, 'text-orange-500')} />;
    case 'md':
    case 'mdx':
      return <FileText className={cn(iconClass, 'text-blue-400')} />;
    case 'py':
      return <FileCode className={cn(iconClass, 'text-blue-600')} />;
    case 'rs':
      return <FileCode className={cn(iconClass, 'text-orange-600')} />;
    case 'go':
      return <FileCode className={cn(iconClass, 'text-cyan-500')} />;
    case 'java':
      return <FileCode className={cn(iconClass, 'text-red-500')} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'ico':
      return <Image className={cn(iconClass, 'text-purple-500')} />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <FileArchive className={cn(iconClass, 'text-amber-500')} />;
    case 'yml':
    case 'yaml':
      return <FileCode className={cn(iconClass, 'text-red-400')} />;
    case 'toml':
      return <FileCode className={cn(iconClass, 'text-amber-600')} />;
    case 'lock':
      return <FileArchive className={cn(iconClass, 'text-surface-400')} />;
    default:
      return <File className={cn(iconClass, 'text-surface-400')} />;
  }
}

function TreeNode({
  node,
  depth = 0,
  selectedPath,
  onSelect,
  searchQuery,
}: {
  node: FileTreeNode;
  depth?: number;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  searchQuery?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = node.type === 'folder';
  const isSelected = selectedPath === node.path;

  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  if (searchQuery && !matchesSearch && node.children) {
    const childMatches = node.children.some(
      (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.children?.some((gc) => gc.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    if (!childMatches) return null;
  }

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          }
          onSelect?.(node.path);
        }}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md cursor-pointer transition-colors',
          'hover:bg-surface-100 dark:hover:bg-surface-800',
          isSelected && 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-300'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <span className="flex-shrink-0 text-surface-400">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        {isFolder ? (
          expanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )
        ) : (
          node.icon || getFileIcon(node.name, node.language)
        )}

        <span className="flex-1 truncate">{node.name}</span>

        {node.meta && (
          <span className="text-xs text-surface-400 flex-shrink-0">{node.meta}</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isFolder && expanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface VeteranFileTreeProps {
  nodes: FileTreeNode[];
  selectedPath?: string;
  onSelect?: (path: string) => void;
  searchQuery?: string;
  className?: string;
}

export function VeteranFileTree({ nodes, selectedPath, onSelect, searchQuery, className }: VeteranFileTreeProps) {
  return (
    <div className={cn('overflow-y-auto scrollbar-thin', className)}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
