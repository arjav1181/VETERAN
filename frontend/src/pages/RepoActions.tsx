import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { WorkflowList } from '@/components/actions/WorkflowList';
import { actionsApi } from '@lib/api/endpoints/actions';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoActions() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  const { data: runs, isLoading, error } = useQuery({
    queryKey: ['actions', owner, name],
    queryFn: () => actionsApi.listPipelines(owner!, name!),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Play size={24} className="text-accent" />
            <div className="h-7 w-32 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load workflows" description="There was an error loading the workflow runs." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Play size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Actions</h1>
        </div>

        {!runs || runs.length === 0 ? (
          <VeteranEmptyState icon="code" title="No workflow runs" description="This repository has no workflow runs yet." />
        ) : (
          <WorkflowList
            runs={runs}
            onRunClick={(id) => navigate(`/${owner}/${name}/actions/runs/${id}`)}
          />
        )}
      </div>
    </div>
  );
}
