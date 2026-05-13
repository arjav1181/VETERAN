// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { repoService } from "../services/repo.service.js";
import { issueService } from "../services/issue.service.js";
import { pullService } from "../services/pull.service.js";
import { gitService } from "../services/git/git.service.js";
import { diffService } from "../services/git/diff.service.js";
import { archiveService } from "../services/git/archive.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await repoService.create({ ...req.body, ownerId: req.user!.id });
    res.status(201).json(repo);
  } catch (error) {
    next(error);
  }
});

router.get("/", optionalAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const repos = await repoService.listForUser(req.user.id, req.pagination.page, req.pagination.perPage, req.query.type as "owner" | "member" | "all");
      return res.json(repos);
    }
    const repos = await prisma.repository.findMany({
      where: { isPrivate: false },
      include: { owner: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { stars: true, forks: true } } },
      orderBy: { updatedAt: "desc" },
      skip: req.pagination.offset,
      take: req.pagination.perPage,
    });
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const repo = await prisma.repository.findUnique({
      where: { fullName },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        organization: { select: { id: true, name: true, slug: true, avatarUrl: true } },
        _count: { select: { stars: true, forks: true, watches: true, issues: { where: { state: "open" } }, pullRequests: { where: { state: "open" } }, branches: true, tags: true, releases: true } },
      },
    });
    if (!repo) throw new NotFoundError("Repository");

    if (repo.isPrivate && (!req.user || (repo.ownerId !== req.user.id))) {
      const collab = repo.ownerId !== req.user?.id ? await prisma.repoCollaborator.findUnique({ where: { repositoryId_userId: { repositoryId: repo.id, userId: req.user?.id || "" } } }) : null;
      if (!collab && repo.ownerId !== req.user?.id) {
        return res.status(404).json({ message: "Repository not found" });
      }
    }

    res.json(repo);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const repo = await prisma.repository.findUnique({ where: { fullName } });
    if (!repo) throw new NotFoundError("Repository");
    if (repo.ownerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

    const updated = await repoService.update(repo.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const repo = await prisma.repository.findUnique({ where: { fullName } });
    if (!repo) throw new NotFoundError("Repository");
    if (repo.ownerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

    await repoService.delete(repo.id);
    res.json({ message: "Repository deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/star", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const starred = await repoService.toggleStar(repo.id, req.user!.id);
    res.json({ starred });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/stargazers", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const [stars, total] = await Promise.all([
      prisma.star.findMany({
        where: { repositoryId: repo.id },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.star.count({ where: { repositoryId: repo.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(stars.map(s => s.user));
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/watch", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const watching = await repoService.toggleWatch(repo.id, req.user!.id);
    res.json({ watching });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/forks", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const fork = await repoService.fork(repo.id, req.user!.id);
    res.status(201).json(fork);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/forks", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const forks = await repoService.listForks(repo.id, req.pagination.page, req.pagination.perPage);
    res.json(forks);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/branches", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const branches = await gitService.getBranches(fullName);
    res.json(branches);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/branches/:branch", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const branch = await gitService.getBranch(fullName, req.params.branch);
    if (!branch) throw new NotFoundError("Branch");
    res.json(branch);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/tags", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const tags = await gitService.getTags(fullName);
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/commits", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const branch = (req.query.sha as string) || (req.query.branch as string) || "HEAD";
    const commits = await gitService.getCommitList(fullName, branch, req.pagination.page, req.pagination.perPage);
    res.json(commits);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/commits/:sha", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const commit = await gitService.getCommit(fullName, req.params.sha);
    if (!commit) throw new NotFoundError("Commit");
    res.json(commit);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/git/trees/:sha", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const recursive = req.query.recursive === "1" || req.query.recursive === "true";
    const tree = await gitService.getTree(fullName, req.params.sha, recursive);
    res.json({ sha: req.params.sha, tree, truncated: false });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/git/blobs/:sha", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const content = await gitService.getBlobAsString(fullName, req.params.sha);
    const size = content.length;
    res.json({ sha: req.params.sha, content, encoding: "utf-8", size });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/contents/*", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const path = req.params[0] || "";
    const ref = (req.query.ref as string) || "HEAD";
    const result = await gitService.getFileContent(fullName, path, ref);
    if (!result) throw new NotFoundError("File");
    res.json({ ...result, path, ref });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/readme", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const ref = (req.query.ref as string) || "HEAD";
    const result = await gitService.getFileContent(fullName, "README.md", ref) ||
      await gitService.getFileContent(fullName, "README", ref) ||
      await gitService.getFileContent(fullName, "Readme.md", ref);
    if (!result) throw new NotFoundError("README");
    res.json({ ...result, path: "README.md", ref });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/compare/:base...:head", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const { base, head } = req.params;

    const status = await gitService.compareCommits(fullName, base, head);
    const diff = diffService.getBranchCompare(fullName, base, head);

    res.json({
      status: status.status,
      aheadBy: status.aheadBy,
      behindBy: status.behindBy,
      totalCommits: status.aheadBy + status.behindBy,
      files: diff.files,
      totalAdditions: diff.totalAdditions,
      totalDeletions: diff.totalDeletions,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/releases", paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const [releases, total] = await Promise.all([
      prisma.release.findMany({
        where: { repositoryId: repo.id },
        include: { author: { select: { id: true, username: true, avatarUrl: true } }, assets: true },
        orderBy: { createdAt: "desc" },
        skip: req.pagination.offset,
        take: req.pagination.perPage,
      }),
      prisma.release.count({ where: { repositoryId: repo.id } }),
    ]);

    setPaginationHeaders(res, total, req.pagination.page, req.pagination.perPage);
    res.json(releases);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/releases", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const release = await prisma.release.create({
      data: {
        repositoryId: repo.id,
        tagName: req.body.tag_name,
        name: req.body.name,
        body: req.body.body,
        isPrerelease: req.body.prerelease || false,
        isDraft: req.body.draft ?? true,
        authorId: req.user!.id,
      },
    });

    res.status(201).json(release);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/releases/:releaseId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const release = await prisma.release.findUnique({
      where: { id: req.params.releaseId },
      include: { author: { select: { id: true, username: true, avatarUrl: true } }, assets: true },
    });
    if (!release) throw new NotFoundError("Release");
    res.json(release);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/releases/:releaseId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const release = await prisma.release.findUnique({ where: { id: req.params.releaseId } });
    if (!release) throw new NotFoundError("Release");

    const updated = await prisma.release.update({
      where: { id: req.params.releaseId },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/releases/:releaseId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const release = await prisma.release.findUnique({ where: { id: req.params.releaseId } });
    if (!release) throw new NotFoundError("Release");
    await prisma.release.delete({ where: { id: req.params.releaseId } });
    res.json({ message: "Release deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/topics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const topics = await repoService.listTopics(repo.id);
    res.json({ names: topics });
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/topics", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const { names } = req.body;
    await prisma.repoTopic.deleteMany({ where: { repositoryId: repo.id } });
    for (const topic of names || []) {
      await repoService.addTopic(repo.id, topic, req.user!.id);
    }
    res.json({ names: names || [] });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/collaborators", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const collaborators = await repoService.listCollaborators(repo.id);
    res.json(collaborators);
  } catch (error) {
    next(error);
  }
});

router.put("/:owner/:repo/collaborators/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");
    const collab = await repoService.addCollaborator(repo.id, user.id, req.body.permission || "pull");
    res.json(collab);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/collaborators/:username", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError("User");
    await repoService.removeCollaborator(repo.id, user.id);
    res.json({ message: "Collaborator removed" });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/downloads", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const { format } = req.query;
    const archiveFormat = format === "tar.gz" || format === "tar" ? format as "tar.gz" | "tar" : "zip";
    const ref = (req.query.ref as string) || repo.defaultBranch;

    const archiveInfo = await archiveService.getArchiveInfo(repo.fullName, ref, archiveFormat);
    const archive = await archiveService.createArchive(repo.fullName, ref, archiveFormat);

    res.set("Content-Type", archiveInfo.contentType);
    res.set("Content-Disposition", `attachment; filename="${archiveInfo.filename}"`);
    res.set("Content-Length", String(archive.size));
    res.sendFile(archive.path);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/archive/:archiveFormat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    let archiveFormat: "zip" | "tar" | "tar.gz" = "zip";
    if (req.params.archiveFormat.endsWith(".tar.gz")) archiveFormat = "tar.gz";
    else if (req.params.archiveFormat.endsWith(".zip")) archiveFormat = "zip";
    else if (req.params.archiveFormat.endsWith(".tar")) archiveFormat = "tar";

    const ref = (req.query.ref as string) || repo.defaultBranch;
    const archiveInfo = await archiveService.getArchiveInfo(repo.fullName, ref, archiveFormat);
    const archive = await archiveService.createArchive(repo.fullName, ref, archiveFormat);

    res.set("Content-Type", archiveInfo.contentType);
    res.set("Content-Disposition", `attachment; filename="${archiveInfo.filename}"`);
    res.set("Content-Length", String(archive.size));
    res.sendFile(archive.path);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/labels", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const labels = await issueService.listLabels(repo.id);
    res.json(labels);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/labels", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const label = await issueService.createLabel(repo.id, req.body);
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/labels/:name", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const label = await prisma.issueLabel.findUnique({ where: { repositoryId_name: { repositoryId: repo.id, name: req.params.name } } });
    if (!label) throw new NotFoundError("Label");
    const updated = await issueService.updateLabel(label.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/labels/:name", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const label = await prisma.issueLabel.findUnique({ where: { repositoryId_name: { repositoryId: repo.id, name: req.params.name } } });
    if (!label) throw new NotFoundError("Label");
    await issueService.deleteLabel(label.id);
    res.json({ message: "Label deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/milestones", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const milestones = await issueService.listMilestones(repo.id, req.query.state as string);
    res.json(milestones);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/milestones", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");
    const milestone = await issueService.createMilestone(repo.id, req.body);
    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
});

export default router;
