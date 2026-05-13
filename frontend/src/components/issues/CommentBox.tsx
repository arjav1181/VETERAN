import { useState, useCallback, useRef } from 'react';
import {
  Bold, Italic, Code, Link, Heading1, Heading2, List, ListOrdered,
  CheckSquare, Quote, Image, AtSign, Hash, X, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

interface CommentBoxProps {
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
}

export function CommentBox({
  onSubmit, onCancel, initialValue = '', placeholder = 'Leave a comment...',
  submitLabel = 'Comment', loading = false, className,
}: CommentBoxProps) {
  const [body, setBody] = useState(initialValue);
  const [showPreview, setShowPreview] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);
    const newBody = body.substring(0, start) + before + selected + after + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newBody = body.substring(0, start) + text + body.substring(textarea.selectionEnd);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/' && !body) {
      setShowSlashMenu(true);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = useCallback(() => {
    if (!body.trim()) return;
    onSubmit(body);
    setBody('');
  }, [body, onSubmit]);

  const ToolbarBtn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) => (
    <button type="button" onClick={onClick} title={title}
      className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-primary-dark', className)}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface flex-wrap">
        <ToolbarBtn onClick={() => wrapSelection('**', '**')} title="Bold"><Bold size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => wrapSelection('_', '_')} title="Italic"><Italic size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => wrapSelection('`', '`')} title="Code"><Code size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => wrapSelection('[', '](url)')} title="Link"><Link size={15} /></ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => insertAtCursor('### ')} title="Heading"><Heading1 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('- ')} title="Bullet list"><List size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('1. ')} title="Ordered list"><ListOrdered size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('- [ ] ')} title="Task list"><CheckSquare size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('> ')} title="Blockquote"><Quote size={15} /></ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => insertAtCursor('![](image-url)')} title="Image"><Image size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('@')} title="Mention"><AtSign size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor('#')} title="Reference"><Hash size={15} /></ToolbarBtn>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={cn('px-2 py-1 text-xs rounded transition-colors', showPreview ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showSlashMenu && (
        <div className="px-3 py-2 bg-surface border-b border-border space-y-1">
          {[
            { label: 'Heading', cmd: '### ', icon: Heading1 },
            { label: 'Task list', cmd: '- [ ] ', icon: CheckSquare },
            { label: 'Code block', cmd: '```\n\n```', icon: Code },
            { label: 'Bullet list', cmd: '- ', icon: List },
            { label: 'Numbered list', cmd: '1. ', icon: ListOrdered },
            { label: 'Quote', cmd: '> ', icon: Quote },
          ].map(({ label, cmd, icon: Icon }) => (
            <button
              key={label}
              onClick={() => { insertAtCursor(cmd); setShowSlashMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface/80 rounded w-full transition-colors"
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}

      {showPreview ? (
        <div className="px-4 py-3 min-h-[150px] prose prose-invert max-w-none">
          <MarkdownRenderer content={body || '*Nothing to preview*'} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          className="w-full px-4 py-3 bg-primary-dark text-sm text-text-primary placeholder-text-muted resize-y focus:outline-none min-h-[150px]"
        />
      )}

      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-surface">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!body.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-accent text-primary-dark rounded-md hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
        >
          <Send size={14} /> {loading ? 'Submitting...' : submitLabel}
        </button>
        <span className="text-2xs text-text-muted">Cmd+Enter to submit</span>
      </div>
    </div>
  );
}
