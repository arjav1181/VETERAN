import { Queue, Worker, QueueEvents } from "bullmq";
import { env } from "../config/env.js";
import { getRedis } from "../config/redis.js";
import { logger } from "../utils/logger.js";
import { processWebhookJob } from "./jobs/webhook.job.js";
import { processEmailJob } from "./jobs/email.job.js";
import { processSearchIndexJob } from "./jobs/searchIndex.job.js";
import { processCiRunnerJob } from "./jobs/ciRunner.job.js";
import { processDependabotJob } from "./jobs/dependabot.job.js";
import { processSecretScanJob } from "./jobs/secretScan.job.js";
import { processCleanupJob } from "./jobs/cleanup.job.js";
import { processStatsJob } from "./jobs/stats.job.js";

const connection = { connection: getRedis() };

export const webhookQueue = new Queue("webhook", connection);
export const emailQueue = new Queue("email", connection);
export const searchIndexQueue = new Queue("search-index", connection);
export const ciRunnerQueue = new Queue("ci-runner", connection);
export const dependabotQueue = new Queue("dependabot", connection);
export const secretScanQueue = new Queue("secret-scan", connection);
export const cleanupQueue = new Queue("cleanup", connection);
export const statsQueue = new Queue("stats", connection);

const workers: Worker[] = [];

function createWorker(queueName: string, processor: (job: { data: Record<string, unknown> }) => Promise<void>): Worker {
  const worker = new Worker(queueName, async (job) => {
    try {
      await processor(job);
    } catch (error) {
      logger.error(`Worker ${queueName} failed`, { jobId: job.id, error });
      throw error;
    }
  }, { ...connection, concurrency: 5 });

  worker.on("completed", (job) => {
    logger.info(`Worker ${queueName} completed`, { jobId: job.id });
  });

  worker.on("failed", (job, error) => {
    logger.error(`Worker ${queueName} failed`, { jobId: job?.id, error: error.message });
  });

  workers.push(worker);
  return worker;
}

export async function startQueueWorkers(): Promise<void> {
  try {
    createWorker("webhook", processWebhookJob);
    createWorker("email", processEmailJob);
    createWorker("search-index", processSearchIndexJob);
    createWorker("ci-runner", processCiRunnerJob);
    createWorker("dependabot", processDependabotJob);
    createWorker("secret-scan", processSecretScanJob);
    createWorker("cleanup", processCleanupJob);
    createWorker("stats", processStatsJob);

    logger.info("Queue workers started");
  } catch (error) {
    logger.error("Failed to start queue workers", { error });
  }
}

export function stopQueueWorkers(): void {
  for (const worker of workers) {
    worker.close();
  }
  logger.info("Queue workers stopped");
}

export async function addJob(queue: Queue, name: string, data: Record<string, unknown>): Promise<void> {
  await queue.add(name, data);
}

export { Queue };
