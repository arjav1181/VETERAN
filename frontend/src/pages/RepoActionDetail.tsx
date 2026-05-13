import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RunDetail } from '@/components/actions/RunDetail';
import type { CIPipeline, CIJob } from '@/types';

const MOCK_RUN: CIPipeline = {
  id: 'run-1',
  repositoryId: '1',
  commitSha: 'abc123def456ghi789',
  commitMessage: 'feat: implement CI/CD pipeline optimizations',
  commitAuthor: 'jane-dev',
  triggerEvent: 'push',
  status: 'in_progress',
  conclusion: null,
  name: 'CI Build & Test',
  workflowFile: '.github/workflows/ci.yml',
  branchName: 'main',
  tagName: null,
  runNumber: 145,
  runAttempt: 1,
  actorId: 'u1',
  actorUsername: 'jane-dev',
  actorAvatar: null,
  jobCount: 4,
  completedJobCount: 2,
  duration: null,
  startedAt: new Date(Date.now() - 600000).toISOString(),
  completedAt: null,
  createdAt: new Date(Date.now() - 600000).toISOString(),
  updatedAt: new Date(Date.now() - 300000).toISOString(),
};

const MOCK_JOBS: CIJob[] = [
  { id: 'job-1', pipelineId: 'run-1', name: 'Install Dependencies', label: 'ubuntu-latest', status: 'completed', conclusion: 'success', runnerName: null, runnerVersion: null, runnerOs: null, machineType: null, image: null, commands: [], environment: {}, dependencies: [], logCount: 45, artifactCount: 0, duration: 120000, startedAt: new Date(Date.now() - 600000).toISOString(), completedAt: new Date(Date.now() - 480000).toISOString(), createdAt: '', updatedAt: '' },
  { id: 'job-2', pipelineId: 'run-1', name: 'Lint Check', label: 'ubuntu-latest', status: 'completed', conclusion: 'success', runnerName: null, runnerVersion: null, runnerOs: null, machineType: null, image: null, commands: [], environment: {}, dependencies: ['Install Dependencies'], logCount: 32, artifactCount: 0, duration: 90000, startedAt: new Date(Date.now() - 480000).toISOString(), completedAt: new Date(Date.now() - 390000).toISOString(), createdAt: '', updatedAt: '' },
  { id: 'job-3', pipelineId: 'run-1', name: 'Run Tests', label: 'ubuntu-latest', status: 'in_progress', conclusion: null, runnerName: null, runnerVersion: null, runnerOs: null, machineType: null, image: null, commands: [], environment: {}, dependencies: ['Install Dependencies'], logCount: 128, artifactCount: 0, duration: null, startedAt: new Date(Date.now() - 390000).toISOString(), completedAt: null, createdAt: '', updatedAt: '' },
  { id: 'job-4', pipelineId: 'run-1', name: 'Build Artifacts', label: 'ubuntu-latest', status: 'queued', conclusion: null, runnerName: null, runnerVersion: null, runnerOs: null, machineType: null, image: null, commands: [], environment: {}, dependencies: ['Run Tests', 'Lint Check'], logCount: 0, artifactCount: 0, duration: null, startedAt: null, completedAt: null, createdAt: '', updatedAt: '' },
];

export function RepoActionDetail() {
  const { owner, name, runId } = useParams<{ owner: string; name: string; runId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/actions`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to workflows
        </button>

        <RunDetail run={MOCK_RUN} jobs={MOCK_JOBS} />
      </div>
    </div>
  );
}
