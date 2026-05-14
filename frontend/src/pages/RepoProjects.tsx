import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SquareKanban, Plus } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getRepoParams } from '@lib/route-utils';

export function RepoProjects() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', owner, name],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/projects`),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <SquareKanban size={24} className="text-accent" />
            <div className="h-7 w-32 bg-surface rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <VeteranSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SquareKanban size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Projects</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New project
          </button>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Projects unavailable" description="The projects feature is not available or there was an error loading projects." />
        ) : !projects || projects.length === 0 ? (
          <VeteranEmptyState icon="folder" title="No projects yet" description="Create a project to organize your work" action={{ label: 'Create project', onClick: () => {} }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(projects as any[]).map((project: any) => (
              <div
                key={project.id}
                className="border border-border rounded-lg bg-primary-dark p-4 hover:bg-surface/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/${owner}/${name}/projects/${project.number}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <SquareKanban size={16} className={project.state === 'open' ? 'text-success' : 'text-text-muted'} />
                  <h3 className="text-sm font-semibold text-text-primary">{project.name}</h3>
                  <span className={cn(
                    'px-1.5 py-0.5 text-2xs font-medium rounded',
                    project.state === 'open' ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'
                  )}>
                    {project.state}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{(project.cardCount ?? project.card_count ?? 0)} cards</span>
                  <span>Updated {formatRelativeTime(project.updated_at || project.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
