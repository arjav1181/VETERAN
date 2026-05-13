import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import {
  TrendingUp,
  Star,
  GitFork,
  Users,
  Flame,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { searchApi } from '@lib/api/endpoints/search';

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['explore', 'trending'],
    queryFn: () => searchApi.repos({ q: 'stars:>1000', sort: 'stars', order: 'desc', per_page: 5 }),
    staleTime: 300_000,
  });

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ['explore', 'topics'],
    queryFn: () => searchApi.topics({ q: 'popular', per_page: 6 }),
    staleTime: 300_000,
  });

  const trendingRepos = trendingData?.items ?? [];
  const topics = topicsData?.items ?? [];

  const tabs: TabItem[] = [
    {
      id: 'trending',
      label: 'Trending',
      icon: <Flame className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          <TrendingReposSection repos={trendingRepos} loading={trendingLoading} />
          <TrendingDevsSection />
        </div>
      ),
    },
    {
      id: 'topics',
      label: 'Topics',
      icon: <Star className="w-4 h-4" />,
      content: <TopicsSection topics={topics} loading={topicsLoading} />,
    },
    {
      id: 'awesome',
      label: 'Awesome Lists',
      icon: <Star className="w-4 h-4" />,
      content: <AwesomeSection />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">Explore</h1>
        <p className="text-surface-500 mt-1">Discover trending repositories, topics, and developers.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-xl">
          <VeteranInput
            placeholder="Search repositories, topics, developers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <VeteranButton variant="secondary">Languages</VeteranButton>
        <VeteranButton variant="secondary">Date Range</VeteranButton>
      </div>

      <VeteranTabs tabs={tabs} variant="underline" />
    </div>
  );
}

function TrendingReposSection({ repos, loading }: { repos: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-veteran-500" />
          <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))]">Trending Repositories</h2>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <VeteranSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <VeteranEmptyState icon="folder" title="No trending repos" description="Trending repositories will appear here." />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-veteran-500" />
        <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))]">Trending Repositories</h2>
      </div>
      <div className="space-y-2">
        {repos.map((repo: any, i: number) => (
          <div key={repo.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold text-surface-300 dark:text-surface-600 w-6">#{i + 1}</span>
                <div>
                  <Link to={`/${repo.full_name || repo.fullName}`} className="text-base font-semibold text-veteran-600 dark:text-veteran-400 hover:underline">
                    {repo.full_name || repo.fullName}
                  </Link>
                  <p className="text-sm text-surface-500 mt-0.5">{repo.description || ''}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-veteran-500" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {(repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {(repo.forks_count ?? repo.forkCount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <VeteranButton variant="ghost" size="sm">
                <Star className="w-4 h-4" />
              </VeteranButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingDevsSection() {
  return (
    <VeteranEmptyState
      icon="users"
      title="Trending Developers"
      description="Developer rankings coming soon."
    />
  );
}

function TopicsSection({ topics, loading }: { topics: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))] mb-4">Popular Topics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <VeteranSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <VeteranEmptyState icon="search" title="No topics found" description="Popular topics will appear here." />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))] mb-4">Popular Topics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic: any) => (
          <Link
            key={topic.name}
            to={`/topics/${topic.name}`}
            className="card-hover p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">{topic.display_name || topic.name}</span>
            </div>
            <p className="text-xs text-surface-400">{(topic.count ?? 0).toLocaleString()} repositories</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <VeteranBadge variant="info" size="sm">{topic.name}</VeteranBadge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AwesomeSection() {
  return (
    <VeteranEmptyState
      icon="code"
      title="Awesome Lists"
      description="Curated lists of awesome projects, organized by topic. Coming soon."
    />
  );
}
