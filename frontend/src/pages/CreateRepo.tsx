import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { repoApi } from '@lib/api/endpoints/repos';
import { getApiError } from '@lib/api/client';
import { Github, Lock, Globe, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreateRepo() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [initReadme, setInitReadme] = useState(true);
  const [gitignore, setGitignore] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const repo = await repoApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate: visibility === 'private',
        autoInit: initReadme,
        gitignoreTemplate: gitignore || undefined,
        licenseTemplate: license || undefined,
      });
      navigate(`/${user?.username || '_'}/${repo.name || name}`);
    } catch (err) {
      const apiError = getApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Github size={32} className="text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create a new repository</h1>
            <p className="text-sm text-text-muted">A repository contains all of your project's files and revision history</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Repository name *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                {user?.username || 'user'}/
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
                placeholder="my-project"
                className="w-full pl-14 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
                autoFocus
              />
            </div>
            {name && (
              <p className="mt-1 text-xs text-text-muted">
                Will be available at <code className="text-accent">veteran.dev/{user?.username || 'user'}/{name}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your repository..."
              rows={3}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
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
                    <span className="text-xs text-text-muted">{v === 'public' ? 'Anyone can view this repository' : 'Only you can view this repository'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Initialize this repository with</h3>

            <label className="flex items-center gap-3 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={initReadme}
                onChange={(e) => setInitReadme(e.target.checked)}
                className="rounded border-border bg-surface text-accent focus:ring-accent"
              />
              Add a README file
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">.gitignore template</label>
                <select
                  value={gitignore}
                  onChange={(e) => setGitignore(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">None</option>
                  <option value="Node">Node</option>
                  <option value="Python">Python</option>
                  <option value="Rust">Rust</option>
                  <option value="Go">Go</option>
                  <option value="Java">Java</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">License</label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">None</option>
                  <option value="MIT">MIT</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GPL 3.0</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? 'Creating...' : 'Create repository'}
          </button>
        </form>
      </div>
    </div>
  );
}
