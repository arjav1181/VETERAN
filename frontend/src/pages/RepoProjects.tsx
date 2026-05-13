import { useParams, useNavigate } from 'react-router-dom';
import { SquareKanban, Plus } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

const MOCK_PROJECTS = [
  { id: 'p1', name: 'Q1 2026 Roadmap', number: 1, state: 'open', cardCount: 12, updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'p2', name: 'Bug Tracker', number: 2, state: 'open', cardCount: 8, updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'p3', name: 'Feature Requests', number: 3, state: 'open', cardCount: 15, updatedAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'p4', name: 'Sprint 12', number: 4, state: 'closed', cardCount: 24, updatedAt: new Date(Date.now() - 604800000).toISOString() },
];

export function RepoProjects() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PROJECTS.map(project => (
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
                <span>{project.cardCount} cards</span>
                <span>Updated {formatRelativeTime(project.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {MOCK_PROJECTS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <SquareKanban size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium text-text-primary mb-1">No projects yet</p>
            <p className="text-sm">Create a project to organize your work</p>
          </div>
        )}
      </div>
    </div>
  );
}
