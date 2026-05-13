import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { webhookService } from "../services/webhook.service.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/:owner/:repo/hooks", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const webhook = await webhookService.create({
      repositoryId: repo.id,
      url: req.body.url,
      contentType: req.body.content_type,
      secret: req.body.secret,
      events: req.body.events || ["push"],
      sslVerify: req.body.ssl_verify,
    });

    res.status(201).json(webhook);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/hooks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = await prisma.repository.findUnique({ where: { fullName: `${req.params.owner}/${req.params.repo}` } });
    if (!repo) throw new NotFoundError("Repository");

    const webhooks = await webhookService.listForRepo(repo.id);
    res.json(webhooks);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/hooks/:hookId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhook = await webhookService.getById(req.params.hookId);
    res.json(webhook);
  } catch (error) {
    next(error);
  }
});

router.patch("/:owner/:repo/hooks/:hookId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhook = await webhookService.update(req.params.hookId, req.body);
    res.json(webhook);
  } catch (error) {
    next(error);
  }
});

router.delete("/:owner/:repo/hooks/:hookId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await webhookService.delete(req.params.hookId);
    res.json({ message: "Webhook deleted" });
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/hooks/:hookId/ping", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await webhookService.ping(req.params.hookId);
    res.json({ message: "Ping sent" });
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/hooks/:hookId/deliveries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await webhookService.listDeliveries(req.params.hookId);
    res.json(result.deliveries);
  } catch (error) {
    next(error);
  }
});

router.get("/:owner/:repo/hooks/:hookId/deliveries/:deliveryId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await webhookService.getDelivery(req.params.deliveryId);
    res.json(delivery);
  } catch (error) {
    next(error);
  }
});

router.post("/:owner/:repo/hooks/:hookId/deliveries/:deliveryId/retry", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await webhookService.retryDelivery(req.params.deliveryId);
    res.json({ message: "Retry initiated" });
  } catch (error) {
    next(error);
  }
});

export default router;
