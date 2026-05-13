import { useState, useCallback, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import {
  Save, X, Sun, Moon, Type, WrapText, Keyboard, Minimize2,
  Maximize2, GitBranch, UserPlus, MessageSquare,
} from 'lucide-react';
import { cn, getLanguageFromFilename } from '@/lib/utils';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
});

interface CodeEditorProps {
  filename: string;
  content: string;
  onChange?: (content: string) => void;
  onSave?: (content: string, message: string) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  saving?: boolean;
  branches?: string[];
  className?: string;
}

const THEMES: Record<string, { id: string; label: string; color: string }> = {
  'vs-dark': { id: 'vs-dark', label: 'VS Dark', color: '#1e1e1e' },
  dracula: { id: 'dracula', label: 'Dracula', color: '#282a36' },
  nord: { id: 'nord', label: 'Nord', color: '#2e3440' },
  'one-dark': { id: 'one-dark', label: 'One Dark', color: '#282c34' },
  monokai: { id: 'monokai', label: 'Monokai', color: '#272822' },
};

export function CodeEditor({
  filename, content, onChange, onSave, onCancel,
  readOnly = false, saving = false, branches = [], className,
}: CodeEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [selectedTheme, setSelectedTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);
  const [vimMode, setVimMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branches[0] || 'main');
  const [newBranchName, setNewBranchName] = useState('');
  const [coAuthor, setCoAuthor] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const editorRef = useRef<Parameters<Parameters<typeof Editor>[0]['onMount']>[0] | null>(null);

  const language = getLanguageFromFilename(filename);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      onChange?.(value);
    }
  }, [onChange]);

  const handleMount = useCallback((editor: Parameters<Parameters<typeof Editor>[0]['onMount']>[0]) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleSave = useCallback(() => {
    if (showCommitDialog) {
      const msg = newBranchName || commitMessage;
      if (!msg) return;
      onSave?.(editorContent, msg);
    } else {
      setShowCommitDialog(true);
    }
  }, [showCommitDialog, editorContent, onSave, commitMessage, newBranchName]);

  const confirmSave = useCallback(() => {
    if (!commitMessage.trim()) return;
    onSave?.(editorContent, commitMessage);
  }, [editorContent, commitMessage, onSave]);

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-primary-dark', className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface flex-wrap">
        <span className="text-xs text-text-muted font-mono truncate max-w-[200px]">{filename}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setSelectedTheme(key)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all',
                selectedTheme === key ? 'border-accent scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: theme.color }}
              title={theme.label}
            />
          ))}
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <div className="flex items-center gap-1 text-text-muted">
          <Type size={14} />
          <input
            type="range"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 h-1 accent-accent"
            title="Font size"
          />
          <span className="text-2xs w-5">{fontSize}</span>
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={() => setWordWrap(!wordWrap)}
          className={cn('p-1.5 rounded transition-colors', wordWrap ? 'text-accent' : 'text-text-muted hover:text-text-primary')}
          title="Word wrap"
        >
          <WrapText size={14} />
        </button>
        <button
          onClick={() => setVimMode(!vimMode)}
          className={cn('p-1.5 rounded transition-colors font-mono text-xs', vimMode ? 'text-accent' : 'text-text-muted hover:text-text-primary')}
          title="Vim mode"
        >
          VI
        </button>
        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={cn('p-1.5 rounded transition-colors', showMinimap ? 'text-accent' : 'text-text-muted hover:text-text-primary')}
          title="Minimap"
        >
          <Minimize2 size={14} />
        </button>
      </div>

      <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
        <Editor
          key={selectedTheme}
          language={language || 'plaintext'}
          value={editorContent}
          onChange={handleEditorChange}
          onMount={handleMount}
          theme={selectedTheme}
          options={{
            readOnly,
            fontSize,
            wordWrap: wordWrap ? 'on' : 'off',
            minimap: { enabled: showMinimap },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 2,
            automaticLayout: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 12 },
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          }
        />
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-surface">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-accent text-primary-dark rounded-md hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Saving...' : showCommitDialog ? 'Commit' : 'Commit Changes'}
          </button>
        </div>
      )}

      {showCommitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCommitDialog(false)}>
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary">Commit changes</h3>

            <div>
              <label className="block text-xs text-text-muted mb-1">Commit message *</label>
              <input
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter commit message..."
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">Description</label>
              <textarea
                value={commitDescription}
                onChange={(e) => setCommitDescription(e.target.value)}
                placeholder="Optional extended description..."
                rows={3}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">Branch</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBranch}
                  onChange={(e) => { setSelectedBranch(e.target.value); setShowNewBranch(false); }}
                  className="flex-1 px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewBranch(!showNewBranch)}
                  className={cn('p-2 rounded-lg border border-border text-text-muted hover:text-text-primary transition-colors', showNewBranch && 'text-accent border-accent')}
                  title="Create new branch"
                >
                  <GitBranch size={16} />
                </button>
              </div>
              {showNewBranch && (
                <input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="New branch name..."
                  className="w-full mt-2 px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              )}
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">Co-author</label>
              <div className="relative">
                <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={coAuthor}
                  onChange={(e) => setCoAuthor(e.target.value)}
                  placeholder="Name <email@example.com>"
                  className="w-full pl-9 pr-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCommitDialog(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={saving || !commitMessage.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Committing...' : 'Commit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
