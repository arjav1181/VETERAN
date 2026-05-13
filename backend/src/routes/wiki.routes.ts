import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/:owner/:repo/wiki", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const pages = await prisma.wikiPage.findMany({
      where: { repositoryId: repo.id, isPublished: true },
      orderBy: { title: "asc" },
    });

    res.json(pages);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/wiki/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const page = await prisma.wikiPage.findUnique({
      where: { repositoryId_slug: { repositoryId: repo.id, slug: req.params.slug } },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        revisions: { orderBy: { number: "desc" }, take: 5 },
      },
    });

    if (!page) throw new NotFoundError("Page");
    res.json(page);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/wiki", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");

    const page = await prisma.wikiPage.create({
      data: {
        repositoryId: repo.id,
        title: req.body.title,
        slug,
        body: req.body.body || "",
        authorId: req.user!.id,
      },
    });

    await prisma.wikiRevision.create({
      data: {
        pageId: page.id,
        authorId: req.user!.id,
        body: req.body.body || "",
        message: "Created page",
        number: 1,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/wiki/:slug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const page = await prisma.wikiPage.findUnique({
      where: { repositoryId_slug: { repositoryId: repo.id, slug: req.params.slug } },
    });
    if (!page) throw new NotFoundError("Page");

    const lastRevision = await prisma.wikiRevision.findFirst({
      where: { pageId: page.id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const updated = await prisma.wikiPage.update({
      where: { id: page.id },
      data: { body: req.body.body, title: req.body.title || page.title },
    });

    await prisma.wikiRevision.create({
      data: {
        pageId: page.id,
        authorId: req.user!.id,
        body: req.body.body || page.body,
        message: req.body.message || "Updated page",
        number: (lastRevision?.number || 0) + 1,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/wiki/:slug", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const page = await prisma.wikiPage.findUnique({
      where: { repositoryId_slug: { repositoryId: repo.id, slug: req.params.slug } },
    });
    if (!page) throw new NotFoundError("Page");

    await prisma.wikiPage.delete({ where: { id: page.id } });
    res.json({ message: "Page deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
