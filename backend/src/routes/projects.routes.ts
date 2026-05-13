import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/:owner/:repo/projects", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const lastProject = await prisma.project.findFirst({
      where: { repositoryId: repo.id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const project = await prisma.project.create({
      data: {
        repositoryId: repo.id,
        name: req.body.name,
        body: req.body.body,
        number: (lastProject?.number || 0) + 1,
        creatorId: req.user!.id,
      },
    });

    await prisma.projectColumn.create({ data: { projectId: project.id, name: "To Do", position: 0 } });
    await prisma.projectColumn.create({ data: { projectId: project.id, name: "In Progress", position: 1 } });
    await prisma.projectColumn.create({ data: { projectId: project.id, name: "Done", position: 2 } });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const projects = await prisma.project.findMany({
      where: { repositoryId: repo.id, state: "open" },
      include: { columns: { include: { _count: { select: { cards: true } } } }, creator: { select: { id: true, username: true } } },
      orderBy: { number: "desc" },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/projects/:projectNumber", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const project = await prisma.project.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.projectNumber) },
      include: { columns: { include: { cards: { include: { issue: true, creator: { select: { id: true, username: true } } } } }, orderBy: { position: "asc" } }, creator: { select: { id: true, username: true } } },
    });

    if (!project) throw new NotFoundError("Project");
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/projects/:projectNumber", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const project = await prisma.project.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.projectNumber) },
    });
    if (!project) throw new NotFoundError("Project");

    const updated = await prisma.project.update({ where: { id: project.id }, data: req.body });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/projects/:projectNumber/columns", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const project = await prisma.project.findFirst({
      where: { repositoryId: repo.id, number: parseInt(req.params.projectNumber) },
    });
    if (!project) throw new NotFoundError("Project");

    const lastColumn = await prisma.projectColumn.findFirst({
      where: { projectId: project.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const column = await prisma.projectColumn.create({
      data: { projectId: project.id, name: req.body.name, position: (lastColumn?.position ?? -1) + 1 },
    });

    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/projects/:projectNumber/columns/:columnId/cards", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const column = await prisma.projectColumn.findUnique({ where: { id: req.params.columnId } });
    if (!column) throw new NotFoundError("Column");

    const lastCard = await prisma.projectCard.findFirst({
      where: { columnId: column.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const card = await prisma.projectCard.create({
      data: {
        columnId: column.id,
        issueId: req.body.issue_id,
        note: req.body.note,
        position: (lastCard?.position ?? -1) + 1,
        creatorId: req.user!.id,
      },
    });

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
});

router.patch("/projects/columns/cards/:cardId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await prisma.projectCard.findUnique({ where: { id: req.params.cardId } });
    if (!card) throw new NotFoundError("Card");

    const updated = await prisma.projectCard.update({ where: { id: req.params.cardId }, data: req.body });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/projects/columns/cards/:cardId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await prisma.projectCard.findUnique({ where: { id: req.params.cardId } });
    if (!card) throw new NotFoundError("Card");

    await prisma.projectCard.delete({ where: { id: req.params.cardId } });
    res.json({ message: "Card deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
