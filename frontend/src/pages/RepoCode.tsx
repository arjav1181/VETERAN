import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileTree } from '@/components/repo/FileTree';
import { FileViewer } from '@/components/repo/FileViewer';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { BranchSelector } from '@/components/repo/BranchSelector';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { useRepo, useRepoContents, useRepoReadme, useRepoBranches } from '@/hooks/useRepo';

export function RepoCode() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState('main');

  const { data: repo } = useRepo(owner!, name!);
  const { data: files } = useRepoContents(owner!, name!, '');
  const { data: readme } = useRepoReadme(owner!, name!);
  const { data: branches } = useRepoBranches(owner!, name!);

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {owner && name && (
          <RepoHeader
            repo={{
              id: '1', ownerId: '1', ownerName: owner, name: name!,
              fullName: `${owner}/${name}`, description: 'A repository',
              visibility: 'public', defaultBranch: 'main',
              isPrivate: false, isFork: false, isArchived: false,
              isDisabled: false, isMirror: false, isTemplate: false,
              isEmpty: false, openIssueCount: 5, openPullCount: 3,
              starCount: 42, forkCount: 12, watchCount: 8,
              diskUsage: 1024, size: 2048, topics: [],
              hasIssues: true, hasWiki: true, hasProjects: true,
              hasDiscussions: true, hasPackages: true, hasDownloads: true,
              allowForking: true, allowRebaseMerge: true, allowSquashMerge: true,
              allowMergeCommit: true, deleteBranchOnMerge: false,
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
              pushedAt: new Date().toISOString(),
            } as any}
            owner={owner}
            name={name}
            starCount={42}
            forkCount={12}
            watchCount={8}
          />
        )}

        <div className="flex items-center gap-4 my-4">
          <BranchSelector
            branches={(branches || []).map(b => ({ ...b, name: b.name })) as any}
            tags={tags || []}
            currentBranch={currentBranch}
            onSelectBranch={setCurrentBranch}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            <FileTree
              files={files || MOCK_FILES}
              onFileSelect={setSelectedFile}
              selectedPath={selectedFile || undefined}
            />
          </div>

          <div className="space-y-6">
            {selectedFile ? (
              <FileViewer
                filename={selectedFile}
                content="// File content would load here..."
                size={1024}
              />
            ) : (
              <>
                {readme?.content ? (
                  <div className="border border-border rounded-lg p-6 bg-primary-dark">
                    <MarkdownRenderer content={atob(readme.content)} />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-6 bg-primary-dark">
                    <MarkdownRenderer content={MOCK_README} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
