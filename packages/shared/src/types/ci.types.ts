export interface CIPipeline {
  id: string;
  repositoryId: string;
  commitSha: string;
  commitMessage: string;
  commitAuthor: string;
  triggerEvent: 'push' | 'pull_request' | 'tag' | 'manual' | 'schedule' | 'webhook';
  status: PipelineStatus;
  conclusion: PipelineConclusion | null;
  name: string;
  workflowFile: string;
  branchName: string;
  tagName: string | null;
  runNumber: number;
  runAttempt: number;
  actorId: string;
  actorUsername: string;
  actorAvatar: string | null;
  jobCount: number;
  completedJobCount: number;
  duration: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStatus = 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';

export type PipelineConclusion = 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'stale';

export interface CIJob {
  id: string;
  pipelineId: string;
  name: string;
  label: string;
  status: PipelineStatus;
  conclusion: PipelineConclusion | null;
  runnerName: string | null;
  runnerVersion: string | null;
  runnerOs: string | null;
  machineType: string | null;
  image: string | null;
  commands: string[];
  environment: Record<string, string>;
  dependencies: string[];
  logCount: number;
  artifactCount: number;
  duration: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CIJobLog {
  id: string;
  jobId: string;
  content: string;
  lineCount: number;
  size: number;
  truncated: boolean;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CIArtifact {
  id: string;
  jobId: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  downloadCount: number;
  downloadUrl: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CIWorkflow {
  id: string;
  repositoryId: string;
  name: string;
  path: string;
  content: string;
  isActive: boolean;
  triggerEvents: string[];
  lastRunAt: string | null;
  lastRunStatus: PipelineConclusion | null;
  createdAt: string;
  updatedAt: string;
}

export interface CIRunner {
  id: string;
  name: string;
  os: string;
  architecture: string;
  labels: string[];
  status: 'online' | 'offline' | 'busy' | 'idle';
  ipAddress: string;
  version: string;
  lastPingAt: string;
  createdAt: string;
  updatedAt: string;
}
