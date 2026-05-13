import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { issueService } from "../services/issue.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/issues", optionalAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const result = await issueService.list(repo.id, {
      state: req.query.state as string,
      labels: req.query.labels ? (req.query.labels as string).split(",") : undefined,
      milestoneId: req.query.milestone as string,
      assigneeId: req.query.assignee as string,
      authorId: req.query.creator as string,
      sort: req.query.sort as string,
      direction: req.query.direction as "asc" | "desc",
      page: req.pagination.page,
      perPage: req.pagination.perPage,
    });

    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.issues);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/issues", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await issueService.create({
      repositoryId: repo.id,
      title: req.body.title,
      body: req.body.body,
      authorId: req.user!.id,
      milestoneId: req.body.milestone,
      labels: req.body.labels,
      assignees: req.body.assignees,
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/issues/:issueNumber", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        assignees: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
        milestone: true,
        comments: {
          include: { author: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    if (!issue) throw new NotFoundError("Issue");
    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/issues/:issueNumber", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
    });
    if (!issue) throw new NotFoundError("Issue");

    const updated = await issueService.update(issue.id, req.body, req.user!.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/issues/:issueNumber/comments", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
    });
    if (!issue) throw new NotFoundError("Issue");

    const comment = await issueService.addComment(issue.id, req.user!.id, req.body.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/issues/:issueNumber/comments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
    });
    if (!issue) throw new NotFoundError("Issue");

    const comments = await prisma.issueComment.findMany({
      where: { issueId: issue.id },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/issues/comments/:commentId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await issueService.updateComment(req.params.commentId, req.user!.id, req.body.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/issues/comments/:commentId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await issueService.deleteComment(req.params.commentId, req.user!.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/issues/:issueNumber/reactions", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
    });
    if (!issue) throw new NotFoundError("Issue");

    const reaction = await issueService.addReaction({ issueId: issue.id }, req.user!.id, req.body.content);
    res.status(201).json(reaction);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/issues/:issueNumber/timeline", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const issue = await prisma.issue.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.issueNumber) },
    });
    if (!issue) throw new NotFoundError("Issue");

    const timeline = await issueService.getIssueTimeline(issue.id);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

export default router;
