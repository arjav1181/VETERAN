import prisma from "../config/database.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";
import { CODESPACE_MACHINES } from "../config/constants.js";
import { getRedis } from "../config/redis.js";

export class CodespaceService {
  async create(data: {
    userId: string;
    repositoryId?: string;
    branch?: string;
    machineType?: string;
    location?: string;
  }) {
    const machine = CODESPACE_MACHINES.find(m => m.type === (data.machineType || "basic"));
    if (!machine) {
      throw new AppError("Invalid machine type", 400, "INVALID_MACHINE");
    }

    const count = await prisma.codespace.count({ where: { userId: data.userId, state: { notIn: ["deleted", "stopped"] } } });
    if (count >= 5) {
      throw new AppError("Maximum active codespace limit reached", 403, "CODESPACE_LIMIT");
    }

    const name = `${data.userId.slice(0, 8)}-${Math.random().toString(36).slice(2, 8)}`;

    const codespace = await prisma.codespace.create({
      data: {
        name,
        userId: data.userId,
        repositoryId: data.repositoryId,
        branch: data.branch || "main",
        machineType: data.machineType || "basic",
        location: data.location || "us-east",
        state: "created",
      },
    });

    await this.startProvisioning(codespace.id);

    return codespace;
  }

  async getById(codespaceId: string, userId: string) {
    const codespace = await prisma.codespace.findFirst({
      where: { id: codespaceId, userId },
      include: {
        ports: true,
        repository: { select: { id: true, fullName: true } },
      },
    });

    if (!codespace) throw new NotFoundError("Codespace");
    return codespace;
  }

  async list(userId: string, page: number = 1, perPage: number = 30) {
    const [codespaces, total] = await Promise.all([
      prisma.codespace.findMany({
        where: { userId },
        include: {
          repository: { select: { id: true, fullName: true } },
          _count: { select: { ports: true } },
        },
        orderBy: { lastActivity: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.codespace.count({ where: { userId } }),
    ]);

    return { codespaces, total, page, perPage };
  }

  async start(codespaceId: string, userId: string) {
    const codespace = await this.getById(codespaceId, userId);
    if (codespace.state === "running") return codespace;
    if (codespace.state === "deleted") throw new AppError("Codespace deleted", 400, "DELETED");

    await prisma.codespace.update({
      where: { id: codespaceId },
      data: { state: "starting" },
    });

    try {
      const redis = getRedis();
      await redis.publish("codespace:events", JSON.stringify({
        codespaceId,
        action: "start",
        userId,
      }));
    } catch {
      // Non-critical
    }

    return prisma.codespace.update({
      where: { id: codespaceId },
      data: { state: "running", lastActivity: new Date() },
    });
  }

  async stop(codespaceId: string, userId: string) {
    const codespace = await this.getById(codespaceId, userId);
    if (codespace.state === "stopped") return codespace;

    await prisma.codespace.update({
      where: { id: codespaceId },
      data: { state: "stopping" },
    });

    try {
      const redis = getRedis();
      await redis.publish("codespace:events", JSON.stringify({
        codespaceId,
        action: "stop",
        userId,
      }));
    } catch {
      // Non-critical
    }

    return prisma.codespace.update({
      where: { id: codespaceId },
      data: { state: "stopped", lastActivity: new Date() },
    });
  }

  async delete(codespaceId: string, userId: string) {
    const codespace = await prisma.codespace.findFirst({
      where: { id: codespaceId, userId },
    });
    if (!codespace) throw new NotFoundError("Codespace");

    await prisma.codespace.update({
      where: { id: codespaceId },
      data: { state: "deleted" },
    });

    await prisma.codespacePort.deleteMany({ where: { codespaceId } });

    try {
      const redis = getRedis();
      await redis.publish("codespace:events", JSON.stringify({
        codespaceId,
        action: "delete",
        userId,
      }));
    } catch {
      // Non-critical
    }
  }

  async addPort(codespaceId: string, userId: string, port: number, visibility: string = "private", label?: string) {
    await this.getById(codespaceId, userId);

    const existing = await prisma.codespacePort.findFirst({
      where: { codespaceId, port },
    });
    if (existing) throw new AppError("Port already forwarded", 409, "PORT_EXISTS");

    return prisma.codespacePort.create({
      data: { codespaceId, port, visibility, label },
    });
  }

  async removePort(portId: string, userId: string) {
    const port = await prisma.codespacePort.findFirst({
      where: { id: portId },
      include: { codespace: true },
    });
    if (!port || port.codespace.userId !== userId) {
      throw new NotFoundError("Port");
    }

    await prisma.codespacePort.delete({ where: { id: portId } });
  }

  async updatePortVisibility(portId: string, userId: string, visibility: string) {
    const port = await prisma.codespacePort.findFirst({
      where: { id: portId },
      include: { codespace: true },
    });
    if (!port || port.codespace.userId !== userId) {
      throw new NotFoundError("Port");
    }

    return prisma.codespacePort.update({
      where: { id: portId },
      data: { visibility },
    });
  }

  async updateLastActivity(codespaceId: string) {
    await prisma.codespace.update({
      where: { id: codespaceId },
      data: { lastActivity: new Date() },
    });
  }

  private async startProvisioning(codespaceId: string): Promise<void> {
    const redis = getRedis();
    await redis.lpush("codespace:provision", JSON.stringify({ codespaceId }));

    setTimeout(async () => {
      try {
        await prisma.codespace.update({
          where: { id: codespaceId },
          data: { state: "running", url: `https://${codespaceId}.veteran.dev` },
        });
      } catch {
        // Provisioning timed out
      }
    }, 30000);
  }
}

export const codespaceService = new CodespaceService();
