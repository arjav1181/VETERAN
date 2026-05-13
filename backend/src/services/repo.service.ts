import prisma from "../config/database.js";
import { gitService } from "./git/git.service.js";
import { AppError, NotFoundError, ConflictError } from "../middleware/errorHandler.js";
import { getRedis } from "../config/redis.js";
import { CACHE_TTL } from "../config/constants.js";

export class RepoService {
  async create(data: {
    ownerId: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
    autoInit?: boolean;
    license?: string;
    gitignore?: string;
    organizationId?: string;
  }) {
    const owner = await prisma.user.findUnique({ where: { id: data.ownerId } });
    if (!owner) throw new NotFoundError("User");

    const fullName = data.organizationId
      ? `${data.organizationId}/${data.name}`
      : `${owner.username}/${data.name}`;

    const existing = await prisma.repository.findUnique({ where: { fullName } });
    if (existing) throw new ConflictError("Repository already exists");

    const repo = await prisma.repository.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        fullName,
        description: data.description,
        isPrivate: data.isPrivate ?? false,
        defaultBranch: data.defaultBranch || "main",
        organizationId: data.organizationId,
      },
    });

    await gitService.initRepository(fullName);

    if (data.autoInit) {
      await this.initializeRepo(fullName, data.defaultBranch || "main");
    }

    return repo;
  }

  async getById(repoId: string) {
    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        organization: { select: { id: true, name: true, slug: true, avatarUrl: true } },
        _count: {
          select: {
            stars: true,
            forks: true,
            watches: true,
            issues: { where: { state: "open" } },
            pullRequests: { where: { state: "open" } },
            branches: true,
            tags: true,
            releases: true,
          },
        },
      },
    });

    if (!repo) throw new NotFoundError("Repository");
    return repo;
  }

  async getByFullName(fullName: string) {
    const repo = await prisma.repository.findUnique({
      where: { fullName },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        organization: { select: { id: true, name: true, slug: true, avatarUrl: true } },
        _count: {
          select: {
            stars: true,
            forks: true,
            watches: true,
            issues: { where: { state: "open" } },
            pullRequests: { where: { state: "open" } },
          },
        },
      },
    });

    if (!repo) throw new NotFoundError("Repository");
    return repo;
  }

  async update(repoId: string, data: {
    name?: string;
    description?: string;
    homepageUrl?: string;
    isPrivate?: boolean;
    isArchived?: boolean;
    defaultBranch?: string;
    allowForking?: boolean;
    allowIssues?: boolean;
    allowProjects?: boolean;
    allowWiki?: boolean;
    allowMerge?: boolean;
    allowRebase?: boolean;
    allowSquash?: boolean;
    deleteBranchOnMerge?: boolean;
    topics?: string[];
  }) {
    const repo = await prisma.repository.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundError("Repository");

    if (data.name && data.name !== repo.name) {
      const newFullName = repo.fullName.replace(repo.name, data.name);
      const existing = await prisma.repository.findUnique({ where: { fullName: newFullName } });
      if (existing) throw new ConflictError("Repository name already exists");

      await gitService.deleteRepository(repo.fullName);
      await gitService.initRepository(newFullName);
      data.name = data.name;
    }

    return prisma.repository.update({
      where: { id: repoId },
      data,
    });
  }

  async delete(repoId: string) {
    const repo = await prisma.repository.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundError("Repository");

    await gitService.deleteRepository(repo.fullName);
    await prisma.repository.delete({ where: { id: repoId } });
  }

  async fork(repoId: string, userId: string) {
    const source = await prisma.repository.findUnique({ where: { id: repoId } });
    if (!source) throw new NotFoundError("Repository");
    if (!source.allowForking) throw new AppError("Forking is disabled", 403, "FORKING_DISABLED");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    const forkFullName = `${user.username}/${source.name}`;
    const existing = await prisma.repository.findUnique({ where: { fullName: forkFullName } });
    if (existing) throw new ConflictError("You already have a fork of this repository");

    const fork = await prisma.repository.create({
      data: {
        ownerId: userId,
        name: source.name,
        fullName: forkFullName,
        description: source.description,
        isPrivate: source.isPrivate,
        defaultBranch: source.defaultBranch,
        isFork: true,
        isEmpty: source.isEmpty,
        allowForking: source.allowForking,
        allowIssues: source.allowIssues,
        allowProjects: source.allowProjects,
        allowWiki: source.allowWiki,
      },
    });

    const sourcePath = gitService.getRepoPath(source.fullName);
    const forkPath = gitService.getRepoPath(fork.fullName);
    await gitService.cloneRepository(sourcePath, fork.fullName);

    await prisma.fork.create({
      data: {
        repositoryId: source.id,
        forkId: fork.id,
        userId,
      },
    });

    return fork;
  }

  async listForks(repoId: string, page: number = 1, perPage: number = 30) {
    const forks = await prisma.fork.findMany({
      where: { repositoryId: repoId },
      include: {
        fork: {
          select: { id: true, fullName: true, description: true, starsCount: true, forksCount: true },
        },
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    });

    return forks.map(f => ({
      id: f.fork.id,
      fullName: f.fork.fullName,
      description: f.fork.description,
      starsCount: f.fork.starsCount,
      forksCount: f.fork.forksCount,
      owner: f.user,
      createdAt: f.createdAt,
    }));
  }

  async toggleStar(repoId: string, userId: string): Promise<boolean> {
    const existing = await prisma.star.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });

    if (existing) {
      await prisma.star.delete({ where: { id: existing.id } });
      await prisma.repository.update({
        where: { id: repoId },
        data: { starsCount: { decrement: 1 } },
      });
      return false;
    }

    await prisma.star.create({ data: { repositoryId: repoId, userId } });
    await prisma.repository.update({
      where: { id: repoId },
      data: { starsCount: { increment: 1 } },
    });
    return true;
  }

  async isStarred(repoId: string, userId: string): Promise<boolean> {
    const star = await prisma.star.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
    return !!star;
  }

  async toggleWatch(repoId: string, userId: string): Promise<boolean> {
    const existing = await prisma.watch.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });

    if (existing) {
      await prisma.watch.delete({ where: { id: existing.id } });
      await prisma.repository.update({
        where: { id: repoId },
        data: { watchersCount: { decrement: 1 } },
      });
      return false;
    }

    await prisma.watch.create({ data: { repositoryId: repoId, userId } });
    await prisma.repository.update({
      where: { id: repoId },
      data: { watchersCount: { increment: 1 } },
    });
    return true;
  }

  async listForUser(userId: string, page: number = 1, perPage: number = 30, type: "owner" | "member" | "all" = "owner") {
    const where: Record<string, unknown> = {};
    if (type === "owner") {
      where.ownerId = userId;
    } else if (type === "member") {
      where.collaborators = { some: { userId } };
    } else {
      where.OR = [
        { ownerId: userId },
        { collaborators: { some: { userId } } },
      ];
    }

    return prisma.repository.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { stars: true, forks: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { updatedAt: "desc" },
    });
  }

  async listByOrg(orgId: string, page: number = 1, perPage: number = 30) {
    return prisma.repository.findMany({
      where: { organizationId: orgId },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { stars: true, forks: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { updatedAt: "desc" },
    });
  }

  async addCollaborator(repoId: string, userId: string, permission: string = "pull") {
    const existing = await prisma.repoCollaborator.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
    if (existing) throw new ConflictError("User is already a collaborator");

    return prisma.repoCollaborator.create({
      data: { repositoryId: repoId, userId, permission },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
  }

  async removeCollaborator(repoId: string, userId: string) {
    const existing = await prisma.repoCollaborator.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
    if (!existing) throw new NotFoundError("Collaborator");

    await prisma.repoCollaborator.delete({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
  }

  async updateCollaboratorPermission(repoId: string, userId: string, permission: string) {
    const existing = await prisma.repoCollaborator.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
    if (!existing) throw new NotFoundError("Collaborator");

    return prisma.repoCollaborator.update({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
      data: { permission },
    });
  }

  async listCollaborators(repoId: string) {
    return prisma.repoCollaborator.findMany({
      where: { repositoryId: repoId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async getCollaboratorPermission(repoId: string, userId: string): Promise<string | null> {
    const collab = await prisma.repoCollaborator.findUnique({
      where: { repositoryId_userId: { repositoryId: repoId, userId } },
    });
    if (collab) return collab.permission;

    const repo = await prisma.repository.findUnique({ where: { id: repoId } });
    if (repo?.ownerId === userId) return "admin";

    return null;
  }

  async addTopic(repoId: string, topic: string, addedById?: string) {
    const existing = await prisma.repoTopic.findUnique({
      where: { repositoryId_topic: { repositoryId: repoId, topic } },
    });
    if (existing) return existing;

    return prisma.repoTopic.create({
      data: { repositoryId: repoId, topic, addedById },
    });
  }

  async removeTopic(repoId: string, topic: string) {
    const existing = await prisma.repoTopic.findUnique({
      where: { repositoryId_topic: { repositoryId: repoId, topic } },
    });
    if (!existing) throw new NotFoundError("Topic");

    await prisma.repoTopic.delete({
      where: { repositoryId_topic: { repositoryId: repoId, topic } },
    });
  }

  async listTopics(repoId: string) {
    const topics = await prisma.repoTopic.findMany({
      where: { repositoryId: repoId },
      orderBy: { topic: "asc" },
    });
    return topics.map(t => t.topic);
  }

  private async initializeRepo(fullName: string, defaultBranch: string): Promise<void> {
    const repoPath = gitService.getRepoPath(fullName);
    const fs = await import("node:fs");
    const path = await import("node:path");

    const tempDir = path.join(repoPath, "..", `_init_${fullName.replace("/", "_")}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const { execSync } = await import("node:child_process");
      execSync(`git init`, { cwd: tempDir, stdio: "pipe" });
      execSync(`git checkout -b ${defaultBranch}`, { cwd: tempDir, stdio: "pipe" });

      const readmePath = path.join(tempDir, "README.md");
      fs.writeFileSync(readmePath, `# ${fullName.split("/")[1]}\n\nInitialized by VETERAN\n`);

      execSync(`git add -A`, { cwd: tempDir, stdio: "pipe" });
      execSync(
        `git -c user.name="VETERAN" -c user.email="noreply@veteran.dev" commit -m "Initial commit"`,
        { cwd: tempDir, stdio: "pipe" }
      );
      execSync(`git remote add origin "${repoPath}"`, { cwd: tempDir, stdio: "pipe" });
      execSync(`git push origin ${defaultBranch}`, { cwd: tempDir, stdio: "pipe" });

      await prisma.repository.update({ where: { fullName }, data: { isEmpty: false } });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  async search(query: string, page: number = 1, perPage: number = 30) {
    return prisma.repository.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { fullName: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { stars: true, forks: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
    });
  }
}

export const repoService = new RepoService();
