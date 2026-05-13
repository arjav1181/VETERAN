// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/discussions", optionalAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where: { repositoryId: repo.id },
        include: { author: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { comments: true, votes: true } } },
        orderBy: { createdAt: "desc" },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
      }),
      prisma.discussion.count({ where: { repositoryId: repo.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(discussions);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/discussions", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const lastDiscussion = await prisma.discussion.findFirst({
      where: { repositoryId: repo.id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const discussion = await prisma.discussion.create({
      data: {
        repositoryId: repo.id,
        number: (lastDiscussion?.number || 0) + 1,
        title: req.body.title,
        body: req.body.body,
        authorId: req.user!.id,
      },
    });

    res.status(201).json(discussion);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/discussions/:discussionNumber", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const discussion = await prisma.discussion.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.discussionNumber) },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        comments: {
          include: { author: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        votes: true,
      },
    });

    if (!discussion) throw new NotFoundError("Discussion");
    res.json(discussion);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/discussions/:discussionNumber/comments", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const discussion = await prisma.discussion.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.discussionNumber) },
    });
    if (!discussion) throw new NotFoundError("Discussion");

    const comment = await prisma.discussionComment.create({
      data: {
        discussionId: discussion.id,
        authorId: req.user!.id,
        body: req.body.body,
        parentId: req.body.parent_id,
      },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/discussions/:discussionNumber/vote", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const discussion = await prisma.discussion.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.discussionNumber) },
    });
    if (!discussion) throw new NotFoundError("Discussion");

    const existing = await prisma.discussionVote.findUnique({
      where: { discussionId_userId: { discussionId: discussion.id, userId: req.user!.id } },
    });

    if (existing) {
      await prisma.discussionVote.delete({ where: { id: existing.id } });
      res.json({ voted: false });
    } else {
      await prisma.discussionVote.create({ data: { discussionId: discussion.id, userId: req.user!.id, vote: 1 } });
      res.json({ voted: true });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
