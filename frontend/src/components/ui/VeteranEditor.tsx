import { useCallback, useRef } from 'react';
import Editor, { type OnMount, type BeforeMount, type OnChange } from '@monaco-editor/react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '@stores/themeStore';
import { Maximize2, Minimize2, WrapText, Search } from 'lucide-react';

export interface VeteranEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  filename?: string;
  readOnly?: boolean;
  minimap?: boolean;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  height?: string | number;
  className?: string;
  onMount?: (editor: Parameters<OnMount>[0]) => void;
  vimMode?: boolean;
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  php: 'php',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  dockerfile: 'dockerfile',
  xml: 'xml',
  graphql: 'graphql',
  toml: 'plaintext',
};

export function VeteranEditor({
  value,
  onChange,
  language,
  filename,
  readOnly,
  minimap = true,
  wordWrap = 'off',
  height = '400px',
  className,
  onMount: onMountCallback,
  vimMode,
}: VeteranEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const theme = useThemeStore((s) => s.theme);

  const detectedLanguage = filename
    ? filename.split('.').pop()?.toLowerCase() || 'plaintext'
    : language || 'plaintext';
  const monacoLanguage = languageMap[detectedLanguage] || detectedLanguage;

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      if (vimMode) {
        editor.addAction({
          id: 'vim-mode',
          label: 'Vim Mode',
          run: () => {},
        });
      }

      onMountCallback?.(editor);
    },
    [onMountCallback, vimMode]
  );

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme('veteran-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6c6c6c', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569Cd6' },
        { token: 'string', foreground: '7ec699' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'function', foreground: 'dcdcaa' },
        { token: 'variable', foreground: '9cdcfe' },
        { token: 'constant', foreground: '4fc1ff' },
        { token: 'operator', foreground: 'd4d4d4' },
      ],
      colors: {
        'editor.background': '#141517',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#569Cd6',
        'editorLineNumber.foreground': '#6c6c6c',
        'editorLineNumber.activeForeground': '#d4d4d4',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorBracketMatch.background': '#0d3a58',
        'editorBracketMatch.border': '#569Cd6',
        'editorGutter.background': '#141517',
        'minimap.background': '#141517',
      },
    });

    monaco.editor.defineTheme('veteran-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd73a49' },
        { token: 'string', foreground: '032f62' },
        { token: 'number', foreground: '005cc5' },
        { token: 'type', foreground: '6f42c1' },
        { token: 'function', foreground: '6f42c1' },
        { token: 'variable', foreground: '24292e' },
        { token: 'constant', foreground: '005cc5' },
        { token: 'operator', foreground: '24292e' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editor.selectionBackground': '#c8e1ff',
        'editor.inactiveSelectionBackground': '#e8e8e8',
        'editorCursor.foreground': '#24292e',
        'editorLineNumber.foreground': '#6a737d',
        'editorLineNumber.activeForeground': '#24292e',
        'editorIndentGuide.background': '#d0d7de',
        'editorIndentGuide.activeBackground': '#8c959f',
        'editorBracketMatch.background': '#e8f0fe',
        'editorBracketMatch.border': '#1a85ff',
        'editorGutter.background': '#ffffff',
        'minimap.background': '#ffffff',
      },
    });
  }, []);

  return (
    <div className={cn('rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden', className)}>
      <div className="flex h-10 items-center justify-between px-4 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          {filename && <span className="font-mono">{filename}</span>}
          <span className="uppercase">{monacoLanguage}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
            {minimap ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <Editor
        height={height}
        value={value}
        language={monacoLanguage}
        theme={theme === 'dark' ? 'veteran-dark' : 'veteran-light'}
        onChange={(val) => onChange?.(val || '')}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          wordWrap,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          insertSpaces: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 8, bottom: 8 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: true },
          folding: true,
          foldingHighlight: true,
          foldingStrategy: 'indentation',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          renderLineHighlight: 'all',
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          matchBrackets: 'always',
          codeLens: true,
          colorDecorators: true,
          contextmenu: true,
          links: true,
          mouseWheelZoom: true,
        }}
      />
    </div>
  );
}
