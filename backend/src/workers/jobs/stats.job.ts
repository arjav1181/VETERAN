import prisma from "../../config/database.js";
import { getRedis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";

export async function processStatsJob(_job: { data: Record<string, unknown> }): Promise<void> {
  logger.info("Updating site stats");

  try {
    const [userCount, repoCount, issueCount, prCount, orgCount] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.repository.count({ where: { isDisabled: false } }),
      prisma.issue.count({ where: { state: "open" } }),
      prisma.pullRequest.count({ where: { state: "open" } }),
      prisma.organization.count(),
    ]);

    const stats = { userCount, repoCount, issueCount, prCount, orgCount };
    const redis = getRedis();
    await redis.setex("site:stats", 3600, JSON.stringify(stats));

    logger.info("Site stats updated", stats);
  } catch (error) {
    logger.error("Stats update failed", { error });
  }
}
