import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/pages/:owner/:repo", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    res.json({
      url: `https://${req.params.owner}.veteran.dev/${req.params.repo}`,
      status: "built",
      cname: null,
      custom_404: false,
      html_url: `https://${req.params.owner}.veteran.dev/${req.params.repo}`,
      source: {
        branch: repo.defaultBranch,
        directory: "/",
      },
      public: !repo.isPrivate,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/pages/:owner/:repo/build", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    res.json({ status: "queued", timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

router.get("/pages/:owner/:repo/builds", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});

router.get("/pages/:owner/:repo/builds/latest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: "built",
      error: null,
      pusher: null,
      commit: null,
      duration: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
