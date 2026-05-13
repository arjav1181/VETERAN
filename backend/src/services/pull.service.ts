import { execSync } from "node:child_process";
import prisma from "../config/database.js";
import { gitService } from "./git/git.service.js";
import { diffService } from "./git/diff.service.js";
import { AppError, NotFoundError, ConflictError } from "../middleware/errorHandler.js";
import { MERGE_METHODS } from "../config/constants.js";

export class PullService {
  async create(data: {
    repositoryId: string;
    title: string;
    body?: string;
    authorId: string;
    headBranch: string;
    baseBranch: string;
    headRepoId?: string;
    isDraft?: boolean;
  }) {
    const repo = await prisma.repository.findUnique({ where: { id: data.repositoryId } });
    if (!repo) throw new NotFoundError("Repository");

    const lastPr = await prisma.pullRequest.findFirst({
      where: { repositoryId: data.repositoryId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const prNumber = (lastPr?.number || 0) + 1;

    const fullName = repo.fullName;
    const headSha = execSync(`git rev-parse "${data.headBranch}"`, {
      cwd: gitService.getRepoPath(fullName),
      encoding: "utf-8",
    }).trim();

    const baseSha = execSync(`git rev-parse "${data.baseBranch}"`, {
      cwd: gitService.getRepoPath(fullName),
      encoding: "utf-8",
    }).trim();

    const diffStats = diffService.getBranchCompare(fullName, data.baseBranch, data.headBranch);

    const pr = await prisma.pullRequest.create({
      data: {
        repositoryId: data.repositoryId,
        number: prNumber,
        title: data.title,
        body: data.body,
        authorId: data.authorId,
        headBranch: data.headBranch,
        headSha,
        headRepoId: data.headRepoId || data.repositoryId,
        baseBranch: data.baseBranch,
        baseRepoId: data.repositoryId,
        baseSha,
        additions: diffStats.totalAdditions,
        deletions: diffStats.totalDeletions,
        fileCount: diffStats.totalFiles,
        isDraft: data.isDraft || false,
        draftAt: data.isDraft ? new Date() : null,
      },
    });

    if (!data.isDraft) {
      await this.createPrEvent(pr.id, data.authorId, "opened");
    }

    await prisma.repository.update({
      where: { id: data.repositoryId },
      data: { openPrCount: { increment: 1 } },
    });

    return this.getById(pr.id);
  }

  async getById(prId: string) {
    return prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        mergedBy: { select: { id: true, username: true, avatarUrl: true } },
        closedBy: { select: { id: true, username: true, avatarUrl: true } },
        milestone: { select: { id: true, title: true, number: true } },
        reviews: {
          include: { reviewer: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { submittedAt: "desc" },
        },
        commits: {
          include: { commit: true },
          orderBy: { commit: { committedAt: "desc" } },
        },
        _count: { select: { reviewComments: true } },
      },
    });
  }

  async list(repositoryId: string, filters: {
    state?: string;
    head?: string;
    base?: string;
    sort?: string;
    direction?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }) {
    const where: Record<string, unknown> = { repositoryId };

    if (filters.state) {
      if (filters.state === "open") where.state = "open";
      else if (filters.state === "closed") where.state = "closed";
      else if (filters.state === "merged") where.isMerged = true;
    }
    if (filters.head) where.headBranch = filters.head;
    if (filters.base) where.baseBranch = filters.base;

    const orderBy: Record<string, string> = {};
    orderBy[filters.sort || "createdAt"] = filters.direction || "desc";

    const page = filters.page || 1;
    const perPage = filters.perPage || 30;

    const [prs, total] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          milestone: { select: { id: true, title: true } },
          _count: { select: { reviews: true, reviewComments: true, commits: true } },
        },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.pullRequest.count({ where }),
    ]);

    return { pullRequests: prs, total, page, perPage };
  }

  async update(prId: string, data: {
    title?: string;
    body?: string;
    state?: string;
    baseBranch?: string;
    milestoneId?: string | null;
    labels?: string[];
    isDraft?: boolean;
  }, actorId: string) {
    const pr = await prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundError("Pull request");

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.baseBranch !== undefined) updateData.baseBranch = data.baseBranch;
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId;
    if (data.labels !== undefined) updateData.labelsList = data.labels;
    if (data.isDraft !== undefined) {
      updateData.isDraft = data.isDraft;
      if (!data.isDraft) {
        updateData.draftAt = null;
      }
    }

    if (data.state) {
      if (data.state === "closed" && pr.state === "open") {
        updateData.state = "closed";
        updateData.closedAt = new Date();
        updateData.closedById = actorId;
        await prisma.repository.update({
          where: { id: pr.repositoryId },
          data: { openPrCount: { decrement: 1 } },
        });
        await this.createPrEvent(prId, actorId, "closed");
      }
    }

    return prisma.pullRequest.update({
      where: { id: prId },
      data: updateData,
    });
  }

  async merge(prId: string, userId: string, method: "merge" | "squash" | "rebase" = "merge") {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { repository: true },
    });

    if (!pr) throw new NotFoundError("Pull request");
    if (pr.isMerged) throw new AppError("Already merged", 409, "ALREADY_MERGED");
    if (pr.state !== "open") throw new AppError("Pull request is not open", 400, "NOT_OPEN");
    if (!MERGE_METHODS.includes(method)) {
      throw new AppError(`Invalid merge method: ${method}`, 400, "INVALID_METHOD");
    }

    const repo = pr.repository;
    const repoPath = gitService.getRepoPath(repo.fullName);

    const repoAllowField = `allow${method.charAt(0).toUpperCase() + method.slice(1)}` as keyof typeof repo;
    if (method !== "merge" && !repo[repoAllowField]) {
      throw new AppError(`${method} merge is disabled`, 403, "MERGE_DISABLED");
    }

    let mergeCommitSha: string;

    try {
      execSync(`git fetch origin ${pr.headBranch}`, { cwd: repoPath, stdio: "pipe" });
      execSync(`git checkout ${pr.baseBranch}`, { cwd: repoPath, stdio: "pipe" });
      execSync(`git pull origin ${pr.baseBranch}`, { cwd: repoPath, stdio: "pipe" });

      const userName = execSync(`git config user.name`, { cwd: repoPath, encoding: "utf-8" }).trim() || "VETERAN";
      const userEmail = execSync(`git config user.email`, { cwd: repoPath, encoding: "utf-8" }).trim() || "noreply@veteran.dev";

      switch (method) {
        case "merge":
          execSync(
            `git -c user.name="${userName}" -c user.email="${userEmail}" merge --no-ff "${pr.headBranch}" -m "Merge pull request #${pr.number} from ${pr.headBranch}"`,
            { cwd: repoPath, stdio: "pipe" }
          );
          break;
        case "squash":
          execSync(
            `git -c user.name="${userName}" -c user.email="${userEmail}" merge --squash "${pr.headBranch}"`,
            { cwd: repoPath, stdio: "pipe" }
          );
          execSync(
            `git -c user.name="${userName}" -c user.email="${userEmail}" commit -m "Squash merge pull request #${pr.number} from ${pr.headBranch}"`,
            { cwd: repoPath, stdio: "pipe" }
          );
          break;
        case "rebase":
          execSync(
            `git -c user.name="${userName}" -c user.email="${userEmail}" rebase "${pr.headBranch}"`,
            { cwd: repoPath, stdio: "pipe" }
          );
          break;
      }

      mergeCommitSha = execSync(`git rev-parse HEAD`, { cwd: repoPath, encoding: "utf-8" }).trim();
      execSync(`git push origin ${pr.baseBranch}`, { cwd: repoPath, stdio: "pipe" });

      if (repo.deleteBranchOnMerge) {
        execSync(`git branch -D "${pr.headBranch}"`, { cwd: repoPath, stdio: "pipe" }).catch(() => {});
        execSync(`git push origin --delete "${pr.headBranch}"`, { cwd: repoPath, stdio: "pipe" }).catch(() => {});
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Merge failed";
      throw new AppError(`Merge failed: ${msg}`, 409, "MERGE_FAILED");
    }

    const updatedPr = await prisma.pullRequest.update({
      where: { id: prId },
      data: {
        state: "closed",
        isMerged: true,
        mergeCommitSha,
        mergeMethod: method,
        mergedById: userId,
        mergedAt: new Date(),
        closedAt: new Date(),
        closedById: userId,
      },
    });

    await prisma.repository.update({
      where: { id: repo.id },
      data: { openPrCount: { decrement: 1 } },
    });

    await this.createPrEvent(prId, userId, "merged", { mergeCommitSha, method });

    return updatedPr;
  }

  async close(prId: string, userId: string) {
    return this.update(prId, { state: "closed" }, userId);
  }

  async reopen(prId: string, userId: string) {
    const pr = await prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundError("Pull request");

    await prisma.pullRequest.update({
      where: { id: prId },
      data: {
        state: "open",
        closedAt: null,
        closedById: null,
        isMerged: false,
        mergedAt: null,
        mergedById: null,
        mergeCommitSha: null,
      },
    });

    await prisma.repository.update({
      where: { id: pr.repositoryId },
      data: { openPrCount: { increment: 1 } },
    });

    await this.createPrEvent(prId, userId, "reopened");
    return this.getById(prId);
  }

  async addReview(prId: string, reviewerId: string, body: string | undefined, state: string, commitSha?: string) {
    const pr = await prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundError("Pull request");

    const review = await prisma.prReview.create({
      data: { pullRequestId: prId, reviewerId, body, state, commitSha },
      include: { reviewer: { select: { id: true, username: true, avatarUrl: true } } },
    });

    await this.createPrEvent(prId, reviewerId, state === "approved" ? "approved" : state === "changes_requested" ? "changes_requested" : "commented");

    return review;
  }

  async dismissReview(reviewId: string, userId: string, message?: string) {
    const review = await prisma.prReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundError("Review");

    await prisma.prReview.update({
      where: { id: reviewId },
      data: { state: "dismissed" },
    });

    await this.createPrEvent(review.pullRequestId, userId, "dismissed_review", { reviewId, message });
  }

  async addReviewComment(prId: string, reviewId: string | undefined, authorId: string, body: string, path: string, position: number | undefined, commitSha: string, inReplyToId?: string) {
    return prisma.prReviewComment.create({
      data: {
        pullRequestId: prId,
        reviewId,
        authorId,
        body,
        path,
        position,
        commitSha,
        inReplyToId,
      },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });
  }

  async updateReviewComment(commentId: string, authorId: string, body: string) {
    const comment = await prisma.prReviewComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== authorId) throw new AppError("Not authorized", 403, "FORBIDDEN");

    return prisma.prReviewComment.update({
      where: { id: commentId },
      data: { body },
    });
  }

  async deleteReviewComment(commentId: string, authorId: string) {
    const comment = await prisma.prReviewComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== authorId) throw new AppError("Not authorized", 403, "FORBIDDEN");

    await prisma.prReviewComment.delete({ where: { id: commentId } });
  }

  async getCommits(prId: string) {
    return prisma.prCommit.findMany({
      where: { pullRequestId: prId },
      include: { commit: true },
      orderBy: { commit: { committedAt: "asc" } },
    });
  }

  async getFiles(prId: string) {
    const pr = await prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr || !pr.repository) throw new NotFoundError("Pull request");

    const repo = await prisma.repository.findUnique({ where: { id: pr.repositoryId } });
    if (!repo) throw new NotFoundError("Repository");

    return diffService.getBranchCompare(repo.fullName, pr.baseBranch, pr.headBranch);
  }

  async checkMergeability(prId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { repository: true },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const mergeable = diffService.isMergeable(pr.repository.fullName, pr.baseBranch, pr.headBranch);

    await prisma.pullRequest.update({
      where: { id: prId },
      data: { mergeable },
    });

    return mergeable;
  }

  async enableAutoMerge(prId: string, method: string) {
    return prisma.pullRequest.update({
      where: { id: prId },
      data: {
        autoMergeEnabled: true,
        autoMergeMethod: method,
      },
    });
  }

  async disableAutoMerge(prId: string) {
    return prisma.pullRequest.update({
      where: { id: prId },
      data: {
        autoMergeEnabled: false,
        autoMergeMethod: null,
      },
    });
  }

  private async createPrEvent(pullRequestId: string, actorId: string, event: string, data?: Record<string, unknown>) {
    return prisma.prReviewEvent.create({
      data: { pullRequestId, actorId, event, data: data || {} },
    });
  }
}

export const pullService = new PullService();
