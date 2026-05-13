import { useState } from 'react';
import { Terminal, Plus } from 'lucide-react';
import { CodespaceList } from '@/components/codespaces/CodespaceList';
import type { Codespace } from '@/types';

const MOCK_CODESPACES: Codespace[] = [
  {
    id: 'cs-1', userId: 'u1', repositoryId: 'repo-1', branchName: 'main',
    commitSha: 'abc123', displayName: 'my-project-main', machineType: 'basic',
    cpu: 2, memory: 4, storage: 32, state: 'running', location: 'us-west',
    containerImage: 'ubuntu:22.04', containerUser: 'veteran',
    containerWorkspaceFolder: '/workspace', idleTimeoutMinutes: 30,
    maxLifetimeMinutes: 480, shutdownTimeoutMinutes: 30,
    ports: [], features: {}, gitStatus: { ahead: 0, behind: 0, hasUncommittedChanges: false, hasUnpushedChanges: false, currentBranch: 'main', recentBranches: [] },
    url: 'https://cs-1.veteran.dev', webUrl: 'https://cs-1.veteran.dev',
    lastActivityAt: new Date(Date.now() - 600000).toISOString(),
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    stoppedAt: null, createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'cs-2', userId: 'u1', repositoryId: 'repo-2', branchName: 'feature/new-ui',
    commitSha: 'def456', displayName: 'my-project-feature', machineType: 'standard',
    cpu: 4, memory: 8, storage: 64, state: 'stopped', location: 'us-east',
    containerImage: 'ubuntu:22.04', containerUser: 'veteran',
    containerWorkspaceFolder: '/workspace', idleTimeoutMinutes: 30,
    maxLifetimeMinutes: 480, shutdownTimeoutMinutes: 30,
    ports: [], features: {}, gitStatus: { ahead: 3, behind: 1, hasUncommittedChanges: true, hasUnpushedChanges: true, currentBranch: 'feature/new-ui', recentBranches: ['main'] },
    url: null, webUrl: null,
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    startedAt: null, stoppedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function CodespacesPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Codespaces</h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} /> New codespace
          </button>
        </div>

        <CodespaceList
          codespaces={MOCK_CODESPACES}
          onStart={(id) => console.log('Start', id)}
          onStop={(id) => console.log('Stop', id)}
          onDelete={(id) => console.log('Delete', id)}
          onOpen={(id) => console.log('Open', id)}
          onCreate={() => setShowCreate(true)}
        />
      </div>
    </div>
  );
}
