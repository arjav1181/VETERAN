export interface ContributorStat {
  id: string;
  repositoryId: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  displayName: string | null;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalPullRequests: number;
  totalIssues: number;
  totalReviews: number;
  firstContributionAt: string;
  lastContributionAt: string;
  weeks: ContributorWeek[];
}

export interface ContributorWeek {
  weekStart: string;
  additions: number;
  deletions: number;
  commits: number;
}

export interface RepoTraffic {
  id: string;
  repositoryId: string;
  date: string;
  views: number;
  uniqueViews: number;
  clones: number;
  uniqueClones: number;
  referrers: Referrer[];
  paths: PathTraffic[];
}

export interface Referrer {
  url: string;
  views: number;
  uniqueViews: number;
}

export interface PathTraffic {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
}

export interface CodeFrequency {
  id: string;
  repositoryId: string;
  weekStart: string;
  additions: number;
  deletions: number;
  commits: number;
}

export interface PunchCardStat {
  id: string;
  repositoryId: string;
  dayOfWeek: number;
  hourOfDay: number;
  commitCount: number;
}

export interface CommitActivity {
  id: string;
  repositoryId: string;
  weekStart: string;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  days: number[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionGraph {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
}
