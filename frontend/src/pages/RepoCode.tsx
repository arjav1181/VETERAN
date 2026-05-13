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

  const { data: repo, isLoading: repoLoading, error: repoError } = useRepo(owner!, name!);
  const { data: contents, isLoading: contentsLoading } = useRepoContents(owner!, name!, '');
  const { data: readme } = useRepoReadme(owner!, name!);
  const { data: branches = [] } = useRepoBranches(owner!, name!);

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
      <div className="min-h-screen bg-primary-dark">
        <VeteranEmptyState
          icon="file"
          title="Repository not found"
          description={repoError ? 'An error occurred loading this repository.' : 'This repository does not exist or you may not have access.'}
          action={{ label: 'Go Home', href: '/' }}
        />
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
