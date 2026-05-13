import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { lfsService } from "../services/git/lfs.service.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/:owner/:repo/lfs/batch", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const result = await lfsService.handleBatch(repo.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/lfs/objects/:oid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!lfsService.objectExists(req.params.oid)) {
      return res.status(404).json({ message: "Object not found" });
    }

    const stream = lfsService.getObjectStream(req.params.oid);
    res.set("Content-Type", "application/octet-stream");
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/lfs/objects/:oid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    await lfsService.uploadObject(req.params.oid, buffer);
    res.status(200).json({ message: "Uploaded" });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/lfs/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oid, size } = req.body;
    if (!lfsService.objectExists(oid)) {
      return res.status(404).json({ message: "Object not found" });
    }
    res.json({ message: "Verified" });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/lfs/locks", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const lock = await lfsService.lockFile(repo.id, req.body.path, req.user!.id);
    res.status(201).json(lock);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/lfs/locks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const locks = await lfsService.listLocks(repo.id, req.query.path as string);
    res.json({ locks });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/lfs/locks/:lockId/unlock", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await lfsService.unlockFile(req.params.lockId, req.user!.id, req.body.force || false);
    res.json({ message: "Unlocked" });
  } catch (error) {
    next(error);
  }
});

export default router;
