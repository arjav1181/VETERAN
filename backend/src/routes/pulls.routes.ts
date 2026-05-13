import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { pullService } from "../services/pull.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/pulls", optionalAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const result = await pullService.list(repo.id, {
      state: req.query.state as string,
      head: req.query.head as string,
      base: req.query.base as string,
      sort: req.query.sort as string,
      direction: req.query.direction as "asc" | "desc",
      page: req.pagination.page,
      perPage: req.pagination.perPage,
    });

    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.pullRequests);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/pulls", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await pullService.create({
      repositoryId: repo.id,
      title: req.body.title,
      body: req.body.body,
      authorId: req.user!.id,
      headBranch: req.body.head,
      baseBranch: req.body.base,
      isDraft: req.body.draft || false,
    });

    res.status(201).json(pr);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/pulls/:pullNumber", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        mergedBy: { select: { id: true, username: true, avatarUrl: true } },
        closedBy: { select: { id: true, username: true, avatarUrl: true } },
        milestone: { select: { id: true, title: true, number: true } },
        reviews: { include: { reviewer: { select: { id: true, username: true, avatarUrl: true } } }, orderBy: { submittedAt: "desc" } },
        _count: { select: { reviewComments: true, commits: true } },
      },
    });

    if (!pr) throw new NotFoundError("Pull request");
    res.json(pr);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/pulls/:pullNumber", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const updated = await pullService.update(pr.id, req.body, req.user!.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/pulls/:pullNumber/merge", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const result = await pullService.merge(pr.id, req.user!.id, req.body.merge_method || "merge");
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/pulls/:pullNumber/commits", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const commits = await pullService.getCommits(pr.id);
    res.json(commits.map(c => c.commit));
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/pulls/:pullNumber/files", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const files = await pullService.getFiles(pr.id);
    res.json(files.files);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/pulls/:pullNumber/reviews", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const reviews = await prisma.prReview.findMany({
      where: { pullRequestId: pr.id },
      include: { reviewer: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { submittedAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/pulls/:pullNumber/reviews", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const review = await pullService.addReview(pr.id, req.user!.id, req.body.body, req.body.event || "comment", req.body.commit_id);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/pulls/:pullNumber/comments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const comments = await prisma.prReviewComment.findMany({
      where: { pullRequestId: pr.id },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/pulls/:pullNumber/comments", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pr = await prisma.pullRequest.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.pullNumber) },
    });
    if (!pr) throw new NotFoundError("Pull request");

    const comment = await pullService.addReviewComment(
      pr.id,
      req.body.review_id,
      req.user!.id,
      req.body.body,
      req.body.path,
      req.body.position,
      req.body.commit_id || pr.headSha,
      req.body.in_reply_to_id
    );
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export default router;
