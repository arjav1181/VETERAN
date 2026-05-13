import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { packageService } from "../services/package.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await packageService.listPackages({
      type: req.query.type as string,
      visibility: req.query.visibility as string,
      page: req.pagination.page,
      perPage: req.pagination.perPage,
    });
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.packages);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/packages", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const result = await packageService.listPackages({
      repositoryId: repo.id,
      type: req.query.type as string,
      page: req.pagination.page,
      perPage: req.pagination.perPage,
    });
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.packages);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/packages/:packageName", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pkg = await prisma.package.findFirst({
      where: { name: req.params.packageName },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!pkg) throw new NotFoundError("Package");
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/packages/:packageName", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pkg = await prisma.package.findFirst({ where: { name: req.params.packageName } });
    if (!pkg) throw new NotFoundError("Package");
    await packageService.deletePackage(pkg.id);
    res.json({ message: "Package deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/packages/:packageName/versions", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pkg = await prisma.package.findFirst({ where: { name: req.params.packageName } });
    if (!pkg) throw new NotFoundError("Package");

    const result = await packageService.listVersions(pkg.id, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.versions);
  } catch (error) {
    next(error);
  }
});

router.get("/npm/:packageName", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pkg = await packageService.getNpmPackage(req.params.packageName);
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

router.put("/npm/:packageName", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pkg = await prisma.package.findFirst({ where: { name: req.params.packageName, type: "npm" } });
    if (!pkg) {
      pkg = await packageService.createPackage({
        name: req.params.packageName,
        type: "npm",
        ownerId: req.user!.id,
      });
    }

    const attachment = req.body.versions?.[Object.keys(req.body.versions || {})[0]]?.dist;
    let fileBuffer: Buffer | undefined;

    if (attachment?.tarball) {
      const response = await fetch(attachment.tarball);
      fileBuffer = Buffer.from(await response.arrayBuffer());
    }

    const version = await packageService.publishVersion({
      packageId: pkg.id,
      version: Object.keys(req.body.versions || {})[0] || "1.0.0",
      metadata: req.body,
      fileBuffer,
    });

    res.status(201).json(version);
  } catch (error) {
    next(error);
  }
});

export default router;
