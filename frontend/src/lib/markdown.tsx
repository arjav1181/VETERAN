import type { Components } from 'react-markdown';
import type { PluggableList } from 'react-markdown';

export const markdownPlugins: PluggableList = [];

export const rehypePlugins: PluggableList = [];

export const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-surface-200 dark:border-surface-700" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold mt-5 mb-3 pb-1 border-b border-surface-200 dark:border-surface-700" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold mt-3 mb-1" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => (
    <a href={href} className="text-veteran-600 dark:text-veteran-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 my-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-veteran-500 pl-4 my-4 italic text-surface-600 dark:text-surface-400" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="overflow-x-auto rounded-lg bg-surface-900 dark:bg-surface-950 p-4 my-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-surface-300 dark:border-surface-600" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-surface-100 dark:bg-surface-800" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-surface-300 dark:border-surface-600 px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-surface-300 dark:border-surface-600 px-4 py-2" {...props}>
      {children}
    </td>
  ),
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} className="max-w-full rounded-lg my-4" loading="lazy" {...props} />
  ),
  hr: (props) => <hr className="my-6 border-surface-300 dark:border-surface-600" {...props} />,
};
