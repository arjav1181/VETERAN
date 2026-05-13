import { useState, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import {
  Terminal, FileText, GitBranch, Search, Settings, PanelLeft, Folder,
  PanelBottom, PanelRight, X, Menu, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
});

interface CodespaceIDEProps {
  files: { name: string; path: string; content: string; language?: string }[];
  onFileChange?: (path: string, content: string) => void;
  className?: string;
}

const FILE_TREE: Record<string, string[]> = {
  'src': ['App.tsx', 'main.tsx', 'index.css'],
  'src/components': ['Header.tsx', 'Sidebar.tsx'],
  'public': ['index.html'],
  '.': ['package.json', 'tsconfig.json', 'vite.config.ts'],
};

export function CodespaceIDE({ files, onFileChange, className }: CodespaceIDEProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.path || '');
  const [showExplorer, setShowExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(Object.keys(FILE_TREE)));
  const [terminalLines] = useState([
    '$ npm run dev',
    '> project@1.0.0 dev',
    '> vite --port 3000',
    '',
    '  VITE v5.2.0  ready in 300ms',
    '',
    '  ➜  Local:   http://localhost:3000/',
    '  ➜  Network: http://192.168.1.5:3000/',
  ]);

  const currentFile = files.find(f => f.path === activeFile);

  const handleFileChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeFile) {
      onFileChange?.(activeFile, value);
    }
  }, [activeFile, onFileChange]);

  const toggleDir = (dir: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  };

  return (
    <div className={cn('h-full flex flex-col bg-primary-dark', className)}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={cn('p-1 rounded transition-colors', showExplorer ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary')}
          >
            <Menu size={16} />
          </button>
          <span className="text-sm text-text-primary font-medium">codespace - {activeFile.split('/').pop() || 'Untitled'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"><Search size={14} /></button>
          <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors">
            <GitBranch size={14} />
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={cn('p-1 rounded transition-colors', showTerminal ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary')}
          >
            <PanelBottom size={14} />
          </button>
          <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"><Settings size={14} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showExplorer && (
          <div className="w-56 border-r border-border bg-surface flex flex-col shrink-0">
            <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border">
              Explorer
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {Object.entries(FILE_TREE).map(([dir, dirFiles]) => (
                <div key={dir}>
                  <button
                    onClick={() => toggleDir(dir)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:bg-surface/80 w-full text-left transition-colors"
                  >
                    <ChevronDown size={12} className={cn('transition-transform', !expandedDirs.has(dir) && '-rotate-90')} />
                    <Folder size={12} className="text-info" />
                    {dir === '.' ? '/' : dir}
                  </button>
                  {expandedDirs.has(dir) && dirFiles.map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveFile(`${dir === '.' ? '' : dir}/${f}`)}
                      className={cn(
                        'flex items-center gap-1.5 pl-6 pr-2 py-1 text-xs w-full text-left transition-colors',
                        activeFile === `${dir === '.' ? '' : dir}/${f}` ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface/80'
                      )}
                    >
                      <FileText size={12} />
                      {f}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center bg-surface border-b border-border overflow-x-auto">
            {files.map(f => (
              <button
                key={f.path}
                onClick={() => setActiveFile(f.path)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-border transition-colors',
                  activeFile === f.path ? 'bg-primary-dark text-text-primary' : 'text-text-muted hover:text-text-primary bg-surface'
                )}
              >
                <FileText size={12} />
                {f.name}
                <X size={12} className="ml-1 hover:text-danger" />
              </button>
            ))}
          </div>

          <div className="flex-1">
            {currentFile ? (
              <Editor
                key={currentFile.path}
                language={currentFile.language || 'typescript'}
                value={currentFile.content}
                onChange={handleFileChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 2,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontLigatures: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                <FileText size={32} className="opacity-30 mb-2" />
                <p>No file open</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTerminal && (
        <div className="h-48 border-t border-border bg-[#1e1e1e] flex flex-col">
          <div className="flex items-center justify-between px-3 py-1 bg-surface">
            <span className="text-xs text-text-muted">TERMINAL</span>
            <button onClick={() => setShowTerminal(false)} className="p-0.5 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-5">
            {terminalLines.map((line, i) => (
              <div key={i} className={cn(
                line.startsWith('$') ? 'text-text-primary' : 'text-text-secondary',
                line.includes('error') && 'text-danger',
                line.includes('ready') && 'text-success',
              )}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
