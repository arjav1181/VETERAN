// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service.js";
import { requireAuth } from "../middleware/auth.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";

const router = Router();

router.get("/", requireAuth, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.list(req.user!.id, {
      type: req.query.type as string,
      isRead: req.query.all === "true" ? undefined : false,
      page: req.pagination.page,
      perPage: req.pagination.perPage,
    });

    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json(result.notifications);
  } catch (error) {
    next(error);
  }
});

router.get("/unread", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

router.patch("/:notificationId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.params.notificationId, req.user!.id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

router.patch("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

router.delete("/:notificationId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.delete(req.params.notificationId, req.user!.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/subscriptions", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subs = await notificationService.listSubscriptions(req.user!.id);
    res.json(subs);
  } catch (error) {
    next(error);
  }
});

router.put("/subscriptions", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await notificationService.subscribe(req.user!.id, req.body.repo_id, req.body.type, req.body.channel);
    res.status(201).json(sub);
  } catch (error) {
    next(error);
  }
});

router.delete("/subscriptions/:subId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.unsubscribe(req.params.subId, req.user!.id);
    res.json({ message: "Unsubscribed" });
  } catch (error) {
    next(error);
  }
});

export default router;
