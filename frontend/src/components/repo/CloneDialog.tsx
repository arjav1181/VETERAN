import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloneDialogProps {
  owner: string;
  name: string;
  onClose: () => void;
}

export function CloneDialog({ owner, name, onClose }: CloneDialogProps) {
  const [protocol, setProtocol] = useState<'https' | 'ssh'>('https');
  const [copied, setCopied] = useState(false);

  const httpsUrl = `https://veteran.dev/${owner}/${name}.git`;
  const sshUrl = `git@veteran.dev:${owner}/${name}.git`;
  const cliCmd = `gh repo clone ${owner}/${name}`;
  const currentUrl = protocol === 'https' ? httpsUrl : sshUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCli = async () => {
    await navigator.clipboard.writeText(cliCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold text-text-primary">Clone repository</h3>
          <button onClick={onClose} className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex border-b border-border">
            {(['https', 'ssh', 'cli'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProtocol(p as typeof protocol)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors relative capitalize',
                  protocol === p ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {p === 'cli' ? 'GitHub CLI' : p}
                {protocol === p && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
              </button>
            ))}
          </div>

          {protocol === 'cli' ? (
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Command</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm font-mono text-text-primary">
                  {cliCmd}
                </div>
                <button
                  onClick={handleCopyCli}
                  className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-text-muted mb-1.5">{protocol.toUpperCase()} URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm font-mono text-text-primary truncate">
                  {currentUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-colors"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}

          <div className="px-3 py-2 bg-primary-dark border border-border rounded-lg">
            <p className="text-xs text-text-muted">
              {protocol === 'https' && 'Use Git with HTTPS. Personal access tokens are recommended for authentication.'}
              {protocol === 'ssh' && 'Use an SSH key to authenticate. You\'ll need to add your public key to your VETERAN account.'}
              {protocol === 'cli' && 'Use the VETERAN CLI tool to clone repositories from the command line.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
