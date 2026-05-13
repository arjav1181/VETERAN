// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description } = req.body;
    const org = await prisma.organization.create({
      data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), description },
    });

    await prisma.orgMember.create({
      data: { organizationId: org.id, userId: req.user!.id, role: "owner" },
    });

    res.status(201).json(org);
  } catch (error) {
    next(error);
  }
});

router.get("/", optionalAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        skip: req.pagination.offset,
        take: req.pagination.perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.organization.count(),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(orgs);
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: req.params.orgSlug },
      include: { _count: { select: { members: true, repositories: true, teams: true } } },
    });
    if (!org) throw new NotFoundError("Organization");
    res.json(org);
  } catch (error) {
    next(error);
  }
});

router.patch("/:orgSlug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const membership = await prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: org.id, userId: req.user!.id } },
    });
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:orgSlug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const membership = await prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: org.id, userId: req.user!.id } },
    });
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({ message: "Only owners can delete the organization" });
    }

    await prisma.organization.delete({ where: { id: org.id } });
    res.json({ message: "Organization deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug/members", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const [members, total] = await Promise.all([
      prisma.orgMember.findMany({
        where: { organizationId: org.id },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
      }),
      prisma.orgMember.count({ where: { organizationId: org.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(members.map(m => ({ ...m.user, role: m.role, permissions: m.permissions })));
  } catch (error) {
    next(error);
  }
});

router.put("/:orgSlug/members/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const existing = await prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    });
    if (existing) return res.status(409).json({ message: "Already a member" });

    const member = await prisma.orgMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: req.body.role || "member",
      },
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

router.delete("/:orgSlug/members/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    await prisma.orgMember.delete({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    });

    res.json({ message: "Member removed" });
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug/repos", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const [repos, total] = await Promise.all([
      prisma.repository.findMany({
        where: { organizationId: org.id },
        include: { owner: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { stars: true, forks: true } } },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.repository.count({ where: { organizationId: org.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug/teams", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const teams = await prisma.team.findMany({
      where: { organizationId: org.id },
      include: { _count: { select: { members: true, repos: true } } },
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug/audit-log", requireAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { orgId: org.id },
        include: { actor: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
      }),
      prisma.auditLog.count({ where: { orgId: org.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
