import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { RunDetail } from '@/components/actions/RunDetail';
import { actionsApi } from '@lib/api/endpoints/actions';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoActionDetail() {
  const p = useParams<{ owner: string; name?: string; repo?: string; runId: string }>(); const owner = p.owner || ""; const name = p.name || p.repo || ""; const runId = p.runId;
  const navigate = useNavigate();

  const { data: run, isLoading: runLoading, error } = useQuery({
    queryKey: ['action-run', owner, name, runId],
    queryFn: () => actionsApi.getPipeline(owner!, name!, runId!),
    enabled: !!owner && !!name && !!runId,
  });

  const { data: jobs } = useQuery({
    queryKey: ['action-jobs', owner, name, runId],
    queryFn: () => actionsApi.listJobs(owner!, name!, runId!),
    enabled: !!owner && !!name && !!runId,
  });

  if (runLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-5 w-40 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/actions`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to workflows
          </button>
          <VeteranEmptyState icon="alert" title="Run not found" description="The requested workflow run could not be found." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/actions`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to workflows
        </button>

        <RunDetail run={run} jobs={jobs ?? []} />
      </div>
    </div>
  );
}
