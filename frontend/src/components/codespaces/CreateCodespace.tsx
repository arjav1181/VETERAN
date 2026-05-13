import { useState } from 'react';
import { Terminal, GitBranch, Cpu, HardDrive, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateCodespaceProps {
  repositories: { id: string; fullName: string }[];
  machines: { id: string; name: string; displayName: string; cpu: number; memory: number; storage: number; priceHourly: number }[];
  onCreate: (data: { repositoryId: string; branch?: string; machineType?: string; displayName?: string }) => void;
  loading?: boolean;
  className?: string;
}

export function CreateCodespace({ repositories, machines, onCreate, loading, className }: CreateCodespaceProps) {
  const [repoId, setRepoId] = useState(repositories[0]?.id || '');
  const [branch, setBranch] = useState('');
  const [machineId, setMachineId] = useState(machines[0]?.id || '');
  const [displayName, setDisplayName] = useState('');

  const selectedMachine = machines.find(m => m.id === machineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoId) return;
    onCreate({ repositoryId: repoId, branch: branch || undefined, machineType: machineId || undefined, displayName: displayName || undefined });
  };

  return (
    <div className={cn('border border-border rounded-lg bg-surface p-6 max-w-lg', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Terminal size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Create codespace</h2>
          <p className="text-sm text-text-muted">Set up a new cloud development environment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Repository</label>
          <select
            value={repoId}
            onChange={(e) => setRepoId(e.target.value)}
            className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="">Select repository...</option>
            {repositories.map(r => (
              <option key={r.id} value={r.id}>{r.fullName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Branch (optional)</label>
          <div className="relative">
            <GitBranch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full pl-9 pr-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Machine type</label>
          <div className="space-y-2">
            {machines.map(m => (
              <label
                key={m.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                  machineId === m.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface/80'
                )}
              >
                <input
                  type="radio"
                  name="machine"
                  value={m.id}
                  checked={machineId === m.id}
                  onChange={() => setMachineId(m.id)}
                  className="text-accent focus:ring-accent"
                />
                <div className="flex-1">
                  <span className="text-sm text-text-primary font-medium">{m.displayName}</span>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span className="flex items-center gap-1"><Cpu size={12} />{m.cpu} cores</span>
                    <span><HardDrive size={12} />{m.memory}GB RAM</span>
                    <span>{m.storage}GB storage</span>
                  </div>
                </div>
                <span className="text-xs text-text-muted">${m.priceHourly.toFixed(2)}/hr</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Display name (optional)</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My codespace"
            className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {selectedMachine && (
          <div className="px-3 py-2 bg-primary-dark border border-border rounded-lg text-xs text-text-muted">
            Estimated cost: <span className="text-text-primary font-medium">${selectedMachine.priceHourly.toFixed(2)}/hour</span>
            {' · '}Idle timeout: 30 minutes
          </div>
        )}

        <button
          type="submit"
          disabled={!repoId || loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
          {loading ? 'Creating...' : 'Create codespace'}
        </button>
      </form>
    </div>
  );
}
