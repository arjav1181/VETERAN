import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layout, Table, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoardView } from '@/components/projects/BoardView';
import { TableView } from '@/components/projects/TableView';
import { RoadmapView } from '@/components/projects/RoadmapView';
import type { ProjectColumn, ProjectCard } from '@/types';

const MOCK_COLUMNS: ProjectColumn[] = [
  { id: 'col-1', projectId: 'p1', name: 'Backlog', position: 0, cardCount: 5, isArchived: false, createdAt: '', updatedAt: '' },
  { id: 'col-2', projectId: 'p1', name: 'In Progress', position: 1, cardCount: 3, isArchived: false, createdAt: '', updatedAt: '' },
  { id: 'col-3', projectId: 'p1', name: 'In Review', position: 2, cardCount: 2, isArchived: false, createdAt: '', updatedAt: '' },
  { id: 'col-4', projectId: 'p1', name: 'Done', position: 3, cardCount: 4, isArchived: false, createdAt: '', updatedAt: '' },
];

const MOCK_CARDS: ProjectCard[] = [
  { id: 'card-1', columnId: 'col-1', projectId: 'p1', position: 0, contentId: null, contentType: 'note', note: 'Investigate authentication bug', isArchived: false, archivedAt: null, creatorId: 'u1', creatorUsername: 'jane-dev', createdAt: '', updatedAt: '' },
  { id: 'card-2', columnId: 'col-1', projectId: 'p1', position: 1, contentId: null, contentType: 'note', note: 'Design new dashboard layout', isArchived: false, archivedAt: null, creatorId: 'u2', creatorUsername: 'john-doe', createdAt: '', updatedAt: '' },
  { id: 'card-3', columnId: 'col-2', projectId: 'p1', position: 0, contentId: null, contentType: 'issue', note: 'Implement file upload', isArchived: false, archivedAt: null, creatorId: 'u1', creatorUsername: 'jane-dev', createdAt: '', updatedAt: '' },
  { id: 'card-4', columnId: 'col-2', projectId: 'p1', position: 1, contentId: null, contentType: 'issue', note: 'Add search functionality', isArchived: false, archivedAt: null, creatorId: 'u2', creatorUsername: 'john-doe', createdAt: '', updatedAt: '' },
  { id: 'card-5', columnId: 'col-3', projectId: 'p1', position: 0, contentId: null, contentType: 'pull_request', note: 'API optimization PR', isArchived: false, archivedAt: null, creatorId: 'u1', creatorUsername: 'jane-dev', createdAt: '', updatedAt: '' },
  { id: 'card-6', columnId: 'col-4', projectId: 'p1', position: 0, contentId: null, contentType: 'note', note: 'Complete database migration', isArchived: false, archivedAt: null, creatorId: 'u1', creatorUsername: 'jane-dev', createdAt: '', updatedAt: '' },
  { id: 'card-7', columnId: 'col-4', projectId: 'p1', position: 1, contentId: null, contentType: 'note', note: 'Deploy v1.0 to production', isArchived: false, archivedAt: null, creatorId: 'u2', creatorUsername: 'john-doe', createdAt: '', updatedAt: '' },
];

const ROADMAP_ITEMS = [
  { id: 'r1', title: 'Authentication System', startDate: new Date(2026, 0, 1), endDate: new Date(2026, 1, 15), progress: 100, assignee: 'Jane', status: 'completed' },
  { id: 'r2', title: 'Dashboard Redesign', startDate: new Date(2026, 1, 1), endDate: new Date(2026, 2, 30), progress: 60, assignee: 'John', status: 'in_progress' },
  { id: 'r3', title: 'API v2 Implementation', startDate: new Date(2026, 2, 15), endDate: new Date(2026, 4, 1), progress: 30, assignee: 'Jane', status: 'in_progress' },
  { id: 'r4', title: 'Mobile App Support', startDate: new Date(2026, 4, 1), endDate: new Date(2026, 6, 30), progress: 0, assignee: 'Bob', status: 'planned' },
  { id: 'r5', title: 'Performance Optimization', startDate: new Date(2026, 3, 1), endDate: new Date(2026, 5, 15), progress: 10, assignee: 'Alice', status: 'planned' },
];

export function RepoProjectDetail() {
  const { owner, name, number } = useParams<{ owner: string; name: string; number: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'table' | 'roadmap'>('board');

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
          <h1 className="text-xl font-bold text-text-primary">Q1 2026 Roadmap</h1>
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
            <BoardView columns={MOCK_COLUMNS} cards={MOCK_CARDS} />
          )}
          {view === 'table' && (
            <TableView
              cards={MOCK_CARDS}
              columns={[
                { id: 'title', name: 'Title', field: 'title' },
                { id: 'status', name: 'Status', field: 'status' },
                { id: 'assignee', name: 'Assignee', field: 'assignee' },
              ]}
            />
          )}
          {view === 'roadmap' && (
            <RoadmapView items={ROADMAP_ITEMS} />
          )}
        </div>
      </div>
    </div>
  );
}
