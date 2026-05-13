import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Globe, Lock, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImportRepo() {
  const navigate = useNavigate();
  const [cloneUrl, setCloneUrl] = useState('');
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneUrl.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/user/${name || 'imported-repo'}`);
    }, 1000);
  };

  const extractRepoName = (url: string) => {
    const match = url.match(/\/([^/]+?)(?:\.git)?$/);
    return match ? match[1] : '';
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Download size={32} className="text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Import repository</h1>
            <p className="text-sm text-text-muted">Import a repository from another Git hosting service</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Clone URL *</label>
            <input
              value={cloneUrl}
              onChange={(e) => {
                setCloneUrl(e.target.value);
                if (!name) setName(extractRepoName(e.target.value));
              }}
              placeholder="https://github.com/user/repo.git"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Repository name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
              placeholder="my-imported-repo"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              {(['public', 'private'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors',
                    visibility === v ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface/80'
                  )}
                >
                  {v === 'public' ? <Globe size={20} className="text-success mt-0.5" /> : <Lock size={20} className="text-danger mt-0.5" />}
                  <div>
                    <span className="text-sm font-medium text-text-primary capitalize block">{v}</span>
                    <span className="text-xs text-text-muted">{v === 'public' ? 'Anyone can view' : 'Only you can view'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!cloneUrl.trim() || loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? 'Importing...' : 'Begin import'}
          </button>
        </form>
      </div>
    </div>
  );
}
