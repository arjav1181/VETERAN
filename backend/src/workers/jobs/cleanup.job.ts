import prisma from "../../config/database.js";
import { storageService } from "../../services/storage.service.js";
import { logger } from "../../utils/logger.js";

export async function processCleanupJob(_job: { data: Record<string, unknown> }): Promise<void> {
  logger.info("Running cleanup job");

  try {
    const expiredSessions = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.info("Cleaned expired sessions", { count: expiredSessions.count });

    const expiredApiTokens = await prisma.apiToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.info("Cleaned expired API tokens", { count: expiredApiTokens.count });

    const oldNotifications = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    });
    logger.info("Cleaned old notifications", { count: oldNotifications.count });

    const expiredArtifacts = await prisma.ciArtifact.findMany({
      where: { expiresAt: { lt: new Date() } },
    });

    for (const artifact of expiredArtifacts) {
      await storageService.deleteFile(artifact.path);
    }

    const { count: deletedArtifacts } = await prisma.ciArtifact.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.info("Cleaned expired CI artifacts", { count: deletedArtifacts });

    logger.info("Cleanup job completed");
  } catch (error) {
    logger.error("Cleanup job failed", { error });
  }
}
