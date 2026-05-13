// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { authService } from "../services/auth/auth.service.js";
import { requireAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, perPage, offset } = req.pagination;
    const query = req.query.q as string || "";

    const where = query
      ? { OR: [{ username: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }] }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          location: true,
          company: true,
          createdAt: true,
          _count: { select: { followers: true, following: true } },
        },
        skip: offset,
        take: perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    setPaginationHeaders(res, total, page, perPage);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/:username", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        company: true,
        location: true,
        websiteUrl: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            ownedRepositories: true,
            stars: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundError("User");
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/:username/repos", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, perPage, offset } = req.pagination;
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const type = req.query.type as string || "owner";
    const where: Record<string, unknown> = {};
    if (type === "owner") where.ownerId = user.id;
    else if (type === "member") where.collaborators = { some: { userId: user.id } };
    else where.OR = [{ ownerId: user.id }, { collaborators: { some: { userId: user.id } } }];

    const [repos, total] = await Promise.all([
      prisma.repository.findMany({
        where,
        include: {
          owner: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { stars: true, forks: true } },
        },
        skip: offset,
        take: perPage,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.repository.count({ where }),
    ]);

    setPaginationHeaders(res, total, page, perPage);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.get("/:username/followers", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, perPage, offset } = req.pagination;
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: user.id },
        include: { follower: { select: { id: true, username: true, avatarUrl: true } } },
        skip: offset,
        take: perPage,
      }),
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    setPaginationHeaders(res, total, page, perPage);
    res.json(followers.map(f => f.follower));
  } catch (error) {
    next(error);
  }
});

router.get("/:username/following", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, perPage, offset } = req.pagination;
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: user.id },
        include: { following: { select: { id: true, username: true, avatarUrl: true } } },
        skip: offset,
        take: perPage,
      }),
      prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    setPaginationHeaders(res, total, page, perPage);
    res.json(following.map(f => f.following));
  } catch (error) {
    next(error);
  }
});

router.put("/:username/follow", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) throw new NotFoundError("User");
    if (target.id === req.user!.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.user!.id, followingId: target.id } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      res.json({ message: "Unfollowed" });
    } else {
      await prisma.follow.create({ data: { followerId: req.user!.id, followingId: target.id } });
      res.json({ message: "Followed" });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:username/starred", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, perPage, offset } = req.pagination;
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");

    const [stars, total] = await Promise.all([
      prisma.star.findMany({
        where: { userId: user.id },
        include: {
          repository: {
            include: {
              owner: { select: { id: true, username: true, avatarUrl: true } },
              _count: { select: { stars: true, forks: true } },
            },
          },
        },
        skip: offset,
        take: perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.star.count({ where: { userId: user.id } }),
    ]);

    setPaginationHeaders(res, total, page, perPage);
    res.json(stars.map(s => s.repository));
  } catch (error) {
    next(error);
  }
});

export default router;
