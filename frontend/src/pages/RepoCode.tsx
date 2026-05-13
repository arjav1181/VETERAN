import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '40px', color: '#E6EDF3', background: '#0A0C10', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', color: '#F85149', marginBottom: '16px' }}>Something went wrong</h1>
      <pre style={{ background: '#13161E', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '13px' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
      <Link to="/" style={{ color: '#E8B84B' }}>Go to Dashboard</Link>
    </div>
  );
}

export function RepoCode() {
  try {
    const params = useParams<{ owner: string; name: string }>();
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const owner = params.owner || pathParts[0] || '';
    const name = params.name || pathParts[1] || '';

    const { data: repo, isLoading, error } = useQuery({
      queryKey: ['repo', owner, name],
      queryFn: () => api.get(`/repos/${owner}/${name}`),
      enabled: !!owner && !!name,
    });

    return (
      <div style={{ padding: '40px', color: '#E6EDF3', background: '#0A0C10', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          {owner}/{name}
        </h1>
        <div style={{ background: '#13161E', padding: '20px', borderRadius: '8px', marginBottom: '12px' }}>
          <p><strong>URL:</strong> {window.location.pathname}</p>
          <p><strong>Params:</strong> owner={params.owner || '(empty)'}, name={params.name || '(empty)'}</p>
          <p><strong>Status:</strong> {isLoading ? 'Loading...' : error ? `Error: ${error}` : repo ? `Loaded: ${(repo as any).fullName || 'OK'}` : 'No data'}</p>
          {repo && <pre style={{ fontSize: '12px', marginTop: '8px' }}>{JSON.stringify(repo, null, 2).slice(0, 500)}</pre>}
        </div>
        <Link to="/" style={{ color: '#E8B84B' }}>Go to Dashboard</Link>
      </div>
    );
  } catch (err) {
    return <ErrorFallback error={err instanceof Error ? err : new Error(String(err))} />;
  }
}
