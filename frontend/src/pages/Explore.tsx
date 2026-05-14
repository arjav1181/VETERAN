import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranAvatar, VeteranAvatarGroup } from '@ui/VeteranAvatar';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { relativeTime } from '@lib/dates';
import { api } from '@lib/api/client';
import { searchApi } from '@lib/api/endpoints/search';
import { useAuthStore } from '@stores/authStore';
import {
  TrendingUp,
  Star,
  GitFork,
  Users,
  Flame,
  Search,
  ArrowUpRight,
  Calendar,
  Hash,
  Globe,
  Sparkles,
  ChevronDown,
  Clock,
  MessageSquare,
  BookOpen,
  List,
  Eye,
  Zap,
} from 'lucide-react';

type Period = 'today' | 'week' | 'month';

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState<Period>('week');
  const [trendingLang, setTrendingLang] = useState('');

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['explore', 'trending', period, trendingLang],
    queryFn: () => api.get<any[]>('/explore/trending', { params: { since: period, language: trendingLang || undefined, per_page: 25 } }),
    staleTime: 120_000,
    retry: 2,
  });
  const trendingRepos = (trendingData ?? []) as any[];

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ['explore', 'topics'],
    queryFn: () => searchApi.topics({ q: 'popular', per_page: 24 }),
    staleTime: 300_000,
    retry: 2,
  });
  const topics = (topicsData?.items ?? []) as any[];

  const { data: devsData, isLoading: devsLoading } = useQuery({
    queryKey: ['explore', 'trending-devs'],
    queryFn: () => api.get<any[]>('/explore/trending-developers', { params: { since: period, per_page: 12 } }),
    staleTime: 120_000,
    retry: 2,
  });
  const trendingDevs = (devsData ?? []) as any[];

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
  ];

  const availableLangs = useMemo(() => {
    const set = new Set<string>();
    trendingRepos.forEach((r: any) => { if (r.language) set.add(r.language); });
    return Array.from(set).sort();
  }, [trendingRepos]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--surface-2)] border border-[var(--border)] p-8 md:p-12">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[var(--accent-gold)] blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--accent-blue)] blur-[150px]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold-muted)] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[var(--accent-gold)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Explore the <span className="text-[var(--accent-gold)]">Veteran</span> universe
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Discover trending repositories, popular topics, and remarkable developers across the Veteran platform.
          </p>
          <div className="mt-6 max-w-xl">
            <VeteranInput
              placeholder="Search repositories, topics, developers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trending repositories</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--surface-2)] rounded-lg p-0.5">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    period === p.id
                      ? 'bg-[var(--surface-3)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {availableLangs.length > 0 && (
              <select
                value={trendingLang}
                onChange={(e) => setTrendingLang(e.target.value)}
                className="bg-[var(--surface-2)] text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              >
                <option value="">All languages</option>
                {availableLangs.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            )}
          </div>
        </div>

        {trendingLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="h-5 skeleton w-64" />
                <div className="h-4 skeleton w-full" />
                <div className="flex gap-4"><div className="h-3 skeleton w-20" /><div className="h-3 skeleton w-16" /><div className="h-3 skeleton w-32" /></div>
              </div>
            ))}
          </div>
        ) : trendingRepos.length === 0 ? (
          <VeteranEmptyState icon="flame" title="No trending repos" description="Nothing trending right now. Check back later." />
        ) : (
          <div className="space-y-2">
            {trendingRepos.map((repo: any, i: number) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="card p-4 hover:border-[var(--text-disabled)] transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <span className="text-sm font-bold text-[var(--text-disabled)] w-5 shrink-0 mt-0.5">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/${repo.owner?.username || repo.owner?.login || repo.ownerName}/${repo.name}`}
                          className="text-base font-semibold text-[var(--accent-gold)] hover:underline truncate"
                        >
                          {repo.owner?.username || repo.owner?.login || repo.ownerName}/{repo.name}
                        </Link>
                        {repo.builtBy && Array.isArray(repo.builtBy) && repo.builtBy.length > 0 && (
                          <span className="text-xs text-[var(--text-secondary)] hidden sm:inline-flex items-center gap-1">
                            Built by
                            <div className="flex -space-x-1.5">
                              {repo.builtBy.slice(0, 3).map((b: any) => (
                                <VeteranAvatar key={b.username || b.login} src={b.avatarUrl || b.avatar_url} name={b.username || b.login || '?'} size="xs" className="ring-1 ring-[var(--surface-1)]" />
                              ))}
                            </div>
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: languageColors[repo.language] || '#8D96A0' }} />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" />{formatCount(repo.stars_count ?? repo.starCount ?? repo.stargazers_count ?? 0)}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{formatCount(repo.forks_count ?? repo.forkCount ?? 0)}</span>
                        {repo.stars_today !== undefined && repo.stars_today > 0 && (
                          <span className="flex items-center gap-1 text-[var(--accent-gold)]">
                            <Star className="w-3 h-3 fill-[var(--accent-gold)]" />
                            {repo.stars_today} today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <VeteranButton variant="ghost" size="sm" icon={<Star className="w-4 h-4" />} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-5 h-5 text-[var(--accent-blue)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Popular topics</h2>
        </div>

        {topicsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-2"><div className="h-5 skeleton w-24" /><div className="h-3 skeleton w-16" /></div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <VeteranEmptyState icon="search" title="No topics found" description="Popular topics will appear here." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {topics.map((topic: any, i: number) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
              >
                <Link
                  to={`/topics/${topic.name}`}
                  className="card p-4 block hover:border-[var(--accent-gold)] hover:shadow-[var(--shadow-gold)] transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-[var(--surface-3)] flex items-center justify-center group-hover:bg-[var(--accent-gold-muted)] transition-colors">
                      <Hash className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                      {topic.display_name || topic.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {(topic.count ?? 0).toLocaleString()} repositories
                  </p>
                  {topic.description && (
                    <p className="text-xs text-[var(--text-disabled)] mt-1 line-clamp-2">{topic.description}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-[var(--accent-blue)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trending developers</h2>
        </div>

        {devsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full skeleton" /><div className="space-y-1.5 flex-1"><div className="h-4 skeleton w-24" /><div className="h-3 skeleton w-16" /></div></div>
                <div className="h-3 skeleton w-32" />
              </div>
            ))}
          </div>
        ) : trendingDevs.length === 0 ? (
          <VeteranEmptyState icon="users" title="No trending developers" description="Developer rankings will appear here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingDevs.map((dev: any, i: number) => (
              <motion.div
                key={dev.id || dev.username}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="card p-4 hover:border-[var(--text-disabled)] transition-all"
              >
                <div className="flex items-start gap-3">
                  <Link to={`/${dev.username}`}>
                    <VeteranAvatar src={dev.avatarUrl || dev.avatar_url} name={dev.name || dev.username} size="lg" className="ring-2 ring-[var(--border)] hover:ring-[var(--accent-gold)] transition-all" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/${dev.username}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors truncate block">
                      {dev.name || dev.username}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">@{dev.username}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--text-secondary)]">
                      <Users className="w-3 h-3" />
                      <span>{(dev.followers ?? dev.followers_count ?? 0).toLocaleString()} followers</span>
                    </div>
                  </div>
                </div>
                {dev.popularRepo && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <p className="text-2xs text-[var(--text-disabled)] mb-1">Popular repo</p>
                    <Link
                      to={`/${dev.username}/${dev.popularRepo.name}`}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors truncate"
                    >
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">{dev.popularRepo.name}</span>
                      <span className="flex items-center gap-0.5 text-[var(--text-disabled)] shrink-0">
                        <Star className="w-2.5 h-2.5" />{dev.popularRepo.stars ?? 0}
                      </span>
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', Ruby: '#DA3832',
  C: '#555555', 'C++': '#F34B7D', 'C#': '#178600', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89E051', HTML: '#E34F26',
  CSS: '#563D7C', Scala: '#C22D40', Dart: '#00B4AB', Lua: '#000080',
  Dockerfile: '#384D54', Elixir: '#6E4A7E',
};
