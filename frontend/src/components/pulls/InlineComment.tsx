import { useState } from 'react';
import { MessageSquare, Plus, X, Code, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineCommentProps {
  path: string;
  line: number;
  onSubmit: (body: string, suggestion?: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function InlineComment({ path, line, onSubmit, onCancel, className }: InlineCommentProps) {
  const [body, setBody] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!body.trim()) return;
    onSubmit(body, showSuggestion ? suggestion : undefined);
    setBody('');
    setSuggestion('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface/80 rounded-md transition-colors border border-border"
      >
        <MessageSquare size={12} /> <Plus size={10} />
      </button>
    );
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-primary-dark animate-slide-up', className)}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border-b border-border text-xs text-text-muted">
        <MessageSquare size={12} />
        <span>Comment on line {line}</span>
        <code className="text-text-secondary truncate flex-1">{path}</code>
        <button onClick={() => setShowSuggestion(!showSuggestion)}
          className={cn('p-1 rounded transition-colors', showSuggestion ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary')}
          title="Suggest edit">
          <Code size={12} />
        </button>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        className="w-full px-3 py-2 bg-primary-dark text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none"
        autoFocus
      />

      {showSuggestion && (
        <div className="border-t border-border">
          <div className="px-3 py-1 bg-surface text-xs text-text-muted">Suggested change</div>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="```suggestion\nYour code suggestion here\n```"
            rows={3}
            className="w-full px-3 py-2 bg-primary-dark text-sm font-mono text-text-primary placeholder-text-muted resize-none focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 px-3 py-1.5 border-t border-border bg-surface">
        <button onClick={() => { setOpen(false); onCancel?.(); }}
          className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!body.trim()}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-accent text-primary-dark rounded hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
          <Check size={12} /> Comment
        </button>
      </div>
    </div>
  );
}
