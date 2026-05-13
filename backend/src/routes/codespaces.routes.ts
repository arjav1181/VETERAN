// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { codespaceService } from "../services/codespace.service.js";
import { requireAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codespace = await codespaceService.create({
      userId: req.user!.id,
      repositoryId: req.body.repository_id,
      branch: req.body.branch,
      machineType: req.body.machine_type,
      location: req.body.location,
    });
    res.status(201).json(codespace);
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await codespaceService.list(req.user!.id, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.codespaces);
  } catch (error) {
    next(error);
  }
});

router.get("/:codespaceId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codespace = await codespaceService.getById(req.params.codespaceId, req.user!.id);
    res.json(codespace);
  } catch (error) {
    next(error);
  }
});

router.patch("/:codespaceId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { machine_type, branch } = req.body;
    const codespace = await codespaceService.getById(req.params.codespaceId, req.user!.id);
    const updated = await prisma.codespace.update({
      where: { id: req.params.codespaceId },
      data: { machineType: machine_type, branch },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/:codespaceId/start", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codespace = await codespaceService.start(req.params.codespaceId, req.user!.id);
    res.json(codespace);
  } catch (error) {
    next(error);
  }
});

router.post("/:codespaceId/stop", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codespace = await codespaceService.stop(req.params.codespaceId, req.user!.id);
    res.json(codespace);
  } catch (error) {
    next(error);
  }
});

router.delete("/:codespaceId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await codespaceService.delete(req.params.codespaceId, req.user!.id);
    res.json({ message: "Codespace deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:codespaceId/ports", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codespace = await codespaceService.getById(req.params.codespaceId, req.user!.id);
    res.json(codespace.ports);
  } catch (error) {
    next(error);
  }
});

router.post("/:codespaceId/ports", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const port = await codespaceService.addPort(req.params.codespaceId, req.user!.id, req.body.port, req.body.visibility, req.body.label);
    res.status(201).json(port);
  } catch (error) {
    next(error);
  }
});

router.delete("/:codespaceId/ports/:portId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await codespaceService.removePort(req.params.portId, req.user!.id);
    res.json({ message: "Port removed" });
  } catch (error) {
    next(error);
  }
});

router.get("/machines", (_req: Request, res: Response) => {
  const { CODESPACE_MACHINES } = require("../config/constants.js");
  res.json(CODESPACE_MACHINES);
});

export default router;
