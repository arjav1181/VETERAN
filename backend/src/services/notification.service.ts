// @ts-nocheck
import prisma from "../config/database.js";
import { emailService } from "./email.service.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";
import { getRedis } from "../config/redis.js";
import { CACHE_TTL, NOTIFICATION_TYPES } from "../config/constants.js";

export class NotificationService {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    repoId?: string;
    actorId?: string;
    link?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data || {},
        repoId: data.repoId,
        actorId: data.actorId,
        link: data.link,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (user && user.isEmailVerified) {
      const sub = await prisma.notificationSubscription.findFirst({
        where: { userId: data.userId, type: data.type, enabled: true },
      });

      if (sub) {
        try {
          await emailService.sendNotificationEmail(user.email, data.title, data.body || "", data.link || "");
        } catch {
          // Non-critical
        }
      }
    }

    const redis = getRedis();
    await redis.publish("notifications", JSON.stringify({
      userId: data.userId,
      notification: {
        id: notification.id,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
        link: data.link,
        createdAt: notification.createdAt,
      },
    }));

    return notification;
  }

  async list(userId: string, filters: {
    type?: string;
    isRead?: boolean;
    page?: number;
    perPage?: number;
  }) {
    const where: Record<string, unknown> = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.isRead !== undefined) where.isRead = filters.isRead;

    const page = filters.page || 1;
    const perPage = filters.perPage || 30;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, perPage };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundError("Notification");

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundError("Notification");

    await prisma.notification.delete({ where: { id: notificationId } });
  }

  async clearAll(userId: string) {
    await prisma.notification.deleteMany({ where: { userId } });
  }

  async subscribe(userId: string, repoId: string | undefined, type: string, channel: string = "email") {
    const existing = await prisma.notificationSubscription.findFirst({
      where: { userId, repoId: repoId || null, type, channel },
    });

    if (existing) {
      return prisma.notificationSubscription.update({
        where: { id: existing.id },
        data: { enabled: true },
      });
    }

    return prisma.notificationSubscription.create({
      data: { userId, repoId, type, channel },
    });
  }

  async unsubscribe(subscriptionId: string, userId: string) {
    const sub = await prisma.notificationSubscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (!sub) throw new NotFoundError("Subscription");

    await prisma.notificationSubscription.update({
      where: { id: subscriptionId },
      data: { enabled: false },
    });
  }

  async listSubscriptions(userId: string) {
    return prisma.notificationSubscription.findMany({
      where: { userId, enabled: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}

export const notificationService = new NotificationService();
