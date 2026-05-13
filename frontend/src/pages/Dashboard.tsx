import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranSkeleton, VeteranSkeletonGroup } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { useAuthStore } from '@stores/authStore';
import { useRepos } from '@hooks/useRepo';
import { relativeTime } from '@lib/dates';
import {
  GitFork,
  GitPullRequest,
  Bug,
  Star,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Activity,
  BookOpen,
  Users,
  Code2,
} from 'lucide-react';
import { cn } from '@lib/utils';
import type { Repo } from '@lib/api/endpoints/repos';

const quickActions = [
  { label: 'New repository', icon: Plus, color: 'text-veteran-500 bg-veteran-100 dark:bg-veteran-900/30', onClick: () => {} },
  { label: 'New organization', icon: Users, color: 'text-brand-500 bg-brand-100 dark:bg-brand-900/30', onClick: () => {} },
  { label: 'Browse documentation', icon: BookOpen, color: 'text-green-500 bg-green-100 dark:bg-green-900/30', onClick: () => {} },
  { label: 'View trending', icon: TrendingUp, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30', onClick: () => {} },
];

export function Dashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');

  const { data: repos, isLoading: reposLoading } = useRepos({ type: 'owner', per_page: 10 });

  const totalStars = repos?.reduce((sum, r) => sum + (r.stars_count ?? r.starCount ?? 0), 0) ?? 0;
  const totalPRs = repos?.reduce((sum, r) => sum + (r.openPullCount ?? 0), 0) ?? 0;
  const totalIssues = repos?.reduce((sum, r) => sum + (r.openIssuesCount ?? r.openIssueCount ?? 0), 0) ?? 0;

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Activity className="w-4 h-4" />,
      content: <OverviewTab repos={repos} loading={reposLoading} />,
    },
    {
      id: 'repos',
      label: 'Repositories',
      icon: <GitFork className="w-4 h-4" />,
      content: <ReposTab repos={repos} loading={reposLoading} />,
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: <Bug className="w-4 h-4" />,
      content: <IssuesTab />,
    },
    {
      id: 'pulls',
      label: 'Pull Requests',
      icon: <GitPullRequest className="w-4 h-4" />,
      content: <PullsTab />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">
            Welcome back, {user?.name?.split(' ')[0] || user?.username}
          </h1>
          <p className="text-surface-500 mt-1">Here's what's happening with your repositories.</p>
        </div>
        <div className="flex items-center gap-2">
          <VeteranButton variant="secondary" icon={<Star className="w-4 h-4" />}>
            Explore
          </VeteranButton>
          <VeteranButton icon={<Plus className="w-4 h-4" />}>
            New Repository
          </VeteranButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Repositories', value: repos?.length ?? 0, icon: GitFork, color: 'text-veteran-500' },
          { label: 'Pull Requests', value: String(totalPRs), icon: GitPullRequest, color: 'text-green-500' },
          { label: 'Open Issues', value: String(totalIssues), icon: Bug, color: 'text-red-500' },
          { label: 'Stars', value: String(totalStars), icon: Star, color: 'text-brand-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">{stat.value}</p>
                  <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
                </div>
                <Icon className={cn('w-8 h-8', stat.color)} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <VeteranTabs tabs={tabs} activeTab={tab} onChange={setTab} variant="underline" />
    </div>
  );
}

function OverviewTab({ repos, loading }: { repos?: Repo[]; loading: boolean }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))]">Recent Repositories</h2>
          <Link to="/dashboard?tab=repos" className="text-sm text-veteran-500 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <VeteranSkeletonGroup count={5} variant="card" />
        ) : repos && repos.length > 0 ? (
          <div className="space-y-2">
            {repos.map((repo) => (
              <Link
                key={repo.id}
                to={`/${repo.full_name || repo.fullName}`}
                className="card-hover p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GitFork className="w-5 h-5 text-surface-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--veteran-fg))] truncate">
                      {repo.full_name || repo.fullName}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5 truncate">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-400 flex-shrink-0">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-veteran-500" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repo.stars_count ?? repo.starCount ?? 0}
                  </span>
                  <span>{relativeTime(repo.pushed_at || repo.pushedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <VeteranEmptyState
            icon="folder"
            title="No repositories yet"
            description="Create your first repository to get started."
            action={{ label: 'Create repository', onClick: () => {} }}
          />
        )}
      </div>

      <div className="space-y-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', action.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Recent Activity</h3>
          <VeteranEmptyState
            icon="inbox"
            title="No recent activity"
            description="Your recent activity will appear here."
          />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Contributions</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-veteran-500">0</div>
            <div className="text-xs text-surface-500">
              contributions
              <br />
              this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReposTab({ repos, loading }: { repos?: Repo[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VeteranInput placeholder="Find a repository..." className="w-72" />
        </div>
        <VeteranButton icon={<Plus className="w-4 h-4" />}>New</VeteranButton>
      </div>

      {loading ? (
        <VeteranSkeletonGroup count={8} variant="card" />
      ) : repos && repos.length > 0 ? (
        <div className="space-y-1">
          {repos.map((repo) => (
            <div key={repo.id} className="card-hover p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/${repo.full_name || repo.fullName}`} className="text-base font-semibold text-veteran-600 dark:text-veteran-400 hover:underline">
                    {repo.full_name || repo.fullName}
                  </Link>
                  {repo.description && (
                    <p className="text-sm text-surface-500 mt-1">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-veteran-500" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars_count ?? repo.starCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count ?? repo.forkCount ?? 0}
                    </span>
                    <span>Updated {relativeTime(repo.updated_at || repo.updatedAt)}</span>
                  </div>
                </div>
                <VeteranBadge variant={repo.private ? 'default' : 'success'} size="sm">
                  {repo.private ? 'Private' : 'Public'}
                </VeteranBadge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <VeteranEmptyState
          icon="folder"
          title="No repositories yet"
          description="Create your first repository to get started."
          action={{ label: 'Create repository', onClick: () => {} }}
        />
      )}
    </div>
  );
}

function IssuesTab() {
  return (
    <VeteranEmptyState
      icon="inbox"
      title="No issues assigned to you"
      description="Issues assigned to you will appear here."
    />
  );
}

function PullsTab() {
  return (
    <VeteranEmptyState
      icon="pull"
      title="No pull requests"
      description="Pull requests from your repositories will appear here."
    />
  );
}
