import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranContribGraph } from '@ui/VeteranContribGraph';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { relativeTime } from '@lib/dates';
import { api } from '@lib/api/client';
import {
  MapPin,
  Link2 as LinkIcon,
  Calendar,
  Users,
  GitFork,
  Star,
  Mail,
  Building2,
  Twitter,
  MoreHorizontal,
} from 'lucide-react';

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const displayName = username || 'unknown';

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => api.get<any>(`/users/${username}`),
    enabled: !!username,
  });

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['user-repos', username],
    queryFn: () => api.get<any[]>(`/users/${username}/repos`, { params: { per_page: 10, sort: 'updated' } }),
    enabled: !!username,
  });

  const { data: contribData } = useQuery({
    queryKey: ['user-contributions', username],
    queryFn: () => api.get<any>(`/users/${username}/contributions`),
    enabled: !!username,
  });

  const user = userData as any;
  const userRepos = (repos as any[]) ?? [];
  const contributions = contribData as any;

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {contributions ? (
            <VeteranContribGraph data={contributions.days || contributions} />
          ) : (
            <div className="h-32 bg-surface rounded-lg animate-pulse" />
          )}
          {reposLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <VeteranSkeleton key={i} variant="card" />
              ))}
            </div>
          ) : userRepos.length === 0 ? (
            <VeteranEmptyState icon="folder" title="No repositories" description="This user has no public repositories yet." />
          ) : (
            <div className="space-y-2">
              {userRepos.map((repo: any) => (
                <Link
                  key={repo.id}
                  to={`/${displayName}/${repo.name}`}
                  className="card-hover p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-surface-400" />
                      <span className="text-sm font-semibold text-veteran-600 dark:text-veteran-400">
                        {displayName}/{repo.name}
                      </span>
                      <VeteranBadge variant={repo.private || repo.isPrivate ? 'default' : 'success'} size="sm">
                        {repo.private || repo.isPrivate ? 'Private' : 'Public'}
                      </VeteranBadge>
                    </div>
                    {(repo.description) && (
                      <p className="text-sm text-surface-500 mt-1 ml-6">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 ml-6 text-xs text-surface-400">
                      {(repo.language) && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-veteran-500" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks_count ?? repo.forkCount ?? 0}
                      </span>
                      <span>Updated {relativeTime(repo.updated_at || repo.pushedAt || repo.updatedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'repos',
      label: 'Repositories',
      badge: userRepos.length,
      content: <div className="text-sm text-surface-500">Repository list with search</div>,
    },
    {
      id: 'stars',
      label: 'Stars',
      content: <div className="text-sm text-surface-500">Starred repositories</div>,
    },
    {
      id: 'followers',
      label: 'Followers',
      content: <div className="text-sm text-surface-500">Followers list</div>,
    },
    {
      id: 'following',
      label: 'Following',
      content: <div className="text-sm text-surface-500">Following list</div>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          {userLoading ? (
            <div className="w-20 h-20 rounded-full bg-surface animate-pulse" />
          ) : (
            <VeteranAvatar
              src={user?.avatarUrl || user?.avatar_url}
              name={user?.displayName || user?.name || displayName}
              size="2xl"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              {userLoading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-surface rounded animate-pulse w-48" />
                  <div className="h-5 bg-surface rounded animate-pulse w-32" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">{user?.displayName || user?.name || displayName}</h1>
                  <p className="text-surface-500">{user?.bio || 'No bio'}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <VeteranButton variant="primary" size="sm">Follow</VeteranButton>
              <VeteranButton variant="ghost" size="sm" icon={<MoreHorizontal className="w-4 h-4" />} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(user?.followers ?? user?.followers_count ?? 0).toLocaleString()} followers
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(user?.following ?? user?.following_count ?? 0).toLocaleString()} following
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {userRepos.reduce((sum: number, r: any) => sum + (r.stars_count ?? r.starCount ?? r.stargazers_count ?? 0), 0).toLocaleString()} stars
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-surface-500">
            {(user?.company) && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {user.company}
              </span>
            )}
            {(user?.location) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
            )}
            {(user?.websiteUrl || user?.website || user?.blog) && (
              <a href={user?.websiteUrl || user?.website || user?.blog} className="flex items-center gap-1 text-veteran-500 hover:underline">
                <LinkIcon className="w-3.5 h-3.5" />
                {user?.websiteUrl || user?.website || user?.blog}
              </a>
            )}
            {(user?.created_at || user?.createdAt) && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(user.created_at || user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <VeteranTabs tabs={tabs} variant="underline" />
    </div>
  );
}
