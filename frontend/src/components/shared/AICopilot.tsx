import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { VeteranCodeBlock } from '@ui/VeteranCodeBlock';
import { aiApi, type ChatMessage } from '@/lib/api/endpoints/ai';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  PanelRightClose,
  Code,
  MessageSquare,
} from 'lucide-react';

interface AICopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

type Mode = 'chat' | 'code' | 'review';

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AICopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m VETERAN Copilot. I can help you write code, review code, or answer questions. How can I help?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('chat');
  const [status, setStatus] = useState<{ enabled: boolean; provider: string; model: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    aiApi.getStatus().then(setStatus).catch(() => setStatus({ enabled: false, provider: 'none', model: '' }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addMessage = useCallback((role: AICopilotMessage['role'], content: string) => {
    const msg: AICopilotMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    addMessage('user', text);

    let systemPrompt = '';
    if (mode === 'code') {
      systemPrompt = 'You are an expert programmer. Generate clean, production-ready code. Include brief explanations where helpful.';
    } else if (mode === 'review') {
      systemPrompt = 'You are an expert code reviewer. Review the provided code for bugs, security issues, and best practices. Be constructive and specific.';
    }

    const apiMessages: ChatMessage[] = [];
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of messages) {
      if (msg.id !== 'welcome') {
        apiMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
      }
    }
    apiMessages.push({ role: 'user', content: text });

    setLoading(true);
    try {
      const result = await aiApi.chat(apiMessages);
      addMessage('assistant', result.message.content);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get response';
      setError(message);
      addMessage('assistant', `Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [input, loading, mode, messages, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```\w*\n[\s\S]*?```)/g);
    return parts.map((part, i) => {
      const codeMatch = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (codeMatch) {
        return (
          <VeteranCodeBlock
            key={i}
            code={codeMatch[2].trim()}
            language={codeMatch[1] || undefined}
            className="my-2"
          />
        );
      }
      if (part.trim()) {
        return (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            {part}
          </p>
        );
      }
      return null;
    });
  };

  if (status && !status.enabled && isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-all hover:scale-105"
        >
          <Bot className="w-5 h-5" />
        </button>
        {isOpen && (
          <div className="fixed bottom-24 right-6 z-50 w-96 rounded-xl border border-surface-700 bg-surface shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-700">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent" />
                <span className="font-semibold text-sm text-text-primary">VETERAN Copilot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 text-center text-text-muted">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-warning" />
              <p className="text-sm font-medium mb-1">AI Copilot not configured</p>
              <p className="text-xs">Set AI_API_KEY and AI_PROVIDER in your environment to enable.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105',
          isOpen ? 'bg-surface border border-surface-700' : 'bg-accent text-white hover:bg-accent/90'
        )}
      >
        {isOpen ? (
          <PanelRightClose className="w-5 h-5 text-text-primary" />
        ) : (
          <Bot className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] max-h-[calc(100vh-180px)] rounded-xl border border-surface-700 bg-surface shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm text-text-primary">VETERAN Copilot</span>
            </div>
            <div className="flex items-center gap-2">
              {status && (
                <span className="text-2xs text-text-muted bg-surface-800 px-2 py-0.5 rounded-full">
                  {status.provider}
                </span>
              )}
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-surface-700 flex-shrink-0">
            {[
              { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
              { id: 'code' as const, label: 'Code', icon: Code },
              { id: 'review' as const, label: 'Review', icon: Sparkles },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                  mode === m.id
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-800'
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2',
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-surface-800 text-text-primary border border-surface-700'
                  )}
                >
                  {msg.role === 'assistant' ? renderContent(msg.content) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className="text-2xs text-text-muted mt-1 opacity-60">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="bg-surface-800 text-text-primary rounded-lg px-4 py-3 border border-surface-700">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    <span className="text-xs text-text-muted animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-surface-700 bg-surface flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'code'
                    ? 'Describe the code to generate...'
                    : mode === 'review'
                      ? 'Paste code to review...'
                      : 'Ask anything...'
                }
                rows={1}
                className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                style={{ minHeight: '36px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg transition-all flex-shrink-0',
                  input.trim() && !loading
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-surface-800 text-text-muted border border-surface-700 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-2xs text-text-muted mt-1.5 text-center">
              {status?.enabled
                ? `Using ${status.provider} · ${status.model}`
                : 'AI not configured'}
              {' · '}Ctrl+I to toggle
            </p>
          </div>
        </div>
      )}
    </>
  );
}
