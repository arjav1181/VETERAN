// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAdmin } from "../middleware/auth.js";
import { analyticsService } from "../services/analytics.service.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";

const router = Router();

router.get("/stats", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getSiteStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/users", requireAdmin, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: req.pagination.offset,
        take: req.pagination.perPage,
        orderBy: { createdAt: "desc" },
        select: { id: true, username: true, email: true, isActive: true, isAdmin: true, createdAt: true, _count: { select: { ownedRepositories: true } } },
      }),
      prisma.user.count(),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:userId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, isAdmin } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { ...(isActive !== undefined && { isActive }), ...(isAdmin !== undefined && { isAdmin }) },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:userId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.userId } });
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/repos", requireAdmin, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [repos, total] = await Promise.all([
      prisma.repository.findMany({
        skip: req.pagination.offset,
        take: req.pagination.perPage,
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { id: true, username: true } } },
      }),
      prisma.repository.count(),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.delete("/repos/:repoId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.repository.delete({ where: { id: req.params.repoId } });
    res.json({ message: "Repository deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/settings", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.adminSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const s of settings) map[s.key] = s.value;
    res.json(map);
  } catch (error) {
    next(error);
  }
});

router.put("/settings", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await prisma.adminSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    res.json({ message: "Settings updated" });
  } catch (error) {
    next(error);
  }
});

router.get("/announcements", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await prisma.siteAnnouncement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(announcements);
  } catch (error) {
    next(error);
  }
});

router.post("/announcements", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await prisma.siteAnnouncement.create({
      data: {
        message: req.body.message,
        severity: req.body.severity || "info",
        orgId: req.body.org_id,
        createdById: req.user!.id,
      },
    });
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
});

router.delete("/announcements/:announcementId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.siteAnnouncement.delete({ where: { id: req.params.announcementId } });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
