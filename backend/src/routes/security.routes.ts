import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { securityService } from "../services/security.service.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/security-advisories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/security-advisories", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const advisory = await securityService.createAdvisory({
      repositoryId: repo.id,
      ...req.body,
      authorId: req.user!.id,
    });

    res.status(201).json(advisory);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/dependabot/alerts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await securityService.getDependabotAlerts(req.params.repo);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/secret-scanning/alerts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const results = await securityService.scanRepository(fullName);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/vulnerability-alerts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});

export default router;
