import prisma from "../config/database.js";
import { AppError, NotFoundError, ConflictError } from "../middleware/errorHandler.js";
import { DEFAULT_LABELS } from "../config/constants.js";

export class IssueService {
  async create(data: {
    repositoryId: string;
    title: string;
    body?: string;
    authorId: string;
    milestoneId?: string;
    labels?: string[];
    assignees?: string[];
  }) {
    const repo = await prisma.repository.findUnique({ where: { id: data.repositoryId } });
    if (!repo) throw new NotFoundError("Repository");
    if (!repo.allowIssues) throw new AppError("Issues are disabled", 403, "ISSUES_DISABLED");

    const lastIssue = await prisma.issue.findFirst({
      where: { repositoryId: data.repositoryId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const issueNumber = (lastIssue?.number || 0) + 1;

    const issue = await prisma.issue.create({
      data: {
        repositoryId: data.repositoryId,
        number: issueNumber,
        title: data.title,
        body: data.body,
        authorId: data.authorId,
        milestoneId: data.milestoneId,
        labelsList: data.labels || [],
      },
    });

    if (data.assignees && data.assignees.length > 0) {
      for (const userId of data.assignees) {
        await prisma.issueAssignee.create({
          data: { issueId: issue.id, userId },
        });
      }
    }

    if (data.labels && data.labels.length > 0) {
      await this.createIssueEvent(issue.id, data.authorId, "labeled", { labels: data.labels });
    }

    await prisma.repository.update({
      where: { id: data.repositoryId },
      data: { openIssuesCount: { increment: 1 } },
    });

    return this.getById(issue.id);
  }

  async getById(issueId: string) {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        assignees: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
        milestone: true,
        comments: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            reactions: { include: { user: { select: { id: true, username: true } } } },
          },
          orderBy: { createdAt: "asc" },
        },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    if (!issue) throw new NotFoundError("Issue");
    return issue;
  }

  async list(repositoryId: string, filters: {
    state?: string;
    labels?: string[];
    milestoneId?: string;
    assigneeId?: string;
    authorId?: string;
    sort?: string;
    direction?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }) {
    const where: Record<string, unknown> = { repositoryId };

    if (filters.state) where.state = filters.state;
    if (filters.milestoneId) where.milestoneId = filters.milestoneId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.assigneeId) {
      where.assignees = { some: { userId: filters.assigneeId } };
    }
    if (filters.labels && filters.labels.length > 0) {
      where.labelsList = { hasSome: filters.labels };
    }

    const orderBy: Record<string, string> = {};
    const sortField = filters.sort || "createdAt";
    orderBy[sortField] = filters.direction || "desc";

    const page = filters.page || 1;
    const perPage = filters.perPage || 30;

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          assignees: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
          milestone: { select: { id: true, title: true, number: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.issue.count({ where }),
    ]);

    return { issues, total, page, perPage };
  }

  async update(issueId: string, data: {
    title?: string;
    body?: string;
    state?: string;
    milestoneId?: string | null;
    labels?: string[];
    isLocked?: boolean;
    stateReason?: string;
  }, actorId: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundError("Issue");

    if (data.state && data.state !== issue.state) {
      await this.createIssueEvent(issueId, actorId, data.state === "closed" ? "closed" : "reopened", {
        state: data.state,
        stateReason: data.stateReason,
      });

      if (data.state === "closed") {
        data.stateReason = data.stateReason || "completed";
        await prisma.repository.update({
          where: { id: issue.repositoryId },
          data: { openIssuesCount: { decrement: 1 } },
        });
      } else {
        await prisma.repository.update({
          where: { id: issue.repositoryId },
          data: { openIssuesCount: { increment: 1 } },
        });
      }
    }

    if (data.labels) {
      await this.createIssueEvent(issueId, actorId, "labeled", { labels: data.labels });
    }

    return prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.state !== undefined && { state: data.state, closedAt: data.state === "closed" ? new Date() : null, stateReason: data.stateReason }),
        ...(data.milestoneId !== undefined && { milestoneId: data.milestoneId }),
        ...(data.labels !== undefined && { labelsList: data.labels }),
        ...(data.isLocked !== undefined && { isLocked: data.isLocked }),
      },
    });
  }

  async addComment(issueId: string, authorId: string, body: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundError("Issue");

    return prisma.issueComment.create({
      data: { issueId, authorId, body },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
  }

  async updateComment(commentId: string, authorId: string, body: string) {
    const comment = await prisma.issueComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== authorId) throw new AppError("Not authorized", 403, "FORBIDDEN");

    return prisma.issueComment.update({
      where: { id: commentId },
      data: { body },
    });
  }

  async deleteComment(commentId: string, authorId: string) {
    const comment = await prisma.issueComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== authorId) throw new AppError("Not authorized", 403, "FORBIDDEN");

    await prisma.issueComment.delete({ where: { id: commentId } });
  }

  async addReaction(target: { issueId?: string; commentId?: string }, userId: string, reaction: string) {
    const validReactions = ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"];
    if (!validReactions.includes(reaction)) {
      throw new AppError("Invalid reaction", 400, "INVALID_REACTION");
    }

    const existing = await prisma.issueReaction.findFirst({
      where: { userId, issueId: target.issueId, commentId: target.commentId, reaction },
    });
    if (existing) return existing;

    return prisma.issueReaction.create({
      data: {
        issueId: target.issueId,
        commentId: target.commentId,
        userId,
        reaction,
      },
    });
  }

  async removeReaction(reactionId: string, userId: string) {
    const reaction = await prisma.issueReaction.findUnique({ where: { id: reactionId } });
    if (!reaction) throw new NotFoundError("Reaction");
    if (reaction.userId !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

    await prisma.issueReaction.delete({ where: { id: reactionId } });
  }

  async addAssignee(issueId: string, userId: string) {
    const existing = await prisma.issueAssignee.findUnique({
      where: { issueId_userId: { issueId, userId } },
    });
    if (existing) return;

    await prisma.issueAssignee.create({ data: { issueId, userId } });
    await this.createIssueEvent(issueId, userId, "assigned", { assignee: { id: userId } });
  }

  async removeAssignee(issueId: string, userId: string) {
    await prisma.issueAssignee.delete({
      where: { issueId_userId: { issueId, userId } },
    }).catch(() => {});
  }

  async createLabel(repositoryId: string, data: { name: string; color: string; description?: string }) {
    const existing = await prisma.issueLabel.findUnique({
      where: { repositoryId_name: { repositoryId, name: data.name } },
    });
    if (existing) throw new ConflictError("Label already exists");

    return prisma.issueLabel.create({
      data: { repositoryId, ...data },
    });
  }

  async updateLabel(labelId: string, data: { name?: string; color?: string; description?: string }) {
    return prisma.issueLabel.update({
      where: { id: labelId },
      data,
    });
  }

  async deleteLabel(labelId: string) {
    await prisma.issueLabel.delete({ where: { id: labelId } });
  }

  async listLabels(repositoryId: string) {
    return prisma.issueLabel.findMany({
      where: { repositoryId },
      orderBy: { name: "asc" },
    });
  }

  async createMilestone(repositoryId: string, data: { title: string; description?: string; dueOn?: string }) {
    const lastMilestone = await prisma.issueMilestone.findFirst({
      where: { repositoryId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    return prisma.issueMilestone.create({
      data: {
        repositoryId,
        number: (lastMilestone?.number || 0) + 1,
        title: data.title,
        description: data.description,
        dueOn: data.dueOn ? new Date(data.dueOn) : undefined,
      },
    });
  }

  async updateMilestone(milestoneId: string, data: {
    title?: string;
    description?: string;
    dueOn?: string;
    state?: string;
  }) {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueOn !== undefined) updateData.dueOn = new Date(data.dueOn);
    if (data.state !== undefined) {
      updateData.state = data.state;
      if (data.state === "closed") {
        updateData.closedAt = new Date();
      } else {
        updateData.closedAt = null;
      }
    }

    return prisma.issueMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });
  }

  async deleteMilestone(milestoneId: string) {
    await prisma.issueMilestone.delete({ where: { id: milestoneId } });
  }

  async listMilestones(repositoryId: string, state?: string) {
    const where: Record<string, unknown> = { repositoryId };
    if (state) where.state = state;

    return prisma.issueMilestone.findMany({
      where,
      orderBy: { number: "desc" },
      include: {
        _count: { select: { issues: true } },
      },
    });
  }

  async getIssueTimeline(issueId: string) {
    const events = await prisma.issueEvent.findMany({
      where: { issueId },
      include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });

    return events.map(e => ({
      id: e.id,
      event: e.event,
      actor: e.actor,
      data: e.data,
      createdAt: e.createdAt,
    }));
  }

  async bulkUpdate(repositoryId: string, issueIds: string[], data: {
    state?: string;
    labels?: string[];
    milestoneId?: string | null;
    assigneeId?: string | null;
  }, actorId: string) {
    const results = [];
    for (const issueId of issueIds) {
      try {
        const result = await this.update(issueId, data, actorId);
        results.push(result);
      } catch {
        // Skip failed updates
      }
    }
    return results;
  }

  private async createIssueEvent(issueId: string, actorId: string, event: string, data?: Record<string, unknown>) {
    return prisma.issueEvent.create({
      data: { issueId, actorId, event, data: data || {} },
    });
  }
}

export const issueService = new IssueService();
