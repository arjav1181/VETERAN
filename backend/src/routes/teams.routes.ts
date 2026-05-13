import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/:orgSlug/teams", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const { name, description, visibility } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const team = await prisma.team.create({
      data: { organizationId: org.id, name, slug, description, visibility: visibility || "secret" },
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

router.get("/:orgSlug/teams/:teamSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
      include: {
        members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
        repos: { include: { repository: { select: { id: true, fullName: true } } } },
        _count: { select: { members: true, repos: true } },
      },
    });

    if (!team) throw new NotFoundError("Team");
    res.json(team);
  } catch (error) {
    next(error);
  }
});

router.patch("/:orgSlug/teams/:teamSlug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    const updated = await prisma.team.update({ where: { id: team.id }, data: req.body });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:orgSlug/teams/:teamSlug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    await prisma.team.delete({ where: { id: team.id } });
    res.json({ message: "Team deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:orgSlug/teams/:teamSlug/members/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const member = await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id, role: req.body.role || "member" },
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

router.delete("/:orgSlug/teams/:teamSlug/members/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
    });

    res.json({ message: "Member removed" });
  } catch (error) {
    next(error);
  }
});

router.put("/:orgSlug/teams/:teamSlug/repos/:owner/:repo", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const teamRepo = await prisma.teamRepo.create({
      data: { teamId: team.id, repositoryId: repo.id, permission: req.body.permission || "pull" },
    });

    res.status(201).json(teamRepo);
  } catch (error) {
    next(error);
  }
});

router.delete("/:orgSlug/teams/:teamSlug/repos/:owner/:repo", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
    if (!org) throw new NotFoundError("Organization");

    const team = await prisma.team.findFirst({
      where: { organizationId: org.id, slug: req.params.teamSlug },
    });
    if (!team) throw new NotFoundError("Team");

    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    await prisma.teamRepo.delete({
      where: { teamId_repositoryId: { teamId: team.id, repositoryId: repo.id } },
    });

    res.json({ message: "Repository removed from team" });
  } catch (error) {
    next(error);
  }
});

export default router;
