import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCommit, Clock, User, CheckCircle, Copy } from 'lucide-react';
import { cn, formatRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { DiffViewer } from '@/components/repo/DiffViewer';

export function RepoCommitDetail() {
  const { owner, name, sha } = useParams<{ owner: string; name: string; sha: string }>();
  const navigate = useNavigate();

  const commit = {
    sha: sha || 'abc123def456',
    shortSha: (sha || 'abc123def456').substring(0, 7),
    message: 'feat: add new feature implementation with comprehensive testing',
    messageBody: 'This commit introduces a new feature that enhances the platform\'s capabilities.\n\nKey changes:\n- Added new API endpoints\n- Implemented database migrations\n- Added comprehensive test coverage\n- Updated documentation',
    authorName: 'Jane Developer',
    authorEmail: 'jane@veteran.dev',
    authoredAt: new Date(Date.now() - 86400000).toISOString(),
    committedAt: new Date(Date.now() - 86400000).toISOString(),
    isVerified: true,
    additions: 245,
    deletions: 67,
    totalChanges: 312,
    fileCount: 12,
    parentShas: ['parent123456'],
    parentCommits: ['feat: implement previous feature'],
  };

  const diffFiles = [
    {
      sha: 'file1', filename: 'src/api/routes.ts', status: 'modified' as const,
      additions: 120, deletions: 30, changes: 150,
      patch: `@@ -1,5 +1,10 @@\n import { Router } from 'express';\n import { authenticate } from '../middleware';\n+import { newFeature } from './newFeature';\n \n const router = Router();\n \n+router.post('/api/v2/feature', authenticate, newFeature);\n+router.get('/api/v2/feature/:id', getFeature);\n+\n export default router;`,
    },
    {
      sha: 'file2', filename: 'src/services/newFeature.ts', status: 'added' as const,
      additions: 89, deletions: 0, changes: 89,
      patch: `@@ -0,0 +1,89 @@\n+import { PrismaClient } from '@prisma/client';\n+\n+const prisma = new PrismaClient();\n+\n+export async function newFeature(data: NewFeatureData) {\n+  const result = await prisma.feature.create({\n+    data: {\n+      name: data.name,\n+      description: data.description,\n+    },\n+  });\n+  return result;\n+}`,
    },
    {
      sha: 'file3', filename: 'src/types/index.ts', status: 'modified' as const,
      additions: 36, deletions: 37, changes: 73,
      patch: `@@ -10,7 +10,7 @@ export interface User {\n   email: string;\n   displayName: string | null;\n-  oldField: string;\n+  newField: string;\n   avatarUrl: string | null;`,
    },
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to commits
        </button>

        <div className="border border-border rounded-lg bg-surface p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <GitCommit size={20} className="text-accent" />
            <code className="text-sm font-mono text-text-primary font-medium">{commit.sha}</code>
            <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors" title="Copy SHA">
              <Copy size={14} />
            </button>
            {commit.isVerified && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-2xs text-success bg-success/20 rounded-full">
                <CheckCircle size={10} /> Verified
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-2">{commit.message}</h2>

          <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              <span className="text-text-secondary font-medium">{commit.authorName}</span>
            </span>
            <span className="flex items-center gap-1.5" title={formatAbsoluteTime(commit.committedAt)}>
              <Clock size={14} /> {formatRelativeTime(commit.committedAt)}
            </span>
            <span className="text-success">+{commit.additions}</span>
            <span className="text-danger">-{commit.deletions}</span>
            <span>{commit.fileCount} files</span>
          </div>

          {commit.messageBody && (
            <div className="mt-3 p-3 bg-primary-dark border border-border rounded-lg">
              <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">{commit.messageBody}</pre>
            </div>
          )}
        </div>

        <DiffViewer
          files={diffFiles}
          stats={{ additions: commit.additions, deletions: commit.deletions, total: commit.totalChanges }}
        />
      </div>
    </div>
  );
}
