export interface Codespace {
  id: string;
  userId: string;
  repositoryId: string;
  branchName: string;
  commitSha: string;
  displayName: string;
  machineType: 'basic' | 'standard' | 'premium' | 'enterprise';
  cpu: number;
  memory: number;
  storage: number;
  state: CodespaceState;
  location: string;
  containerImage: string;
  containerUser: string;
  containerWorkspaceFolder: string;
  idleTimeoutMinutes: number;
  maxLifetimeMinutes: number;
  shutdownTimeoutMinutes: number;
  ports: CodespacePort[];
  features: Record<string, string>;
  gitStatus: CodespaceGitStatus;
  url: string | null;
  webUrl: string | null;
  lastActivityAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CodespaceState =
  | 'provisioning'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'stopping'
  | 'shutting_down'
  | 'deleted'
  | 'failed';

export interface CodespacePort {
  id: string;
  codespaceId: string;
  port: number;
  protocol: 'http' | 'https';
  visibility: 'public' | 'private' | 'org';
  label: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CodespaceGitStatus {
  ahead: number;
  behind: number;
  hasUncommittedChanges: boolean;
  hasUnpushedChanges: boolean;
  currentBranch: string;
  recentBranches: string[];
}

export interface CodespaceMachine {
  id: string;
  name: string;
  displayName: string;
  cpu: number;
  memory: number;
  storage: number;
  priceHourly: number;
  prebuildAvailable: boolean;
}

export interface CodespacePrebuild {
  id: string;
  repositoryId: string;
  branchName: string;
  commitSha: string;
  state: 'pending' | 'building' | 'ready' | 'failed';
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
