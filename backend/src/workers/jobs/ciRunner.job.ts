import { ciService } from "../../services/ci.service.js";
import { logger } from "../../utils/logger.js";

export async function processCiRunnerJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { pipelineId } = job.data as { pipelineId: string };

  logger.info("Running CI pipeline", { pipelineId });

  try {
    await ciService.processPipeline(pipelineId);
    logger.info("CI pipeline completed", { pipelineId });
  } catch (error) {
    logger.error("CI pipeline failed", { pipelineId, error });
    throw error;
  }
}
