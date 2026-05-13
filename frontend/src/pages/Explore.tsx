import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranButton } from '@ui/VeteranButton';
import {
  TrendingUp,
  Star,
  GitFork,
  Users,
  Flame,
  Search,
  ArrowUpRight,
} from 'lucide-react';

const trendingRepos = [
  { id: '1', name: 'veteran/opencode', description: 'The veteran-owned AI coding assistant', language: 'TypeScript', stars: 12500, forks: 3400, todayStars: 340, author: { name: 'veteran', avatar: null } },
  { id: '2', name: 'rust-lang/rust', description: 'Empowering everyone to build reliable and efficient software.', language: 'Rust', stars: 89200, forks: 12000, todayStars: 280, author: { name: 'rust-lang', avatar: null } },
  { id: '3', name: 'denoland/deno', description: 'A modern runtime for JavaScript and TypeScript.', language: 'TypeScript', stars: 92300, forks: 5100, todayStars: 190, author: { name: 'denoland', avatar: null } },
  { id: '4', name: 'tauri-apps/tauri', description: 'Build smaller, faster, and more secure desktop applications.', language: 'Rust', stars: 75000, forks: 2200, todayStars: 170, author: { name: 'tauri-apps', avatar: null } },
  { id: '5', name: 'supabase/supabase', description: 'The open source Firebase alternative.', language: 'TypeScript', stars: 63400, forks: 4800, todayStars: 155, author: { name: 'supabase', avatar: null } },
];

const trendingDevs = [
  { id: '1', name: 'Sarah Chen', username: 'sarahchen', bio: 'Building the future of AI', repos: 89, followers: 12500 },
  { id: '2', name: 'Marcus Johnson', username: 'mjohnson', bio: 'Rust enthusiast & open source maintainer', repos: 156, followers: 8900 },
  { id: '3', name: 'Alex Rivera', username: 'arivera', bio: 'Frontend architect, Vite core team', repos: 234, followers: 15200 },
];

const topics = [
  { name: 'ai', display: 'Artificial Intelligence', count: 45200 },
  { name: 'web3', display: 'Web3', count: 32100 },
  { name: 'rust', display: 'Rust', count: 28900 },
  { name: 'machine-learning', display: 'Machine Learning', count: 56700 },
  { name: 'react', display: 'React', count: 72300 },
  { name: 'devops', display: 'DevOps', count: 23400 },
];

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: TabItem[] = [
    {
      id: 'trending',
      label: 'Trending',
      icon: <Flame className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          <TrendingReposSection repos={trendingRepos} />
          <TrendingDevsSection devs={trendingDevs} />
        </div>
      ),
    },
    {
      id: 'topics',
      label: 'Topics',
      icon: <Star className="w-4 h-4" />,
      content: <TopicsSection topics={topics} />,
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

function TrendingReposSection({ repos }: { repos: typeof trendingRepos }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-veteran-500" />
        <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))]">Trending Repositories</h2>
      </div>
      <div className="space-y-2">
        {repos.map((repo, i) => (
          <div key={repo.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold text-surface-300 dark:text-surface-600 w-6">#{i + 1}</span>
                <div>
                  <Link to={`/${repo.name}`} className="text-base font-semibold text-veteran-600 dark:text-veteran-400 hover:underline">
                    {repo.name}
                  </Link>
                  <p className="text-sm text-surface-500 mt-0.5">{repo.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-veteran-500" />
                      {repo.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <ArrowUpRight className="w-3 h-3" />
                      {repo.todayStars} today
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

function TrendingDevsSection({ devs }: { devs: typeof trendingDevs }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-veteran-500" />
        <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))]">Trending Developers</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devs.map((dev, i) => (
          <div key={dev.id} className="card-hover p-4">
            <div className="flex items-start gap-3">
              <VeteranAvatar name={dev.name} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">{dev.name}</span>
                  <span className="text-xs text-surface-400">#{i + 1}</span>
                </div>
                <p className="text-xs text-surface-500">{dev.username}</p>
                <p className="text-xs text-surface-400 mt-1 line-clamp-2">{dev.bio}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                  <span>{dev.repos} repos</span>
                  <span>{dev.followers.toLocaleString()} followers</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicsSection({ topics }: { topics: typeof topics }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[rgb(var(--veteran-fg))] mb-4">Popular Topics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <Link
            key={topic.name}
            to={`/topics/${topic.name}`}
            className="card-hover p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">{topic.display}</span>
            </div>
            <p className="text-xs text-surface-400">{topic.count.toLocaleString()} repositories</p>
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
    <div className="space-y-4">
      <p className="text-sm text-surface-500">Curated lists of awesome projects, organized by topic.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Awesome React', description: 'A collection of awesome React libraries and tools', count: 1200 },
          { title: 'Awesome Rust', description: 'Curated list of Rust code and resources', count: 890 },
          { title: 'Awesome Machine Learning', description: 'ML frameworks, libraries, and software', count: 3400 },
          { title: 'Awesome Selfhosted', description: 'Selfhosted software and services', count: 2100 },
          { title: 'Awesome Go', description: 'A curated list of awesome Go frameworks', count: 1500 },
          { title: 'Awesome Python', description: 'Python frameworks, libraries and resources', count: 2800 },
        ].map((list) => (
          <Link key={list.title} to="#" className="card-hover p-4">
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">{list.title}</h3>
            <p className="text-xs text-surface-500 mt-1">{list.description}</p>
            <p className="text-xs text-surface-400 mt-2">{list.count} items</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
