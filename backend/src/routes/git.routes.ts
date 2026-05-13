import { Router, Request, Response, NextFunction } from "express";
import { gitService } from "../services/git/git.service.js";
import { NotFoundError } from "../middleware/errorHandler.js";
import { gitRateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.get("/:owner/:repo/info/refs", gitRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const service = req.query.service as string;

    if (!service || !["git-upload-pack", "git-receive-pack"].includes(service)) {
      return res.status(400).json({ message: "Invalid service" });
    }

    const svc = service === "git-upload-pack" ? "upload-pack" : "receive-pack";
    const result = await gitService.handleSmartHttp(fullName, "info/refs", null);

    res.set("Content-Type", result.contentType);
    res.set("Cache-Control", "no-cache");
    res.set("Expires", "Fri, 01 Jan 1980 00:00:00 GMT");
    res.set("Pragma", "no-cache");
    res.send(result.body);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/git-upload-pack", gitRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const input = Buffer.concat(chunks);

    const result = await gitService.handleSmartHttp(fullName, "upload-pack", input);

    res.set("Content-Type", result.contentType);
    res.set("Cache-Control", "no-cache");
    res.send(result.body);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/git-receive-pack", gitRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const input = Buffer.concat(chunks);

    const result = await gitService.handleSmartHttp(fullName, "receive-pack", input);

    res.set("Content-Type", result.contentType);
    res.set("Cache-Control", "no-cache");
    res.send(result.body);
  } catch (error) {
    next(error);
  }
});

export default router;
