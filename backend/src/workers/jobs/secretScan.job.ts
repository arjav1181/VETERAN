import { securityService } from "../../services/security.service.js";
import { notificationService } from "../../services/notification.service.js";
import prisma from "../../config/database.js";
import { logger } from "../../utils/logger.js";

export async function processSecretScanJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { repositoryId, ref } = job.data as { repositoryId: string; ref: string };

  logger.info("Running secret scan", { repositoryId, ref });

  try {
    const repo = await prisma.repository.findUnique({ where: { id: repositoryId } });
    if (!repo) return;

    const results = await securityService.scanRepository(repo.fullName, ref);

    if (results.length > 0) {
      if (repo.ownerId) {
        await notificationService.create({
          userId: repo.ownerId,
          type: "security_alert",
          title: `Secrets found in ${repo.fullName}`,
          body: `${results.length} potential secret(s) detected`,
          data: { results: results.slice(0, 10) },
          repoId: repo.id,
          link: `/${repo.fullName}/security/secret-scanning`,
        });
      }
    }

    logger.info("Secret scan completed", { repositoryId, findings: results.length });
  } catch (error) {
    logger.error("Secret scan failed", { repositoryId, error });
  }
}
