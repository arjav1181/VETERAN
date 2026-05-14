import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranContribGraph } from '@ui/VeteranContribGraph';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { VeteranTooltip } from '@ui/VeteranTooltip';
import { VeteranMarkdown } from '@ui/VeteranMarkdown';
import { VeteranInput } from '@ui/VeteranInput';
import { relativeTime } from '@lib/dates';
import { api } from '@lib/api/client';
import { useAuthStore } from '@stores/authStore';
import { getOwnerParam } from '@lib/route-utils';
import {
  MapPin,
  Link2 as LinkIcon,
  Users,
  GitFork,
  Star,
  Mail,
  Building2,
  Twitter,
  Calendar,
  Search,
  BookOpen,
  Package,
  Shield,
  Award,
  Heart,
  Sparkles,
  Trophy,
  ChevronDown,
  Eye,
  GitCommit,
  Activity,
  ExternalLink,
  Verified,
} from 'lucide-react';

type LanguageColor = { color: string };
const languageColors: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', Ruby: '#DA3832',
  C: '#555555', 'C++': '#F34B7D', 'C#': '#178600', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89E051', HTML: '#E34F26',
  CSS: '#563D7C', Scala: '#C22D40', Dart: '#00B4AB', Lua: '#000080',
  Dockerfile: '#384D54', Elixir: '#6E4A7E', Haskell: '#5E5086',
  Objective_C: '#438EFF', Clojure: '#DB5855', Groovy: '#4298B8',
};

function getLangColor(lang: string | null): string {
  if (!lang) return '#8D96A0';
  return languageColors[lang] || '#8D96A0';
}

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const displayName = username || getOwnerParam();
  const [activeTab, setActiveTab] = useState('overview');
  const [repoSearch, setRepoSearch] = useState('');
  const [repoType, setRepoType] = useState<'all' | 'sources' | 'forks' | 'archived'>('all');
  const [repoSort, setRepoSort] = useState<'updated' | 'name' | 'stars'>('updated');
  const [repoLang, setRepoLang] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-profile', displayName],
    queryFn: () => api.get<any>(`/users/${displayName}`),
    enabled: !!displayName,
  });
  const user = userData as any;

  const { data: reposData, isLoading: reposLoading } = useQuery({
    queryKey: ['user-repos', displayName],
    queryFn: () => api.get<any[]>(`/users/${displayName}/repos`, { params: { per_page: 100, sort: 'updated', direction: 'desc' } }),
    enabled: !!displayName,
  });
  const allRepos = (reposData as any[]) ?? [];

  const { data: pinnedData } = useQuery({
    queryKey: ['user-pinned', displayName],
    queryFn: () => api.get<any[]>(`/users/${displayName}/pinned`),
    enabled: !!displayName,
  });
  const pinnedRepos = (pinnedData as any[]) ?? [];

  const { data: contribData } = useQuery({
    queryKey: ['user-contributions', displayName],
    queryFn: () => api.get<any>(`/users/${displayName}/contributions`),
    enabled: !!displayName,
  });
  const contributions = contribData as any;

  const { data: orgsData } = useQuery({
    queryKey: ['user-orgs', displayName],
    queryFn: () => api.get<any[]>(`/users/${displayName}/orgs`),
    enabled: !!displayName,
  });
  const organizations = (orgsData as any[]) ?? [];

  const { data: starsData } = useQuery({
    queryKey: ['user-stars', displayName],
    queryFn: () => api.get<any[]>(`/users/${displayName}/stars`, { params: { per_page: 100 } }),
    enabled: !!displayName,
  });
  const starredRepos = (starsData as any[]) ?? [];

  const { data: sponsorsData } = useQuery({
    queryKey: ['user-sponsors', displayName],
    queryFn: () => api.get<any[]>(`/users/${displayName}/sponsors`),
    enabled: !!displayName,
  });
  const sponsors = (sponsorsData as any[]) ?? [];

  const isOwn = currentUser?.username === displayName || currentUser?.id === user?.id;
  const isFollowing = user?.viewerIsFollowing ?? false;

  const followMutation = useMutation({
    mutationFn: () => api.put(`/users/${displayName}/follow`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile', displayName] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => api.delete(`/users/${displayName}/follow`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile', displayName] }),
  });

  const langSet = useMemo(() => {
    const set = new Set<string>();
    allRepos.forEach((r: any) => { if (r.language) set.add(r.language); });
    return Array.from(set).sort();
  }, [allRepos]);

  const filteredRepos = useMemo(() => {
    let list = [...allRepos];
    if (repoSearch) {
      const q = repoSearch.toLowerCase();
      list = list.filter((r: any) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }
    if (repoType === 'sources') list = list.filter((r: any) => !r.isFork && !r.fork && !r.isArchived && !r.archived);
    else if (repoType === 'forks') list = list.filter((r: any) => r.isFork || r.fork);
    else if (repoType === 'archived') list = list.filter((r: any) => r.isArchived || r.archived);
    if (repoLang) list = list.filter((r: any) => r.language === repoLang);
    if (repoSort === 'name') list.sort((a: any, b: any) => a.name?.localeCompare(b.name));
    else if (repoSort === 'stars') list.sort((a: any, b: any) => (b.stars_count ?? b.starCount ?? b.stargazers_count ?? 0) - (a.stars_count ?? a.starCount ?? a.stargazers_count ?? 0));
    else list.sort((a: any, b: any) => new Date(b.updated_at || b.pushedAt || b.updatedAt || 0).getTime() - new Date(a.updated_at || a.pushedAt || a.updatedAt || 0).getTime());
    return list;
  }, [allRepos, repoSearch, repoType, repoLang, repoSort]);

  const totalStars = useMemo(() =>
    allRepos.reduce((sum: number, r: any) => sum + (r.stars_count ?? r.starCount ?? r.stargazers_count ?? 0), 0),
  [allRepos]);

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 skeleton w-48" />
            <div className="h-5 skeleton w-32" />
            <div className="h-4 skeleton w-96" />
            <div className="flex gap-6">
              <div className="h-4 skeleton w-24" />
              <div className="h-4 skeleton w-24" />
              <div className="h-4 skeleton w-20" />
            </div>
          </div>
        </div>
        <div className="flex gap-1 border-b border-[var(--border)]">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 skeleton w-28" />)}
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <VeteranEmptyState
        icon="alert"
        title="User not found"
        description={`No user named "${displayName}" was found.`}
      />
    );
  }

  const profileReadme = '' /* Ideally fetched from username/username repo */;
  const avatarUrl = user.avatarUrl || user.avatar_url;
  const displayNameStr = user.displayName || user.name || user.username;
  const userBio = user.bio;
  const userLocation = user.location;
  const userWebsite = user.websiteUrl || user.website || user.blog;
  const userTwitter = user.twitter || user.twitterUsername;
  const userCompany = user.company;
  const userPronouns = user.pronouns;
  const followers = user.followers ?? user.followers_count ?? 0;
  const following = user.following ?? user.following_count ?? 0;
  const joinedAt = user.created_at || user.createdAt;
  const userEmail = user.email;

  const tabs: TabItem[] = [
    {
      id: 'overview', label: 'Overview',
      content: <OverviewTab
        pinnedRepos={pinnedRepos}
        contributions={contributions}
        organizations={organizations}
        sponsors={sponsors}
        profileReadme={profileReadme}
        displayName={displayNameStr}
        username={displayName}
        allRepos={allRepos}
      />,
    },
    {
      id: 'repos', label: 'Repositories',
      badge: allRepos.length,
      content: <ReposTab
        repos={filteredRepos}
        loading={reposLoading}
        search={repoSearch}
        onSearchChange={setRepoSearch}
        type={repoType}
        onTypeChange={setRepoType}
        sort={repoSort}
        onSortChange={setRepoSort}
        lang={repoLang}
        onLangChange={setRepoLang}
        languages={langSet}
        username={displayName}
      />,
    },
    {
      id: 'projects', label: 'Projects',
      content: <VeteranEmptyState icon="folder" title="No projects yet" description="Projects help you organize and prioritize your work." />,
    },
    {
      id: 'packages', label: 'Packages',
      content: <VeteranEmptyState icon="box" title="No packages" description="You have not published any packages yet." />,
    },
    {
      id: 'stars', label: 'Stars',
      badge: starredRepos.length,
      content: <StarsTab repos={starredRepos} username={displayName} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 flex flex-col items-center sm:items-start gap-3">
          <VeteranAvatar src={avatarUrl} name={displayNameStr} size="2xl" className="ring-2 ring-[var(--border)]" />
          {isOwn && (
            <Link to="/settings">
              <VeteranButton variant="secondary" size="sm">Edit profile</VeteranButton>
            </Link>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{displayNameStr}</h1>
              <p className="text-[var(--text-secondary)]">@{user.username}</p>
              {userPronouns && <p className="text-xs text-[var(--text-disabled)] mt-0.5">{userPronouns}</p>}
            </div>
            <div className="flex items-center gap-2">
              {!isOwn && (
                <>
                  {isFollowing ? (
                    <VeteranButton
                      variant="secondary"
                      size="sm"
                      onClick={() => unfollowMutation.mutate()}
                      loading={unfollowMutation.isPending}
                    >
                      Following
                    </VeteranButton>
                  ) : (
                    <VeteranButton
                      variant="primary"
                      size="sm"
                      onClick={() => followMutation.mutate()}
                      loading={followMutation.isPending}
                    >
                      Follow
                    </VeteranButton>
                  )}
                  <VeteranButton variant="ghost" size="sm" icon={<Heart className="w-4 h-4 text-[var(--accent-gold)]" />}>
                    Sponsor
                  </VeteranButton>
                </>
              )}
            </div>
          </div>

          {userBio && <p className="text-sm text-[var(--text-primary)] mt-2 max-w-xl">{userBio}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-[var(--text-secondary)]">
            {userCompany && (
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{userCompany}</span>
            )}
            {userLocation && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{userLocation}</span>
            )}
            {userEmail && (
              <a href={`mailto:${userEmail}`} className="flex items-center gap-1 hover:text-[var(--text-link)] transition-colors">
                <Mail className="w-3.5 h-3.5" />{userEmail}
              </a>
            )}
            {userWebsite && (
              <a href={userWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--text-link)] transition-colors">
                <LinkIcon className="w-3.5 h-3.5" />{userWebsite.replace(/^https?:\/\//, '')}
              </a>
            )}
            {userTwitter && (
              <a href={`https://twitter.com/${userTwitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--text-link)] transition-colors">
                <Twitter className="w-3.5 h-3.5" />@{userTwitter.replace('@', '')}
              </a>
            )}
            {joinedAt && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {new Date(joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-secondary)]">
            <Link to={`/${displayName}/followers`} className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
              <strong className="text-[var(--text-primary)] font-semibold">{followers.toLocaleString()}</strong> followers
            </Link>
            <Link to={`/${displayName}/following`} className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
              <strong className="text-[var(--text-primary)] font-semibold">{following.toLocaleString()}</strong> following
            </Link>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <strong className="text-[var(--text-primary)] font-semibold">{totalStars.toLocaleString()}</strong> stars
            </span>
          </div>

          {user.achievements && user.achievements.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {user.achievements.slice(0, 6).map((ach: any, i: number) => (
                <VeteranTooltip key={i} content={ach.name || ach.title || 'Achievement'}>
                  <span className="text-lg cursor-default">{ach.icon || <Trophy className="w-5 h-5 text-[var(--accent-gold)]" />}</span>
                </VeteranTooltip>
              ))}
            </div>
          )}
        </div>
      </div>

      <VeteranTabs tabs={tabs} variant="underline" defaultTab="overview" onChange={setActiveTab} />
    </div>
  );
}

function OverviewTab({
  pinnedRepos, contributions, organizations, sponsors, profileReadme, displayName, username, allRepos,
}: {
  pinnedRepos: any[]; contributions: any; organizations: any[]; sponsors: any[];
  profileReadme: string; displayName: string; username: string; allRepos: any[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {profileReadme ? (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border)]">
              <VeteranAvatar src={undefined} name={displayName} size="sm" />
              <span className="text-sm font-medium text-[var(--text-primary)]">{username}/README.md</span>
            </div>
            <VeteranMarkdown content={profileReadme} />
          </div>
        ) : null}

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            <GitCommit className="w-4 h-4 inline mr-1.5" />
            Contribution graph
          </h3>
          {contributions ? (
            <VeteranContribGraph data={contributions.days || contributions} />
          ) : (
            <div className="h-32 skeleton rounded" />
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-secondary)]">
            <span>{(contributions?.totalContributions ?? contributions?.total ?? 0).toLocaleString()} contributions in the last year</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{
                  backgroundColor: i === 0 ? 'var(--surface-2)' : `rgba(63,185,80,${i * 0.25})`
                }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Activity</h3>
          {allRepos.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No recent activity</p>
          ) : (
            <div className="space-y-1">
              {allRepos.slice(0, 8).map((repo: any) => (
                <Link
                  key={repo.id}
                  to={`/${username}/${repo.name}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[var(--surface-3)] transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GitCommit className="w-3.5 h-3.5 text-[var(--text-disabled)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)] truncate">{repo.name}</span>
                    {repo.description && (
                      <span className="text-xs text-[var(--text-secondary)] truncate hidden sm:inline">— {repo.description}</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] shrink-0">{relativeTime(repo.updated_at || repo.pushedAt || repo.updatedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {pinnedRepos.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Pinned</h3>
            <div className="grid grid-cols-1 gap-3">
              {pinnedRepos.slice(0, 6).map((repo: any) => (
                <Link
                  key={repo.id || repo.name}
                  to={`/${username}/${repo.name}`}
                  className="card p-4 hover:border-[var(--text-disabled)] transition-colors block"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {(repo.isFork || repo.fork) && <GitFork className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />}
                    <span className="text-sm font-semibold text-[var(--accent-gold)] truncate">{repo.name}</span>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLangColor(repo.language) }} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks_count ?? repo.forkCount ?? 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {organizations.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Organizations</h3>
            <div className="flex flex-wrap gap-2">
              {organizations.map((org: any) => (
                <VeteranTooltip key={org.id || org.name} content={org.name || org.slug || org.login}>
                  <Link to={`/${org.slug || org.login || org.name}`}>
                    <VeteranAvatar
                      src={org.avatarUrl || org.avatar_url}
                      name={org.name || org.slug || '?'}
                      size="md"
                      className="ring-2 ring-[var(--border)] hover:ring-[var(--accent-gold)] transition-all"
                    />
                  </Link>
                </VeteranTooltip>
              ))}
            </div>
          </section>
        )}

        {sponsors.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              <Heart className="w-3 h-3 inline mr-1 text-[var(--accent-gold)]" />Sponsors
            </h3>
            <div className="flex flex-wrap gap-2">
              {sponsors.map((s: any) => (
                <VeteranTooltip key={s.id || s.username} content={s.name || s.username}>
                  <Link to={`/${s.username}`}>
                    <VeteranAvatar src={s.avatarUrl || s.avatar_url} name={s.name || s.username || '?'} size="sm" />
                  </Link>
                </VeteranTooltip>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            <Award className="w-3 h-3 inline mr-1" />Achievements
          </h3>
          <VeteranEmptyState icon="trophy" title="No achievements yet" description="Contribute to earn badges." />
        </section>
      </div>
    </div>
  );
}

function ReposTab({
  repos, loading, search, onSearchChange, type, onTypeChange, sort, onSortChange, lang, onLangChange, languages, username,
}: {
  repos: any[]; loading: boolean; search: string; onSearchChange: (v: string) => void;
  type: string; onTypeChange: (v: any) => void; sort: string; onSortChange: (v: any) => void;
  lang: string; onLangChange: (v: string) => void; languages: string[]; username: string;
}) {
  const typeFilters = [
    { id: 'all', label: 'All' },
    { id: 'sources', label: 'Sources' },
    { id: 'forks', label: 'Forks' },
    { id: 'archived', label: 'Archived' },
  ];

  const sortOptions = [
    { id: 'updated', label: 'Last updated' },
    { id: 'name', label: 'Name' },
    { id: 'stars', label: 'Stars' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <VeteranInput
            placeholder="Find a repository…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {typeFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => onTypeChange(f.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              type === f.id
                ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-[var(--text-disabled)] mx-1">|</span>
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value)}
          className="bg-transparent text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
        >
          <option value="">All languages</option>
          {languages.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
        >
          {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="h-5 skeleton w-48" />
              <div className="h-4 skeleton w-full" />
              <div className="flex gap-4"><div className="h-3 skeleton w-20" /><div className="h-3 skeleton w-16" /><div className="h-3 skeleton w-24" /></div>
            </div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <VeteranEmptyState icon="folder" title="No repositories found" description={search ? 'Try a different search term.' : 'This user has no repositories that match.'} />
      ) : (
        <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-md">
          {repos.map((repo: any) => (
            <div key={repo.id} className="p-4 hover:bg-[var(--surface-2)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/${username}/${repo.name}`}
                      className="text-base font-semibold text-[var(--accent-gold)] hover:underline truncate"
                    >
                      {repo.name}
                    </Link>
                    {(repo.isPrivate || repo.private) && (
                      <VeteranBadge variant="default" size="sm">Private</VeteranBadge>
                    )}
                    {(repo.isFork || repo.fork) && (
                      <VeteranBadge variant="info" size="sm">Fork</VeteranBadge>
                    )}
                    {(repo.isArchived || repo.archived) && (
                      <VeteranBadge variant="warning" size="sm">Archived</VeteranBadge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLangColor(repo.language) }} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks_count ?? repo.forkCount ?? 0}</span>
                    <span>Updated {relativeTime(repo.updated_at || repo.pushedAt || repo.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StarsTab({ repos, username }: { repos: any[]; username: string }) {
  if (repos.length === 0) {
    return (
      <VeteranEmptyState
        icon="star"
        title="No starred repositories"
        description="Repositories you star will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-md">
      {repos.map((repo: any) => (
        <div key={repo.id} className="p-4 hover:bg-[var(--surface-2)] transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/${repo.owner?.username || repo.owner?.login || repo.ownerName}/${repo.name}`}
                  className="text-sm font-semibold text-[var(--accent-gold)] hover:underline truncate"
                >
                  {(repo.owner?.username || repo.owner?.login || repo.ownerName)}/{repo.name}
                </Link>
                {(repo.isPrivate || repo.private) && <VeteranBadge variant="default" size="sm">Private</VeteranBadge>}
              </div>
              {repo.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{repo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLangColor(repo.language) }} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks_count ?? repo.forkCount ?? 0}</span>
                <span>Updated {relativeTime(repo.updated_at || repo.pushedAt || repo.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
