import { webhookService } from "../../services/webhook.service.js";
import { logger } from "../../utils/logger.js";

export async function processWebhookJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { deliveryId, url, payload, headers, sslVerify } = job.data as {
    deliveryId: string;
    url: string;
    payload: string;
    headers: Record<string, string>;
    sslVerify: boolean;
  };

  logger.info("Processing webhook delivery", { deliveryId, url });

  await webhookService.processDelivery(deliveryId, url, payload, headers, sslVerify);
}
