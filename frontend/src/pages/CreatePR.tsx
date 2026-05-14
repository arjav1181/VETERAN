import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pullApi } from '@lib/api/endpoints/pulls';
import { repoApi } from '@lib/api/endpoints/repos';
import { getApiError } from '@lib/api/client';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GitPullRequest } from 'lucide-react';
import { getRepoParams } from '@lib/route-utils';

export function CreatePR() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [headBranch, setHeadBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', owner, name],
    queryFn: () => repoApi.getBranches(owner!, name!),
    enabled: !!owner && !!name,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !headBranch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const pr = await pullApi.create(owner!, name!, {
        title: title.trim(),
        head: headBranch.trim(),
        base: baseBranch,
        body: body.trim() || undefined,
      });
      navigate(`/${owner}/${name}/pull/${pr.number}`);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const branchNames = Array.isArray(branches) ? branches.map((b: any) => b.name || b) : [];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <GitPullRequest size={24} className="text-info" />
          <h1 className="text-2xl font-bold text-text-primary">New Pull Request</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">Base branch</label>
              <select value={baseBranch} onChange={(e) => setBaseBranch(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary">
                {branchNames.map((b: string) => <option key={b} value={b}>{b}</option>)}
                <option value="main">main</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">Compare branch</label>
              <select value={headBranch} onChange={(e) => setHeadBranch(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary">
                <option value="">Select branch</option>
                {branchNames.map((b: string) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <VeteranInput label="Title" placeholder="PR title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Describe your changes..." className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y font-mono" />
          </div>
          <div className="flex gap-3">
            <VeteranButton type="submit" disabled={!title.trim() || !headBranch.trim() || loading}>
              {loading ? 'Creating...' : 'Create pull request'}
            </VeteranButton>
            <VeteranButton type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</VeteranButton>
          </div>
        </form>
      </div>
    </div>
  );
}
