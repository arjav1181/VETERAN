import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { useAuthStore } from '@stores/authStore';
import { useRepos } from '@hooks/useRepo';
import { searchApi } from '@lib/api/endpoints/search';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranSkeleton, VeteranSkeletonGroup } from '@ui/VeteranSkeleton';
import { VeteranContribGraph } from '@ui/VeteranContribGraph';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { relativeTime, formatShortDate } from '@lib/dates';
import { cn, formatRelativeTime } from '@lib/utils';
import {
  Home,
  AlertCircle,
  GitPullRequest,
  Play,
  Package,
  Monitor,
  Star,
  Folder,
  Plus,
  ChevronLeft,
  TrendingUp,
  Users,
  BookOpen,
  GitCommit,
  MessageSquare,
  GitFork,
  UserPlus,
  Tag,
  GitMerge,
  Clock,
  Flame,
  Activity,
  PanelLeftClose,
  PanelLeft,
  Hash,
  GitBranch,
  List,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

type ActivityType =
  | 'push'
  | 'opened_pr'
  | 'comment_issue'
  | 'star'
  | 'fork'
  | 'create_repo'
  | 'follow'
  | 'release'
  | 'merge_pr';

interface ActivityPayload {
  commits?: Array<{ sha: string; message: string }>;
  branch?: string;
  prNumber?: number;
  prTitle?: string;
  issueNumber?: number;
  releaseVersion?: string;
  ref?: string;
  refType?: string;
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: { username: string; avatarUrl: string | null; name?: string };
  repo: { owner: string; name: string };
  createdAt: string;
  payload: ActivityPayload;
}

interface ActivityGroup {
  label: string;
  items: ActivityItem[];
}

interface OrgItem {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface TrendingRepo {
  id: string;
  fullName: string;
  description: string | null;
  language: string | null;
  starsCount: number;
  forksCount: number;
  starsToday?: number;
}

interface TopicItem {
  name: string;
  displayName: string;
  description: string;
  count: number;
  color?: string;
}

interface Announcement {
  id: string;
  title: string;
  url: string;
  date: string;
}

const topicColors = [
  '#E8B84B', '#4493F8', '#3FB950', '#F85149',
  '#BC8CFF', '#F0883E', '#79C0FF', '#FF7B72',
  '#D2A8FF', '#7EE787', '#FFA657', '#FFC107',
];

function groupActivities(items: ActivityItem[]): ActivityGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, ActivityItem[]> = { Today: [], Yesterday: [], 'Last week': [] };
  const older: ActivityGroup[] = [];

  for (const item of items) {
    const d = new Date(item.createdAt);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dayStart >= today) {
      groups.Today.push(item);
    } else if (dayStart >= yesterday) {
      groups.Yesterday.push(item);
    } else if (dayStart >= lastWeek) {
      groups['Last week'].push(item);
    } else {
      const monthKey = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      let group = older.find((g) => g.label === monthKey);
      if (!group) {
        group = { label: monthKey, items: [] };
        older.push(group);
      }
      group.items.push(item);
    }
  }

  const result: ActivityGroup[] = [];
  for (const label of ['Today', 'Yesterday', 'Last week'] as const) {
    if (groups[label].length > 0) {
      result.push({ label, items: groups[label] });
    }
  }
  return [...result, ...older];
}

function eventText(item: ActivityItem): { text: string; detail?: string } {
  const repoPath = `/${item.repo.owner}/${item.repo.name}`;
  switch (item.type) {
    case 'push': {
      const n = item.payload.commits?.length ?? 0;
      return {
        text: `Pushed ${n} commit${n !== 1 ? 's' : ''} to`,
        detail: `${repoPath} on ${item.payload.branch ?? 'main'}`,
      };
    }
    case 'opened_pr':
      return {
        text: `Opened PR #${item.payload.prNumber}`,
        detail: `"${item.payload.prTitle}" in ${repoPath}`,
      };
    case 'comment_issue':
      return {
        text: `Commented on issue #${item.payload.issueNumber}`,
        detail: `in ${repoPath}`,
      };
    case 'star':
      return { text: 'Starred', detail: repoPath };
    case 'fork':
      return { text: 'Forked', detail: repoPath };
    case 'create_repo':
      return { text: 'Created repository', detail: repoPath };
    case 'follow':
      return { text: 'Followed', detail: item.payload.ref ?? '' };
    case 'release':
      return {
        text: `Released ${item.payload.releaseVersion}`,
        detail: `in ${repoPath}`,
      };
    case 'merge_pr':
      return {
        text: `Merged PR #${item.payload.prNumber}`,
        detail: `in ${repoPath}`,
      };
    default:
      return { text: 'Unknown event', detail: repoPath };
  }
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  push: GitCommit,
  opened_pr: GitPullRequest,
  comment_issue: MessageSquare,
  star: Star,
  fork: GitFork,
  create_repo: Folder,
  follow: UserPlus,
  release: Tag,
  merge_pr: GitMerge,
};

const activityIconBg: Record<ActivityType, string> = {
  push: 'bg-accent-blue/20 text-accent-blue',
  opened_pr: 'bg-success/20 text-success',
  comment_issue: 'bg-accent-blue/20 text-accent-blue',
  star: 'bg-accent-gold/20 text-accent-gold',
  fork: 'bg-[#BC8CFF]/20 text-[#BC8CFF]',
  create_repo: 'bg-[#79C0FF]/20 text-[#79C0FF]',
  follow: 'bg-[#7EE787]/20 text-[#7EE787]',
  release: 'bg-[#FFA657]/20 text-[#FFA657]',
  merge_pr: 'bg-[#D2A8FF]/20 text-[#D2A8FF]',
};

export function Dashboard() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: repos, isLoading: reposLoading } = useRepos({ type: 'owner', per_page: 10 });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: () => api.get<ActivityItem[]>('/user/events', { params: { per_page: 30 } }),
    staleTime: 30_000,
  });

  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['dashboard', 'orgs'],
    queryFn: () => api.get<OrgItem[]>('/user/orgs'),
    staleTime: 60_000,
  });

  const { data: issueCount } = useQuery({
    queryKey: ['dashboard', 'issue-count'],
    queryFn: () => api.get<{ count: number }>('/user/issues/count', { params: { state: 'open', filter: 'assigned' } }),
    staleTime: 30_000,
  });

  const { data: prCount } = useQuery({
    queryKey: ['dashboard', 'pr-count'],
    queryFn: () => api.get<{ count: number }>('/user/pulls/count', { params: { state: 'open' } }),
    staleTime: 30_000,
  });

  const { data: codespaceCount } = useQuery({
    queryKey: ['dashboard', 'codespace-count'],
    queryFn: () => api.get<{ count: number }>('/user/codespaces/count'),
    staleTime: 30_000,
  });

  const { data: trendingData } = useQuery({
    queryKey: ['dashboard', 'trending'],
    queryFn: () => searchApi.repos({ q: 'stars:>1', sort: 'stars', order: 'desc', per_page: 5 }),
    staleTime: 300_000,
  });

  const { data: topicsData } = useQuery({
    queryKey: ['dashboard', 'topics'],
    queryFn: () => searchApi.topics({ q: 'popular', per_page: 8 }),
    staleTime: 300_000,
  });

  const { data: contribData } = useQuery({
    queryKey: ['dashboard', 'contributions'],
    queryFn: () => api.get<Record<string, number>>('/user/contributions'),
    staleTime: 60_000,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['dashboard', 'announcements'],
    queryFn: () => api.get<Announcement[]>('/announcements', { params: { per_page: 5 } }),
    staleTime: 300_000,
  });

  const activities = activitiesData ?? [];
  const orgs = orgsData ?? [];
  const trendingRepos = (trendingData?.items ?? []).slice(0, 5);
  const topics = (topicsData?.items ?? []).slice(0, 8);
  const announcements = announcementsData ?? [];
  const activityGroups = useMemo(() => groupActivities(activities), [activities]);

  const recentRepos = useMemo(() => {
    if (!repos) return [];
    return [...repos]
      .sort((a, b) => new Date(b.pushedAt ?? b.pushed_at ?? 0).getTime() - new Date(a.pushedAt ?? a.pushed_at ?? 0).getTime())
      .slice(0, 5);
  }, [repos]);

  const totalStars = repos?.reduce((s, r) => s + (r.starsCount ?? r.stars_count ?? 0), 0) ?? 0;
  const totalPRs = repos?.reduce((s, r) => s + (r.openPullCount ?? 0), 0) ?? 0;
  const totalIssues = repos?.reduce((s, r) => s + (r.openIssuesCount ?? r.openIssueCount ?? 0), 0) ?? 0;

  return (
    <div className="flex gap-0 min-h-[calc(100vh-4rem)]">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r border-[#30363D] overflow-hidden"
          >
            <div className="w-[280px] h-full overflow-y-auto bg-[#0D1117] p-4 space-y-6">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 text-[#8D96A0] hover:text-[#E6EDF3] text-sm mb-2"
              >
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </button>

              <Section title="YOU">
                <NavItem to="/" icon={Home} label="Home" active />
                <NavItem
                  to="/issues"
                  icon={AlertCircle}
                  label="Issues"
                  count={issueCount?.count}
                  iconColor="text-[#F85149]"
                />
                <NavItem
                  to="/pulls"
                  icon={GitPullRequest}
                  label="Pull Requests"
                  count={prCount?.count}
                  iconColor="text-[#3FB950]"
                />
                <NavItem to="/actions" icon={Play} label="Actions" />
                <NavItem to="/packages" icon={Package} label="Packages" />
                <NavItem
                  to="/codespaces"
                  icon={Monitor}
                  label="Codespaces"
                  count={codespaceCount?.count}
                  iconColor="text-[#4493F8]"
                />
                <NavItem to="/stars" icon={Star} label="Starred repos" />
                <NavItem
                  to="/new"
                  icon={Folder}
                  label="Your repositories"
                  action={
                    <Link
                      to="/new"
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#21262D] text-[#8D96A0] hover:text-[#E6EDF3]"
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                  }
                />
              </Section>

              <Section title="RECENT REPOSITORIES">
                {reposLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <VeteranSkeleton key={i} variant="text" className="h-5" />
                    ))}
                  </div>
                ) : recentRepos.length === 0 ? (
                  <p className="text-xs text-[#484F58]">No recent repositories</p>
                ) : (
                  <div className="space-y-0.5">
                    {recentRepos.map((repo) => (
                      <Link
                        key={repo.id}
                        to={`/${(repo.fullName || repo.full_name) ?? ''}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors truncate"
                      >
                        <Folder className="w-4 h-4 flex-shrink-0 text-[#484F58]" />
                        <span className="truncate">{repo.fullName || repo.full_name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="YOUR ORGANIZATIONS">
                {orgsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <VeteranSkeleton key={i} variant="text" className="h-5" />
                    ))}
                  </div>
                ) : orgs.length === 0 ? (
                  <p className="text-xs text-[#484F58]">No organizations yet</p>
                ) : (
                  <div className="space-y-0.5">
                    {orgs.map((org) => (
                      <Link
                        key={org.id}
                        to={`/${org.name}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                      >
                        <VeteranAvatar src={org.avatarUrl} name={org.name} size="xs" />
                        <span>{org.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="EXPLORE">
                <NavItem to="/explore" icon={Flame} label="Trending repositories" />
                <NavItem to="/explore?tab=topics" icon={BookOpen} label="Explore topics" />
                <NavItem to="/explore?tab=people" icon={Users} label="Discover people" />
              </Section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-shrink-0 p-2 border-r border-[#30363D] hover:bg-[#21262D] text-[#8D96A0] self-start"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      <main className="flex-1 min-w-0 max-w-[700px] mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">
            Welcome back, {user?.name?.split(' ')[0] || user?.username}
          </h1>
          <p className="text-[#8D96A0] mt-1">Here's what's happening with your repositories.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Repositories', value: repos?.length ?? 0, icon: Folder, color: 'text-[#4493F8]' },
            { label: 'Pull Requests', value: totalPRs, icon: GitPullRequest, color: 'text-[#3FB950]' },
            { label: 'Open Issues', value: totalIssues, icon: AlertCircle, color: 'text-[#F85149]' },
            { label: 'Stars', value: totalStars, icon: Star, color: 'text-[#E8B84B]' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 bg-[#161B22] border border-[#30363D] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#E6EDF3]">{stat.value}</p>
                    <p className="text-xs text-[#8D96A0] mt-1">{stat.label}</p>
                  </div>
                  <Icon className={cn('w-8 h-8 opacity-60', stat.color)} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <section>
          <h2 className="text-base font-semibold text-[#E6EDF3] mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4493F8]" />
            Activity
          </h2>

          {activitiesLoading ? (
            <VeteranSkeletonGroup count={5} variant="card" />
          ) : activityGroups.length === 0 ? (
            <VeteranEmptyState
              icon="inbox"
              title="No recent activity"
              description="Your recent activity across repositories will appear here."
            />
          ) : (
            <div className="space-y-6">
              {activityGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-2">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = activityIcons[item.type];
                      const { text, detail } = eventText(item);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="card-hover bg-[#161B22] border border-[#30363D] rounded-lg p-3 flex items-start gap-3"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                              activityIconBg[item.type]
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <VeteranAvatar
                                src={item.actor.avatarUrl}
                                name={item.actor.name || item.actor.username}
                                size="xs"
                              />
                              <span className="text-sm font-medium text-[#E6EDF3]">
                                {item.actor.name || item.actor.username}
                              </span>
                            </div>
                            <p className="text-sm text-[#8D96A0] mt-1">
                              {text}{' '}
                              <Link
                                to={`/${item.repo.owner}/${item.repo.name}`}
                                className="text-[#4493F8] hover:underline"
                              >
                                {detail}
                              </Link>
                            </p>
                            {item.type === 'push' && item.payload.commits && item.payload.commits.length > 0 && (
                              <div className="mt-2 space-y-1 pl-3 border-l-2 border-[#30363D]">
                                {item.payload.commits.slice(0, 3).map((c) => (
                                  <div key={c.sha} className="flex items-start gap-2 text-xs text-[#8D96A0]">
                                    <GitBranch className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="font-mono text-[#484F58]">{c.sha.slice(0, 7)}</span>
                                    <span className="truncate">{c.message.split('\n')[0]}</span>
                                  </div>
                                ))}
                                {item.payload.commits.length > 3 && (
                                  <p className="text-xs text-[#484F58] pl-5">
                                    +{item.payload.commits.length - 3} more commits
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-[#484F58] mt-1.5">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {relativeTime(item.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#E6EDF3] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4493F8]" />
              Explore repositories
            </h2>
            <Link
              to="/explore"
              className="text-xs text-[#4493F8] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {reposLoading ? (
            <VeteranSkeletonGroup count={3} variant="card" />
          ) : repos && repos.length > 0 ? (
            <div className="space-y-2">
              {repos.slice(0, 4).map((repo) => (
                <Link
                  key={repo.id}
                  to={`/${repo.fullName || repo.full_name}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#21262D] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder className="w-4 h-4 text-[#484F58] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#E6EDF3] truncate">
                        {repo.fullName || repo.full_name}
                      </p>
                      <p className="text-xs text-[#8D96A0] truncate">
                        {repo.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8D96A0] flex-shrink-0">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#4493F8]" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.starsCount ?? repo.stars_count ?? 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#8D96A0]">No repositories to explore</p>
              <Link
                to="/new"
                className="text-sm text-[#4493F8] hover:underline mt-1 inline-block"
              >
                Create your first repository
              </Link>
            </div>
          )}
        </section>
      </main>

      <aside className="w-[296px] flex-shrink-0 border-l border-[#30363D] bg-[#0D1117] p-4 space-y-6 overflow-y-auto hidden xl:block">
        <div className="card bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Latest changes
          </h3>
          {announcements.length === 0 ? (
            <div className="space-y-3">
              {[
                { title: 'VETERAN v2.0 release', date: '2 days ago' },
                { title: 'New CI/CD pipeline features', date: '5 days ago' },
                { title: 'Improved code review experience', date: '1 week ago' },
                { title: 'Security updates available', date: '2 weeks ago' },
                { title: 'Team collaboration enhancements', date: '3 weeks ago' },
              ].map((item, i) => (
                <div key={i} className="text-sm">
                  <p className="text-[#E6EDF3] hover:text-[#4493F8] cursor-pointer">{item.title}</p>
                  <p className="text-xs text-[#484F58] mt-0.5">{item.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="text-sm">
                  <a href={a.url} className="text-[#E6EDF3] hover:text-[#4493F8] cursor-pointer">
                    {a.title}
                  </a>
                  <p className="text-xs text-[#484F58] mt-0.5">{formatRelativeTime(a.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            Explore topics
          </h3>
          {topics.length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {['react', 'typescript', 'python', 'rust', 'go', 'kubernetes', 'machine-learning', 'api'].map(
                (topic, i) => (
                  <Link
                    key={topic}
                    to={`/topics/${topic}`}
                    className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${topicColors[i % topicColors.length]}15`,
                      color: topicColors[i % topicColors.length],
                    }}
                  >
                    {topic}
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <Link
                  key={topic.name}
                  to={`/topics/${topic.name}`}
                  className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: `${topicColors[i % topicColors.length]}15`,
                    color: topicColors[i % topicColors.length],
                  }}
                >
                  {topic.displayName || topic.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <GitCommit className="w-3 h-3" />
            Your contributions
          </h3>
          <VeteranContribGraph
            data={contribData ?? {}}
            colorScheme="green"
            className="[&_.w-3]:w-2.5 [&_.h-3]:h-2.5"
          />
        </div>

        <div className="card bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame className="w-3 h-3 text-[#F85149]" />
            Trending today
          </h3>
          {trendingRepos.length === 0 ? (
            <div className="space-y-3">
              {[
                { name: 'facebook/react', desc: 'A declarative UI library', lang: 'TypeScript', stars: 482 },
                { name: 'microsoft/vscode', desc: 'Visual Studio Code', lang: 'TypeScript', stars: 321 },
                { name: 'rust-lang/rust', desc: 'Systems programming', lang: 'Rust', stars: 289 },
                { name: 'kubernetes/kubernetes', desc: 'Production-Grade Container Scheduling', lang: 'Go', stars: 195 },
                { name: 'tailwindlabs/tailwindcss', desc: 'A utility-first CSS framework', lang: 'CSS', stars: 143 },
              ].map((repo, i) => (
                <div key={i} className="text-sm">
                  <Link to={`/${repo.name}`} className="text-[#E6EDF3] hover:text-[#4493F8] font-medium">
                    {repo.name}
                  </Link>
                  <p className="text-xs text-[#8D96A0] mt-0.5 truncate">{repo.desc}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#484F58]">
                    {repo.lang && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#4493F8]" />
                        {repo.lang}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars} today
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {trendingRepos.map((repo) => {
                const fullName = repo.fullName || repo.full_name || '';
                return (
                  <div key={repo.id} className="text-sm">
                    <Link to={`/${fullName}`} className="text-[#E6EDF3] hover:text-[#4493F8] font-medium">
                      {fullName}
                    </Link>
                    <p className="text-xs text-[#8D96A0] mt-0.5 truncate">
                      {repo.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#484F58]">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#4493F8]" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {(repo.starsCount ?? 0).toLocaleString()} today
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#8D96A0] uppercase tracking-wider mb-2 px-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  count,
  active,
  iconColor,
  action,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
  iconColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group',
        active
          ? 'bg-[#21262D] text-[#E6EDF3] font-medium'
          : 'text-[#8D96A0] hover:text-[#E6EDF3] hover:bg-[#21262D]'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor || 'text-[#484F58] group-hover:text-[#E6EDF3]')} />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <VeteranBadge size="sm" variant="default" className="text-[10px] px-1.5 py-0">
          {count > 99 ? '99+' : count}
        </VeteranBadge>
      )}
      {action && <span className="opacity-0 group-hover:opacity-100 transition-opacity">{action}</span>}
    </Link>
  );
}
