import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewBoxProps {
  onSubmit: (body: string, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT') => void;
  submitting?: boolean;
  className?: string;
}

export function ReviewBox({ onSubmit, submitting = false, className }: ReviewBoxProps) {
  const [body, setBody] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' | null>(null);

  const handleSubmit = () => {
    if (!selectedEvent) return;
    onSubmit(body, selectedEvent);
    setBody('');
    setSelectedEvent(null);
  };

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-primary-dark', className)}>
      <div className="flex border-b border-border">
        {[
          { event: 'COMMENT' as const, icon: MessageSquare, label: 'Comment', color: 'text-text-primary' },
          { event: 'APPROVE' as const, icon: CheckCircle, label: 'Approve', color: 'text-success' },
          { event: 'REQUEST_CHANGES' as const, icon: XCircle, label: 'Request changes', color: 'text-danger' },
        ].map(({ event, icon: Icon, label, color }) => (
          <button
            key={event}
            onClick={() => setSelectedEvent(event)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
              selectedEvent === event
                ? `${color} bg-accent/5 border-b-2 border-accent`
                : 'text-text-muted hover:text-text-primary hover:bg-surface/30'
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a review comment..."
        rows={4}
        className="w-full px-4 py-3 bg-primary-dark text-sm text-text-primary placeholder-text-muted resize-y focus:outline-none min-h-[100px]"
      />

      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface">
        <span className="text-2xs text-text-muted">Review will be submitted with your selected action</span>
        <button
          onClick={handleSubmit}
          disabled={!selectedEvent || submitting}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
            selectedEvent === 'APPROVE' ? 'bg-success text-white hover:bg-success/90' :
            selectedEvent === 'REQUEST_CHANGES' ? 'bg-danger text-white hover:bg-danger/90' :
            selectedEvent ? 'bg-accent text-primary-dark hover:bg-accent/90' :
            'bg-surface text-text-muted border border-border cursor-not-allowed'
          )}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
