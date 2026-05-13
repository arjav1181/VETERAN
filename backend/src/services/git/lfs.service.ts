import { existsSync, mkdirSync, readFileSync, writeFileSync, createReadStream, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import prisma from "../../config/database.js";
import { AppError, NotFoundError } from "../../middleware/errorHandler.js";
import { LFS_BATCH_SIZE, LFS_MAX_FILE_SIZE } from "../../config/constants.js";

interface LfsBatchRequest {
  operation: "upload" | "download" | "verify";
  transfers: string[];
  ref?: { name: string };
  objects: Array<{ oid: string; size: number }>;
}

interface LfsBatchResponse {
  transfer: string;
  objects: Array<{
    oid: string;
    size: number;
    actions?: Record<string, { href: string; header?: Record<string, string>; expiresAt?: string }>;
    error?: { code: number; message: string };
  }>;
}

export class LfsService {
  private storageDir: string;

  constructor() {
    this.storageDir = resolve(join(env.STORAGE_DIR, "lfs"));
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  getObjectPath(oid: string): string {
    return join(this.storageDir, oid.slice(0, 2), oid.slice(2, 4), oid);
  }

  objectExists(oid: string): boolean {
    return existsSync(this.getObjectPath(oid));
  }

  async uploadObject(oid: string, buffer: Buffer): Promise<void> {
    const objectPath = this.getObjectPath(oid);
    const dir = join(this.storageDir, oid.slice(0, 2), oid.slice(2, 4));

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(objectPath, buffer);
  }

  getObjectStream(oid: string): NodeJS.ReadableStream {
    const objectPath = this.getObjectPath(oid);
    if (!existsSync(objectPath)) {
      throw new NotFoundError("LFS object");
    }
    return createReadStream(objectPath);
  }

  getObjectSize(oid: string): number {
    const objectPath = this.getObjectPath(oid);
    if (!existsSync(objectPath)) return 0;
    const stat = require("node:fs").statSync(objectPath);
    return stat.size;
  }

  async handleBatch(
    repositoryId: string,
    request: LfsBatchRequest
  ): Promise<LfsBatchResponse> {
    const transfer = request.transfers.includes("basic") ? "basic" : "basic";

    const baseUrl = `${env.NODE_ENV === "development" ? "http" : "https"}://${env.HOST}:${env.PORT}/api/v1/lfs/${repositoryId}`;
    const objects = [];

    for (const obj of request.objects.slice(0, LFS_BATCH_SIZE)) {
      const exists = this.objectExists(obj.oid);

      if (request.operation === "upload") {
        if (obj.size > LFS_MAX_FILE_SIZE) {
          objects.push({
            oid: obj.oid,
            size: obj.size,
            error: { code: 413, message: "Object too large" },
          });
          continue;
        }

        objects.push({
          oid: obj.oid,
          size: obj.size,
          actions: {
            upload: {
              href: `${baseUrl}/objects/${obj.oid}`,
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            },
            ...(exists ? {} : {
              verify: {
                href: `${baseUrl}/verify`,
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
              },
            }),
          },
        });
      } else if (request.operation === "download") {
        if (!exists) {
          objects.push({
            oid: obj.oid,
            size: obj.size,
            error: { code: 404, message: "Object not found" },
          });
          continue;
        }

        objects.push({
          oid: obj.oid,
          size: obj.size,
          actions: {
            download: {
              href: `${baseUrl}/objects/${obj.oid}`,
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            },
          },
        });
      } else {
        objects.push({
          oid: obj.oid,
          size: obj.size,
          error: { code: 501, message: "Operation not supported" },
        });
      }
    }

    return { transfer, objects };
  }

  async lockFile(repositoryId: string, path: string, userId: string): Promise<Record<string, unknown>> {
    const existingLock = await prisma.lfsLock.findUnique({
      where: { repositoryId_path: { repositoryId, path } },
    });

    if (existingLock) {
      throw new AppError("File is already locked", 409, "LOCK_EXISTS");
    }

    const lock = await prisma.lfsLock.create({
      data: {
        repositoryId,
        path,
        lockedBy: { connect: { id: userId } },
      },
    });

    return {
      id: lock.id,
      path: lock.path,
      lockedAt: lock.createdAt.toISOString(),
      owner: { id: userId },
    };
  }

  async unlockFile(lockId: string, userId: string, force: boolean = false): Promise<void> {
    const lock = await prisma.lfsLock.findUnique({ where: { id: lockId } });
    if (!lock) {
      throw new NotFoundError("Lock");
    }

    if (!force && lock.ownerId !== userId) {
      throw new AppError("Lock not owned by you", 403, "NOT_LOCK_OWNER");
    }

    await prisma.lfsLock.delete({ where: { id: lockId } });
  }

  async listLocks(repositoryId: string, path?: string): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { repositoryId };
    if (path) where.path = path;

    const locks = await prisma.lfsLock.findMany({
      where,
      include: { lockedBy: { select: { id: true, username: true } } },
    });

    return locks.map(l => ({
      id: l.id,
      path: l.path,
      lockedAt: l.createdAt.toISOString(),
      owner: l.lockedBy,
    }));
  }
}

export const lfsService = new LfsService();
