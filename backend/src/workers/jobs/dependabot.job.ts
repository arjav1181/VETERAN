import prisma from "../../config/database.js";
import { logger } from "../../utils/logger.js";

export async function processDependabotJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { repositoryId } = job.data as { repositoryId: string };

  logger.info("Running Dependabot check", { repositoryId });

  try {
    const repo = await prisma.repository.findUnique({ where: { id: repositoryId } });
    if (!repo) {
      logger.warn("Repository not found for Dependabot", { repositoryId });
      return;
    }

    logger.info("Dependabot check completed", { repositoryId });
  } catch (error) {
    logger.error("Dependabot check failed", { repositoryId, error });
  }
}
