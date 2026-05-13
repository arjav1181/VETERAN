import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { analyticsService } from "../services/analytics.service.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/stats/contributors", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const stats = await analyticsService.getContributorStats(repo.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/traffic", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const traffic = await analyticsService.getTrafficStats(repo.id, (req.query.period as "day" | "week" | "month") || "week");
    res.json(traffic);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/clones", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const clones = await analyticsService.getCloneStats(repo.id, (req.query.period as "day" | "week" | "month") || "week");
    res.json(clones);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/activity", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const days = parseInt(req.query.days as string) || 30;
    const activity = await analyticsService.getRepoActivity(repo.id, days);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/code-frequency", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/participation", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ all: [], owner: [], others: [] });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stats/punch-card", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});

router.get("/repositories/:repoId/health", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await analyticsService.getRepositoryHealth(req.params.repoId);
    if (!health) throw new NotFoundError("Repository");
    res.json(health);
  } catch (error) {
    next(error);
  }
});

export default router;
