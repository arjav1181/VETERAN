import { useParams, useNavigate } from 'react-router-dom';
import { CommitList } from '@/components/repo/CommitList';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { BranchSelector } from '@/components/repo/BranchSelector';
import { useRepoCommits, useRepoBranches, useRepoTags, useRepo } from '@/hooks/useRepo';
import type { Commit } from '@/types';

const MOCK_COMMITS: Commit[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `commit-${i}`,
  repositoryId: '1',
  sha: `abc${i}def${i}ghi${i}jkl${i}mno${i}pqr`,
  shortSha: `abc${i}def`,
  message: `feat: implement feature number ${i + 1}`,
  messageHeadline: `feat: implement feature number ${i + 1}`,
  messageBody: i === 0 ? `This is a detailed commit message body that describes the changes made in this commit in more detail.\n\n- Added new functionality\n- Fixed some bugs\n- Updated documentation` : null,
  authorId: 'user-1',
  authorName: 'Jane Developer',
  authorEmail: 'jane@veteran.dev',
  authorAvatar: null,
  committerName: 'Jane Developer',
  committerEmail: 'jane@veteran.dev',
  committerAvatar: null,
  authoredAt: new Date(Date.now() - i * 3600000).toISOString(),
  committedAt: new Date(Date.now() - i * 3600000).toISOString(),
  parentShas: [],
  treeSha: 'tree123',
  isVerified: i === 0 || i === 1,
  verificationSignature: null,
  verificationPayload: null,
  verificationSigner: null,
  verificationIdentity: null,
  additions: Math.floor(Math.random() * 100 + 10),
  deletions: Math.floor(Math.random() * 50),
  totalChanges: 0,
  fileCount: Math.floor(Math.random() * 10 + 1),
  branchNames: ['main'],
  tagNames: [],
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export function RepoCommits() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

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

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-4">Commits</h2>

        <CommitList
          commits={MOCK_COMMITS}
          onCommitClick={(sha) => navigate(`/${owner}/${name}/commit/${sha}`)}
          onAuthorClick={(author) => console.log('Author:', author)}
        />
      </div>
    </div>
  );
}
