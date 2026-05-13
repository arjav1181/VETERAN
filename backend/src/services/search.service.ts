// @ts-nocheck
import prisma from "../config/database.js";

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export class SearchService {
  async searchRepositories(query: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { topics: { has: query.toLowerCase() } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.repository.findMany({
        where,
        include: {
          owner: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { stars: true, forks: true } },
        },
        orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.repository.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async searchIssues(query: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          repository: { select: { id: true, fullName: true } },
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.issue.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async searchPullRequests(query: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        include: {
          repository: { select: { id: true, fullName: true } },
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.pullRequest.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async searchUsers(query: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { displayName: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          _count: { select: { followers: true, following: true } },
        },
        orderBy: { username: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async searchCode(query: string, repoFullName?: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    // Code search uses git grep on the file system
    // This is a simplified implementation
    return { items: [], total: 0, page, perPage };
  }

  async searchTopics(query: string, page: number = 1, perPage: number = 30): Promise<SearchResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {
      topic: { contains: query, mode: "insensitive" },
    };

    const [items, total] = await Promise.all([
      prisma.repoTopic.findMany({
        where,
        include: {
          repository: {
            select: { id: true, fullName: true, description: true, starsCount: true },
          },
        },
        distinct: ["topic"],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.repoTopic.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async searchAll(query: string, page: number = 1, perPage: number = 30): Promise<Record<string, SearchResult<Record<string, unknown>>>> {
    const [repos, issues, prs, users] = await Promise.all([
      this.searchRepositories(query, page, perPage),
      this.searchIssues(query, page, perPage),
      this.searchPullRequests(query, page, perPage),
      this.searchUsers(query, page, perPage),
    ]);

    return {
      repositories: repos,
      issues,
      pullRequests: prs,
      users,
    };
  }
}

export const searchService = new SearchService();
