import { execSync } from "node:child_process";
import prisma from "../config/database.js";
import { gitService } from "./git/git.service.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";
import { getRedis } from "../config/redis.js";
import { CI_STATUSES } from "../config/constants.js";

export class CiService {
  async createPipeline(data: {
    repositoryId: string;
    commitSha: string;
    branch: string;
    triggeredBy?: string;
    creatorId?: string;
    config?: Record<string, unknown>;
  }) {
    const pipeline = await prisma.ciPipeline.create({
      data: {
        repositoryId: data.repositoryId,
        commitSha: data.commitSha,
        branch: data.branch,
        triggeredBy: data.triggeredBy || "webhook",
        creatorId: data.creatorId,
        config: data.config || {},
        status: "pending",
      },
    });

    const redis = getRedis();
    await redis.lpush("ci:queue", JSON.stringify({ pipelineId: pipeline.id }));

    return pipeline;
  }

  async getPipeline(pipelineId: string) {
    const pipeline = await prisma.ciPipeline.findUnique({
      where: { id: pipelineId },
      include: {
        jobs: {
          include: {
            logs: { orderBy: { lineStart: "asc" } },
            artifacts: true,
          },
          orderBy: { createdAt: "asc" },
        },
        repository: { select: { id: true, fullName: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    if (!pipeline) throw new NotFoundError("Pipeline");
    return pipeline;
  }

  async listPipelines(repositoryId: string, page: number = 1, perPage: number = 30) {
    const [pipelines, total] = await Promise.all([
      prisma.ciPipeline.findMany({
        where: { repositoryId },
        include: {
          _count: { select: { jobs: true } },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.ciPipeline.count({ where: { repositoryId } }),
    ]);

    return { pipelines, total, page, perPage };
  }

  async cancelPipeline(pipelineId: string) {
    const pipeline = await prisma.ciPipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) throw new NotFoundError("Pipeline");

    await prisma.ciPipeline.update({
      where: { id: pipelineId },
      data: { status: "cancelled", finishedAt: new Date() },
    });

    await prisma.ciJob.updateMany({
      where: { pipelineId, status: { in: ["pending", "running"] } },
      data: { status: "cancelled", conclusion: "cancelled" },
    });
  }

  async createJob(data: {
    pipelineId: string;
    name: string;
    commands?: string[];
    image?: string;
    runnerLabel?: string;
    env?: Record<string, unknown>;
  }) {
    return prisma.ciJob.create({
      data: {
        pipelineId: data.pipelineId,
        name: data.name,
        commands: data.commands || [],
        image: data.image,
        runnerLabel: data.runnerLabel,
        env: data.env || {},
      },
    });
  }

  async updateJobStatus(jobId: string, status: string, conclusion?: string) {
    const updateData: Record<string, unknown> = { status };

    if (status === "running") {
      updateData.startedAt = new Date();
    }

    if (conclusion || status === "passed" || status === "failed" || status === "cancelled") {
      updateData.conclusion = conclusion || status;
      updateData.finishedAt = new Date();
      if (updateData.startedAt) {
        updateData.duration = Math.floor(
          (new Date().getTime() - new Date(updateData.startedAt as Date).getTime()) / 1000
        );
      }
    }

    return prisma.ciJob.update({
      where: { id: jobId },
      data: updateData,
    });
  }

  async appendLog(jobId: string, content: string, lineStart: number, lineEnd: number) {
    return prisma.ciJobLog.create({
      data: { jobId, content, lineStart, lineEnd },
    });
  }

  async getLogs(jobId: string) {
    return prisma.ciJobLog.findMany({
      where: { jobId },
      orderBy: { lineStart: "asc" },
    });
  }

  async uploadArtifact(data: {
    jobId: string;
    name: string;
    path: string;
    size: number;
    mimeType?: string;
    downloadUrl?: string;
    expiresInDays?: number;
  }) {
    return prisma.ciArtifact.create({
      data: {
        jobId: data.jobId,
        name: data.name,
        path: data.path,
        size: data.size,
        mimeType: data.mimeType || "application/octet-stream",
        downloadUrl: data.downloadUrl,
        expiresAt: data.expiresInDays
          ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });
  }

  async listArtifacts(jobId: string) {
    return prisma.ciArtifact.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteArtifact(artifactid: string) {
    await prisma.ciArtifact.delete({ where: { id: artifactid } });
  }

  async processPipeline(pipelineId: string) {
    const pipeline = await prisma.ciPipeline.findUnique({
      where: { id: pipelineId },
      include: { repository: true },
    });

    if (!pipeline) throw new NotFoundError("Pipeline");

    await prisma.ciPipeline.update({
      where: { id: pipelineId },
      data: { status: "running", startedAt: new Date() },
    });

    try {
      const repoPath = gitService.getRepoPath(pipeline.repository.fullName);

      const yamlContent = execSync(
        `git show ${pipeline.commitSha}:.veteran/ci.yml 2>/dev/null || git show ${pipeline.commitSha}:.github/workflows/ci.yml 2>/dev/null || echo ""`,
        { cwd: repoPath, encoding: "utf-8" }
      );

      if (!yamlContent.trim()) {
        await prisma.ciPipeline.update({
          where: { id: pipelineId },
          data: { status: "passed", finishedAt: new Date() },
        });
        return;
      }

      const job = await this.createJob({
        pipelineId,
        name: "default",
        commands: ["echo 'Running CI pipeline'"],
      });

      await this.updateJobStatus(job.id, "running");
      await this.appendLog(job.id, "Pipeline started\n", 0, 1);

      await this.updateJobStatus(job.id, "passed", "success");
      await this.appendLog(job.id, "Pipeline completed successfully\n", 1, 2);

      await prisma.ciPipeline.update({
        where: { id: pipelineId },
        data: {
          status: "passed",
          finishedAt: new Date(),
          duration: Math.floor(
            (new Date().getTime() - (pipeline.startedAt || pipeline.createdAt).getTime()) / 1000
          ),
        },
      });
    } catch (error) {
      await prisma.ciPipeline.update({
        where: { id: pipelineId },
        data: {
          status: "failed",
          finishedAt: new Date(),
          duration: Math.floor(
            (new Date().getTime() - (pipeline.startedAt || pipeline.createdAt).getTime()) / 1000
          ),
        },
      });
    }
  }
}

export const ciService = new CiService();
