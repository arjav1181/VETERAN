import { useParams, useNavigate } from 'react-router-dom';
import { CommitList } from '@/components/repo/CommitList';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { useRepoCommits, useRepoBranches, useRepo } from '@hooks/useRepo';
import { useQuery } from '@tanstack/react-query';
import { repoApi } from '@lib/api/endpoints/repos';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getRepoParams } from '@lib/route-utils';

function mapCommit(apiCommit: any): any {
  return {
    id: apiCommit.sha,
    repositoryId: '',
    sha: apiCommit.sha,
    shortSha: apiCommit.sha.substring(0, 7),
    message: apiCommit.message,
    messageHeadline: apiCommit.message.split('\n')[0],
    messageBody: apiCommit.message.includes('\n') ? apiCommit.message.substring(apiCommit.message.indexOf('\n') + 1).trim() : null,
    authorId: null,
    authorName: apiCommit.author?.name || '',
    authorEmail: apiCommit.author?.email || '',
    authorAvatar: null,
    committerName: apiCommit.committer?.name || '',
    committerEmail: apiCommit.committer?.email || '',
    committerAvatar: null,
    authoredAt: apiCommit.author?.date || '',
    committedAt: apiCommit.committer?.date || '',
    parentShas: [],
    treeSha: '',
    isVerified: false,
    verificationSignature: null,
    verificationPayload: null,
    verificationSigner: null,
    verificationIdentity: null,
    additions: apiCommit.stats?.additions || 0,
    deletions: apiCommit.stats?.deletions || 0,
    totalChanges: apiCommit.stats?.total || 0,
    fileCount: apiCommit.files?.length || 0,
    branchNames: [],
    tagNames: [],
    createdAt: apiCommit.committer?.date || '',
  };
}

export function RepoCommits() {
  const { owner, repo: name } = getRepoParams();
  const navigate = useNavigate();

  const { data: repo, isLoading: repoLoading } = useRepo(owner!, name!);
  const { data: commits, isLoading: commitsLoading, error } = useRepoCommits(owner!, name!);

  if (repoLoading || commitsLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranSkeleton variant="card" />
          <div className="h-6 w-32 bg-surface rounded animate-pulse mt-6 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <VeteranSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load commits" description="There was an error loading the commits." />
        </div>
      </div>
    );
  }

  const mappedCommits = (commits ?? []).map(mapCommit);

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {owner && name && repo && (
          <RepoHeader
            repo={repo as any}
            owner={owner}
            name={name}
            starCount={(repo as any).stars_count ?? repo.starCount ?? 0}
            forkCount={(repo as any).forks_count ?? repo.forkCount ?? 0}
            watchCount={(repo as any).watchers_count ?? repo.watchCount ?? 0}
          />
        )}

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-4">Commits</h2>

        {mappedCommits.length === 0 ? (
          <VeteranEmptyState icon="code" title="No commits yet" description="This repository has no commits." />
        ) : (
          <CommitList
            commits={mappedCommits}
            onCommitClick={(sha) => navigate(`/${owner}/${name}/commit/${sha}`)}
            onAuthorClick={(author) => console.log('Author:', author)}
          />
        )}
      </div>
    </div>
  );
}
