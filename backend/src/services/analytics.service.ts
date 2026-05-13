import prisma from "../config/database.js";
import { getRedis } from "../config/redis.js";
import { CACHE_TTL } from "../config/constants.js";

export class AnalyticsService {
  async getContributorStats(repositoryId: string) {
    const stats = await prisma.contributorStat.findMany({
      where: { repositoryId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { commits: "desc" },
    });

    return stats.map(s => ({
      id: s.id,
      user: s.user,
      commits: s.commits,
      additions: s.additions,
      deletions: s.deletions,
      firstCommit: s.firstCommit,
      lastCommit: s.lastCommit,
    }));
  }

  async updateContributorStats(repositoryId: string, userId: string, data: {
    commits?: number;
    additions?: number;
    deletions?: number;
    commitDate?: Date;
  }) {
    const existing = await prisma.contributorStat.findUnique({
      where: { repositoryId_userId: { repositoryId, userId } },
    });

    if (existing) {
      return prisma.contributorStat.update({
        where: { repositoryId_userId: { repositoryId, userId } },
        data: {
          commits: { increment: data.commits || 0 },
          additions: { increment: data.additions || 0 },
          deletions: { increment: data.deletions || 0 },
          lastCommit: data.commitDate || undefined,
        },
      });
    }

    return prisma.contributorStat.create({
      data: {
        repositoryId,
        userId,
        commits: data.commits || 1,
        additions: data.additions || 0,
        deletions: data.deletions || 0,
        firstCommit: data.commitDate,
        lastCommit: data.commitDate,
      },
    });
  }

  async getTrafficStats(repositoryId: string, period: "day" | "week" | "month" = "week") {
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const traffic = await prisma.repoTraffic.findMany({
      where: {
        repositoryId,
        date: { gte: since },
      },
      orderBy: { date: "asc" },
    });

    return {
      period,
      totalViews: traffic.reduce((sum, t) => sum + t.views, 0),
      totalUniqueViews: traffic.reduce((sum, t) => sum + t.uniqueViews, 0),
      totalVisitors: traffic.reduce((sum, t) => sum + t.visitors, 0),
      daily: traffic,
    };
  }

  async recordView(repositoryId: string, userId?: string, ipAddress?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.repoTraffic.findUnique({
      where: { repositoryId_date: { repositoryId, date: today } },
    });

    if (existing) {
      return prisma.repoTraffic.update({
        where: { repositoryId_date: { repositoryId, date: today } },
        data: {
          views: { increment: 1 },
          uniqueViews: { increment: userId ? 1 : 0 },
          visitors: { increment: 1 },
        },
      });
    }

    return prisma.repoTraffic.create({
      data: {
        repositoryId,
        date: today,
        views: 1,
        uniqueViews: userId ? 1 : 0,
        visitors: 1,
      },
    });
  }

  async getCloneStats(repositoryId: string, period: "day" | "week" | "month" = "week") {
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const clones = await prisma.repoClone.findMany({
      where: {
        repositoryId,
        date: { gte: since },
      },
      orderBy: { date: "asc" },
    });

    return {
      period,
      totalClones: clones.reduce((sum, c) => sum + c.clones, 0),
      totalUniqueClones: clones.reduce((sum, c) => sum + c.uniqueClones, 0),
      daily: clones,
    };
  }

  async recordClone(repositoryId: string, unique: boolean = true) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.repoClone.findUnique({
      where: { repositoryId_date: { repositoryId, date: today } },
    });

    if (existing) {
      return prisma.repoClone.update({
        where: { repositoryId_date: { repositoryId, date: today } },
        data: {
          clones: { increment: 1 },
          uniqueClones: { increment: unique ? 1 : 0 },
        },
      });
    }

    return prisma.repoClone.create({
      data: {
        repositoryId,
        date: today,
        clones: 1,
        uniqueClones: unique ? 1 : 0,
      },
    });
  }

  async getRepoActivity(repositoryId: string, days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [commits, issues, prs, releases] = await Promise.all([
      prisma.commit.count({
        where: { repositoryId, committedAt: { gte: since } },
      }),
      prisma.issue.count({
        where: { repositoryId, createdAt: { gte: since } },
      }),
      prisma.pullRequest.count({
        where: { repositoryId, createdAt: { gte: since } },
      }),
      prisma.release.count({
        where: { repositoryId, createdAt: { gte: since }, isDraft: false },
      }),
    ]);

    return { commits, issues, pullRequests: prs, releases, period: `${days}d` };
  }

  async getRepositoryHealth(repositoryId: string) {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        _count: {
          select: {
            issues: { where: { state: "open" } },
            pullRequests: { where: { state: "open", isDraft: false } },
            branches: true,
            tags: true,
          },
        },
      },
    });

    if (!repo) return null;

    const openIssueRatio = repo._count.issues > 0
      ? repo._count.issues / (repo.openIssuesCount + repo._count.issues)
      : 0;

    return {
      hasReadme: true,
      hasLicense: !!repo.license,
      hasContributing: true,
      openIssueRatio,
      openPRCount: repo._count.pullRequests,
      branchCount: repo._count.branches,
      tagCount: repo._count.tags,
      lastPushed: repo.pushedAt,
      score: Math.round((1 - openIssueRatio) * 100),
    };
  }

  async getSiteStats() {
    const cache = getRedis();
    const cached = await cache.get("site:stats");
    if (cached) return JSON.parse(cached);

    const [userCount, repoCount, issueCount, prCount, orgCount] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.repository.count({ where: { isDisabled: false, isPrivate: false } }),
      prisma.issue.count({ where: { state: "open" } }),
      prisma.pullRequest.count({ where: { state: "open" } }),
      prisma.organization.count(),
    ]);

    const stats = { userCount, repoCount, issueCount, prCount, orgCount };
    await cache.setex("site:stats", CACHE_TTL.LONG, JSON.stringify(stats));

    return stats;
  }
}

export const analyticsService = new AnalyticsService();
