import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="text-info underline decoration-info/30 hover:decoration-info transition-all"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              className="rounded-lg max-w-full h-auto border border-border"
              loading="lazy"
              {...props}
            />
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-surface text-text-primary text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="overflow-x-auto rounded-lg bg-surface border border-border p-4">
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-surface px-3 py-2 text-left text-sm font-semibold text-text-primary" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2 text-sm text-text-secondary" {...props}>
              {children}
            </td>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-accent/50 pl-4 italic text-text-secondary" {...props}>
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-border" />,
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold text-text-primary mt-8 mb-4 pb-2 border-b border-border" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold text-text-primary mt-6 mb-3 pb-1 border-b border-border" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-semibold text-text-primary mt-5 mb-2" {...props}>
              {children}
            </h3>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 my-2 space-y-1 text-text-secondary" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 my-2 space-y-1 text-text-secondary" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => <li className="text-text-secondary" {...props}>{children}</li>,
          p: ({ children, ...props }) => <p className="my-2 text-text-secondary leading-relaxed" {...props}>{children}</p>,
          input: (props) => (
            <input
              className="rounded border-border bg-surface text-accent focus:ring-accent"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
