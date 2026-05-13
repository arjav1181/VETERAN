import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Check, Copy, FileCode } from 'lucide-react';

export interface VeteranCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

const languageMap: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  rb: 'Ruby',
  rs: 'Rust',
  go: 'Go',
  java: 'Java',
  kt: 'Kotlin',
  swift: 'Swift',
  php: 'PHP',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  dockerfile: 'Dockerfile',
  xml: 'XML',
  graphql: 'GraphQL',
  rust: 'Rust',
};

export function VeteranCodeBlock({ code, language, filename, showLineNumbers = true, className }: VeteranCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const langLabel = language ? languageMap[language] || language : null;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className={cn('rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden', className)}>
      {(filename || langLabel) && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 min-w-0">
            {filename && (
              <>
                <FileCode className="w-4 h-4 text-surface-400 flex-shrink-0" />
                <span className="text-sm text-surface-600 dark:text-surface-400 truncate">{filename}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {langLabel && (
              <span className="text-xs text-surface-400 font-mono uppercase">{langLabel}</span>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!filename && !langLabel && (
        <div className="flex items-center justify-end px-4 py-1.5 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className={cn('font-mono', language && `language-${language}`)}>
            {showLineNumbers ? (
              <table className="border-collapse">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="align-top">
                      <td className="select-none text-right pr-4 text-surface-400 dark:text-surface-600 text-xs w-10">
                        {i + 1}
                      </td>
                      <td className="whitespace-pre">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
