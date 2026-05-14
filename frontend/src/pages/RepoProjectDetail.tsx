import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layout, Table, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoardView } from '@/components/projects/BoardView';
import { TableView } from '@/components/projects/TableView';
import { RoadmapView } from '@/components/projects/RoadmapView';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getRepoParams } from '@lib/route-utils';

export function RepoProjectDetail() {
  const { owner, repo: name } = getRepoParams(); const number = p.number;
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'table' | 'roadmap'>('board');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', owner, name, number],
    queryFn: () => api.get<any>(`/repos/${owner}/${name}/projects/${number}`),
    enabled: !!owner && !!name && !!number,
  });

  const { data: columns } = useQuery({
    queryKey: ['project-columns', owner, name, number],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/projects/${number}/columns`),
    enabled: !!owner && !!name && !!number,
  });

  const { data: cards } = useQuery({
    queryKey: ['project-cards', owner, name, number],
    queryFn: () => api.get<any[]>(`/repos/${owner}/${name}/projects/${number}/cards`),
    enabled: !!owner && !!name && !!number,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-5 w-32 bg-surface rounded animate-pulse mb-4" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/${owner}/${name}/projects`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to projects
          </button>
          <VeteranEmptyState icon="alert" title="Project not found" description="The requested project could not be found." />
        </div>
      </div>
    );
  }

  const projectData = project as any;
  const projectColumns = (columns as any[]) ?? [];
  const projectCards = (cards as any[]) ?? [];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/projects`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to projects
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">{p.name}</h1>
          <div className="flex bg-surface rounded-lg border border-border p-0.5">
            {[
              { id: 'board' as const, icon: Layout, label: 'Board' },
              { id: 'table' as const, icon: Table, label: 'Table' },
              { id: 'roadmap' as const, icon: CalendarDays, label: 'Roadmap' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                  view === id ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {view === 'board' && (
            <BoardView
              columns={projectColumns}
              cards={projectCards}
            />
          )}
          {view === 'table' && (
            <TableView
              cards={projectCards}
              columns={[
                { id: 'title', name: 'Title', field: 'title' },
                { id: 'status', name: 'Status', field: 'status' },
                { id: 'assignee', name: 'Assignee', field: 'assignee' },
              ]}
            />
          )}
          {view === 'roadmap' && (
            <RoadmapView items={projectCards.map((card: any) => ({
              id: card.id,
              title: card.note || 'Untitled',
              startDate: new Date(card.created_at || card.createdAt),
              endDate: new Date(card.created_at || card.createdAt),
              progress: 0,
              assignee: card.creatorUsername,
              status: card.contentType || 'note',
            }))} />
          )}
        </div>
      </div>
    </div>
  );
}
