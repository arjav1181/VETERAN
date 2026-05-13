// @ts-nocheck
import crypto from "node:crypto";
import prisma from "../config/database.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";
import { signWebhookPayload, generateWebhookSecret } from "../utils/crypto.js";
import { WEBHOOK_EVENTS } from "../config/constants.js";
import { getRedis } from "../config/redis.js";

export class WebhookService {
  async create(data: {
    repositoryId?: string;
    organizationId?: string;
    userId?: string;
    url: string;
    contentType?: string;
    secret?: string;
    events: string[];
    sslVerify?: boolean;
  }) {
    for (const event of data.events) {
      if (!WEBHOOK_EVENTS.includes(event as typeof WEBHOOK_EVENTS[number])) {
        throw new AppError(`Invalid webhook event: ${event}`, 400, "INVALID_EVENT");
      }
    }

    const secret = data.secret || generateWebhookSecret();

    return prisma.webhook.create({
      data: {
        repositoryId: data.repositoryId,
        organizationId: data.organizationId,
        userId: data.userId,
        url: data.url,
        contentType: data.contentType || "json",
        secret,
        events: data.events,
        sslVerify: data.sslVerify ?? true,
      },
    });
  }

  async update(webhookId: string, data: {
    url?: string;
    contentType?: string;
    secret?: string;
    events?: string[];
    isActive?: boolean;
    sslVerify?: boolean;
  }) {
    return prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  }

  async delete(webhookId: string) {
    await prisma.webhook.delete({ where: { id: webhookId } });
  }

  async getById(webhookId: string) {
    const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook) throw new NotFoundError("Webhook");
    return webhook;
  }

  async listForRepo(repositoryId: string) {
    return prisma.webhook.findMany({
      where: { repositoryId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listForOrg(organizationId: string) {
    return prisma.webhook.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async deliver(webhookId: string, event: string, payload: Record<string, unknown>) {
    const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook || !webhook.isActive) return;

    const payloadStr = JSON.stringify(payload);
    const signature = signWebhookPayload(payloadStr, webhook.secret || "");

    const headers: Record<string, string> = {
      "Content-Type": webhook.contentType === "json" ? "application/json" : "application/x-www-form-urlencoded",
      "User-Agent": "VETERAN-Webhook/1.0",
      "X-VETERAN-Event": event,
      "X-VETERAN-Delivery": crypto.randomUUID(),
      "X-VETERAN-Hook-ID": webhookId,
      "X-Hub-Signature-256": `sha256=${signature}`,
      "X-VETERAN-Signature": signature,
    };

    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: payload as Record<string, unknown>,
        status: "pending",
      },
    });

    const redis = getRedis();
    await redis.lpush("webhook:queue", JSON.stringify({
      deliveryId: delivery.id,
      url: webhook.url,
      payload: payloadStr,
      headers,
      sslVerify: webhook.sslVerify,
      webhookId,
      event,
    }));
  }

  async deliverToRepo(repositoryId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await this.listForRepo(repositoryId);
    for (const webhook of webhooks) {
      if (webhook.events.includes(event) || webhook.events.includes("*")) {
        await this.deliver(webhook.id, event, payload);
      }
    }
  }

  async deliverToOrg(organizationId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await this.listForOrg(organizationId);
    for (const webhook of webhooks) {
      if (webhook.events.includes(event) || webhook.events.includes("*")) {
        await this.deliver(webhook.id, event, payload);
      }
    }
  }

  async ping(webhookId: string) {
    await this.deliver(webhookId, "ping", {
      zen: "Keep it simple.",
      hook_id: webhookId,
      hook: await this.getById(webhookId),
    });
  }

  async listDeliveries(webhookId: string, page: number = 1, perPage: number = 30) {
    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: { webhookId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.webhookDelivery.count({ where: { webhookId } }),
    ]);

    return { deliveries, total, page, perPage };
  }

  async getDelivery(deliveryId: string) {
    const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundError("Delivery");
    return delivery;
  }

  async retryDelivery(deliveryId: string) {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });
    if (!delivery) throw new NotFoundError("Delivery");

    await this.deliver(delivery.webhookId, delivery.event, delivery.payload as Record<string, unknown>);
  }

  async processDelivery(deliveryId: string, url: string, payload: string, headers: Record<string, string>, sslVerify: boolean): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseBody = await response.text();

      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: response.ok ? "success" : "failed",
          responseCode: response.status,
          responseBody,
          attempts: { increment: 1 },
        },
      });

      if (response.ok) {
        await prisma.webhook.update({
          where: { id: (await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } }))?.webhookId },
          data: { lastDelivery: new Date() },
        });
      }
    } catch (error) {
      const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
      const attempts = (delivery?.attempts || 0) + 1;

      const nextAttempt = attempts < 5
        ? new Date(Date.now() + Math.pow(2, attempts) * 60000)
        : null;

      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: attempts >= 5 ? "failed" : "pending",
          responseBody: error instanceof Error ? error.message : "Delivery failed",
          attempts,
          nextAttempt,
        },
      });
    }
  }

  async retryFailedDeliveries() {
    const failedDeliveries = await prisma.webhookDelivery.findMany({
      where: {
        status: "pending",
        nextAttempt: { lte: new Date() },
        attempts: { lt: 5 },
      },
      include: { webhook: true },
    });

    for (const delivery of failedDeliveries) {
      const payloadStr = JSON.stringify(delivery.payload);
      const signature = signWebhookPayload(payloadStr, delivery.webhook.secret || "");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "VETERAN-Webhook/1.0",
        "X-VETERAN-Event": delivery.event,
        "X-VETERAN-Delivery": delivery.id,
        "X-VETERAN-Hook-ID": delivery.webhookId,
        "X-VETERAN-Signature": signature,
      };

      const redis = getRedis();
      await redis.lpush("webhook:queue", JSON.stringify({
        deliveryId: delivery.id,
        url: delivery.webhook.url,
        payload: payloadStr,
        headers,
        sslVerify: delivery.webhook.sslVerify,
        webhookId: delivery.webhookId,
        event: delivery.event,
      }));
    }
  }
}

export const webhookService = new WebhookService();
