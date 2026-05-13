import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { ciService } from "../services/ci.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/actions/runners", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ runners: [], total_count: 0 });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/workflows", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    res.json({ workflows: [], total_count: 0 });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/runs", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const result = await ciService.listPipelines(repo.id, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json({ workflow_runs: result.pipelines, total_count: result.total });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/runs/:runId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pipeline = await ciService.getPipeline(req.params.runId);
    res.json(pipeline);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/actions/runs/:runId/cancel", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ciService.cancelPipeline(req.params.runId);
    res.json({ message: "Cancelled" });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/actions/runs/:runId/rerun", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pipeline = await ciService.getPipeline(req.params.runId);
    const newPipeline = await ciService.createPipeline({
      repositoryId: pipeline.repository.id,
      commitSha: (pipeline as Record<string, unknown>).commitSha as string,
      branch: (pipeline as Record<string, unknown>).branch as string,
      creatorId: req.user!.id,
    });
    res.status(201).json(newPipeline);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/jobs/:jobId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.ciJob.findUnique({
      where: { id: req.params.jobId },
      include: { logs: { orderBy: { lineStart: "asc" } }, artifacts: true },
    });
    if (!job) throw new NotFoundError("Job");
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/jobs/:jobId/logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await ciService.getLogs(req.params.jobId);
    const content = logs.map(l => l.content).join("");
    res.type("text/plain").send(content);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/actions/artifacts", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const [artifacts, total] = await Promise.all([
      prisma.ciArtifact.findMany({
        where: { job: { pipeline: { repositoryId: repo.id } } },
        orderBy: { createdAt: "desc" },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
      }),
      prisma.ciArtifact.count({ where: { job: { pipeline: { repositoryId: repo.id } } } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json({ artifacts, total_count: total });
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/actions/artifacts/:artifactId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ciService.deleteArtifact(req.params.artifactId);
    res.json({ message: "Artifact deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
