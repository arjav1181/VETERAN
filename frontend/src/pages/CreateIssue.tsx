import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueApi } from '@lib/api/endpoints/issues';
import { getApiError } from '@lib/api/client';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { ArrowLeft, Bug } from 'lucide-react';
import { getRepoParams } from '@lib/route-utils';

export function CreateIssue() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const issue = await issueApi.create(owner!, name!, { title: title.trim(), body: body.trim() || undefined });
      navigate(`/${owner}/${name}/issues/${issue.number}`);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Bug size={24} className="text-success" />
          <h1 className="text-2xl font-bold text-text-primary">New Issue</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <VeteranInput label="Title" placeholder="Issue title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="Describe the issue..." className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y font-mono" />
          </div>
          <div className="flex gap-3">
            <VeteranButton type="submit" disabled={!title.trim() || loading}>
              {loading ? 'Creating...' : 'Submit new issue'}
            </VeteranButton>
            <VeteranButton type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</VeteranButton>
          </div>
        </form>
      </div>
    </div>
  );
}
