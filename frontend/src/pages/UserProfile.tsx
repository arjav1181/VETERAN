import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranContribGraph } from '@ui/VeteranContribGraph';
import { relativeTime } from '@lib/dates';
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

const mockContribData: Record<string, number> = {};
for (let i = 0; i < 365; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const key = date.toISOString().split('T')[0];
  mockContribData[key] = Math.floor(Math.random() * 15);
}

const mockRepos = [
  { id: '1', name: 'opencode', description: 'AI-powered coding assistant', stars: 12500, forks: 3400, language: 'TypeScript', updated: '2024-05-12', private: false },
  { id: '2', name: 'veteran-cli', description: 'CLI for VETERAN platform', stars: 3200, forks: 890, language: 'Rust', updated: '2024-05-10', private: false },
  { id: '3', name: 'deploy-tools', description: 'Deployment automation toolkit', stars: 890, forks: 234, language: 'Go', updated: '2024-05-08', private: true },
];

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const displayName = username || 'unknown';

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          <VeteranContribGraph data={mockContribData} />
          <div className="space-y-2">
            {mockRepos.map((repo) => (
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
                    <VeteranBadge variant={repo.private ? 'default' : 'success'} size="sm">
                      {repo.private ? 'Private' : 'Public'}
                    </VeteranBadge>
                  </div>
                  {repo.description && (
                    <p className="text-sm text-surface-500 mt-1 ml-6">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 ml-6 text-xs text-surface-400">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-veteran-500" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks}
                    </span>
                    <span>Updated {relativeTime(repo.updated)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'repos',
      label: 'Repositories',
      badge: mockRepos.length,
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
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          <VeteranAvatar name={displayName} size="2xl" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">{displayName}</h1>
              <p className="text-surface-500">Software Engineer</p>
            </div>
            <div className="flex items-center gap-2">
              <VeteranButton variant="primary" size="sm">Follow</VeteranButton>
              <VeteranButton variant="ghost" size="sm" icon={<MoreHorizontal className="w-4 h-4" />} />
            </div>
          </div>

          <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
            Building tools that matter. Open source advocate. Veteran.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              1,234 followers
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              567 following
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              12,500 stars
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              VETERAN
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              San Francisco, CA
            </span>
            <a href="#" className="flex items-center gap-1 text-veteran-500 hover:underline">
              <LinkIcon className="w-3.5 h-3.5" />
              veteran.ai
            </a>
            <a href="#" className="flex items-center gap-1 text-veteran-500 hover:underline">
              <Twitter className="w-3.5 h-3.5" />
              @{displayName}
            </a>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined January 2023
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <VeteranTabs tabs={tabs} variant="underline" />
    </div>
  );
}
