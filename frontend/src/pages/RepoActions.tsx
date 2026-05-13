import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { WorkflowList } from '@/components/actions/WorkflowList';
import type { CIPipeline } from '@/types';

const MOCK_RUNS: CIPipeline[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `run-${i}`,
  repositoryId: '1',
  commitSha: `abc${i}def${i}ghi`,
  commitMessage: `feat: update feature implementation #${i + 1}`,
  commitAuthor: ['jane-dev', 'john-doe'][i % 2],
  triggerEvent: (i < 8 ? 'push' : i < 12 ? 'pull_request' : 'schedule') as any,
  status: (i < 7 ? 'completed' : i < 9 ? 'in_progress' : 'queued') as any,
  conclusion: i < 7 ? (i < 5 ? 'success' : i < 6 ? 'failure' : 'cancelled') as any : null,
  name: ['CI Build', 'Lint Check', 'Test Suite', 'Deploy', 'Security Scan', 'Integration Tests'][i % 6],
  workflowFile: '.github/workflows/main.yml',
  branchName: i < 10 ? 'main' : `feature/test-${i}`,
  tagName: null,
  runNumber: 100 + i,
  runAttempt: 1,
  actorId: 'u1',
  actorUsername: ['jane-dev', 'john-doe'][i % 2],
  actorAvatar: null,
  jobCount: 3,
  completedJobCount: i < 7 ? 3 : i < 9 ? 2 : 0,
  duration: i < 7 ? Math.floor(Math.random() * 300000 + 30000) : null,
  startedAt: i < 9 ? new Date(Date.now() - (i + 1) * 3600000).toISOString() : null,
  completedAt: i < 7 ? new Date(Date.now() - (i + 1) * 3600000).toISOString() : null,
  createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
  updatedAt: new Date(Date.now() - i * 600000).toISOString(),
}));

export function RepoActions() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Play size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Actions</h1>
        </div>

        <WorkflowList
          runs={MOCK_RUNS}
          onRunClick={(id) => navigate(`/${owner}/${name}/actions/runs/${id}`)}
        />
      </div>
    </div>
  );
}
