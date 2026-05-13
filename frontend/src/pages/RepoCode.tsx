import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FileTree } from '@/components/repo/FileTree';
import { FileViewer } from '@/components/repo/FileViewer';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { BranchSelector } from '@/components/repo/BranchSelector';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { useRepo, useRepoContents, useRepoReadme, useRepoBranches } from '@/hooks/useRepo';
import { VeteranSkeleton } from '@/components/ui/VeteranSkeleton';
import { VeteranEmptyState } from '@/components/ui/VeteranEmptyState';

export function RepoCode() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState('main');

  if (!owner || !name) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid URL</h2>
          <p className="text-text-secondary mb-4">The URL must include both owner and repository name.</p>
          <p className="text-text-muted text-xs mb-4">Expected: /owner/repo-name</p>
          <a href="/" className="text-accent hover:underline text-sm">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  const { data: repo, isLoading: repoLoading, error: repoError } = useRepo(owner, name);
  const { data: contents, isLoading: contentsLoading } = useRepoContents(owner, name, '', currentBranch);
  const { data: readme } = useRepoReadme(owner, name, currentBranch);
  const { data: branches = [] } = useRepoBranches(owner, name);

  const readmeContent = useMemo(() => {
    if (readme?.content) {
      try {
        return atob(readme.content);
      } catch {
        return readme.content;
      }
    }
    return null;
  }, [readme]);

  if (repoLoading) {
    return (
      <div className="min-h-screen bg-primary-dark p-6 space-y-4">
        <VeteranSkeleton variant="card" /><VeteranSkeleton variant="card" />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <VeteranSkeleton variant="card" />
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (repoError || !repo) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Repository not found</h2>
          <p className="text-text-secondary mb-4">
            {repoError instanceof Error ? repoError.message : 
             repoError ? String(repoError) : 
             `The repository ${owner}/${name} does not exist or you may not have access.`}
          </p>
          <p className="text-text-muted text-xs mb-4">
            API: GET /api/v1/repos/{owner}/{name}
          </p>
          <a href="/" className="text-accent hover:underline text-sm">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <RepoHeader
          repo={repo as any}
          owner={owner!}
          name={name!}
          starCount={repo.starsCount ?? 0}
          forkCount={repo.forksCount ?? 0}
          watchCount={repo.watchersCount ?? 0}
        />

        <div className="flex items-center gap-4 my-4">
          <BranchSelector
            branches={branches.map(b => ({ name: b.name, sha: b.commit?.sha || '', isProtected: false }))}
            tags={[]}
            currentBranch={currentBranch}
            onSelectBranch={setCurrentBranch}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            {contentsLoading ? (
              <div className="space-y-2"><VeteranSkeleton variant="text" count={8} /></div>
            ) : (
              <FileTree
                files={(contents || []).map(c => ({
                  name: c.name,
                  path: c.path,
                  type: c.type as 'file' | 'dir',
                  size: c.size ?? 0,
                  sha: c.sha ?? '',
                }))}
                onFileSelect={setSelectedFile}
                selectedPath={selectedFile || undefined}
              />
            )}
          </div>

          <div className="space-y-6">
            {selectedFile ? (
              <FileViewer
                filename={selectedFile}
                content=""
                size={0}
              />
            ) : (
              readmeContent ? (
                <div className="border border-border rounded-lg p-6 bg-primary-dark">
                  <MarkdownRenderer content={readmeContent} />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-6 bg-primary-dark text-text-muted text-center">
                  <VeteranEmptyState
                    icon="file"
                    title="No README"
                    description="This repository does not have a README file yet."
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
