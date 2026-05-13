import prisma from "../../config/database.js";
import { logger } from "../../utils/logger.js";

export async function processSearchIndexJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { entityType, entityId } = job.data as { entityType: string; entityId: string };

  logger.info("Indexing search entity", { entityType, entityId });

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE repositories SET updated_at = NOW() WHERE id = $1`,
      [entityId]
    );
  } catch (error) {
    logger.error("Search indexing failed", { entityType, entityId, error });
  }
}
