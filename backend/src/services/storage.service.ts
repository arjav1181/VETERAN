import { existsSync, mkdirSync, createReadStream, createWriteStream, unlinkSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { MAX_UPLOAD_SIZE } from "../config/constants.js";

export class StorageService {
  private storageDir: string;
  private avatarDir: string;
  private uploadDir: string;
  private assetDir: string;

  constructor() {
    this.storageDir = resolve(env.STORAGE_DIR);
    this.avatarDir = join(this.storageDir, "avatars");
    this.uploadDir = join(this.storageDir, "uploads");
    this.assetDir = join(this.storageDir, "assets");

    for (const dir of [this.storageDir, this.avatarDir, this.uploadDir, this.assetDir]) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  async saveAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const ext = this.mimeToExt(mimeType);
    const filename = `${userId}${ext}`;
    const filePath = join(this.avatarDir, filename);

    writeFileSync(filePath, buffer);
    return `/avatars/${filename}`;
  }

  async getAvatar(filename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const filePath = join(this.avatarDir, filename);
    if (!existsSync(filePath)) return null;

    const ext = extname(filename).toLowerCase();
    return {
      buffer: readFileSync(filePath),
      mimeType: this.extToMime(ext),
    };
  }

  async saveUpload(buffer: Buffer, originalName: string, mimeType: string): Promise<{
    url: string;
    path: string;
    size: number;
  }> {
    if (buffer.length > MAX_UPLOAD_SIZE) {
      throw new AppError("File too large", 413, "FILE_TOO_LARGE");
    }

    const ext = extname(originalName);
    const id = randomUUID();
    const filename = `${id}${ext}`;
    const filePath = join(this.uploadDir, filename);

    writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      path: filePath,
      size: buffer.length,
    };
  }

  async getUpload(filename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const filePath = join(this.uploadDir, filename);
    if (!existsSync(filePath)) return null;

    const ext = extname(filename).toLowerCase();
    return {
      buffer: readFileSync(filePath),
      mimeType: this.extToMime(ext),
    };
  }

  async saveAsset(releaseId: string, filename: string, buffer: Buffer, mimeType: string): Promise<{
    downloadUrl: string;
    path: string;
    size: number;
  }> {
    const releaseDir = join(this.assetDir, releaseId);
    if (!existsSync(releaseDir)) {
      mkdirSync(releaseDir, { recursive: true });
    }

    const filePath = join(releaseDir, filename);
    writeFileSync(filePath, buffer);

    return {
      downloadUrl: `/releases/${releaseId}/assets/${filename}`,
      path: filePath,
      size: buffer.length,
    };
  }

  async getAsset(releaseId: string, filename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const filePath = join(this.assetDir, releaseId, filename);
    if (!existsSync(filePath)) return null;

    const ext = extname(filename).toLowerCase();
    return {
      buffer: readFileSync(filePath),
      mimeType: this.extToMime(ext),
    };
  }

  async deleteAsset(releaseId: string, filename: string): Promise<void> {
    const filePath = join(this.assetDir, releaseId, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  async deleteReleaseAssets(releaseId: string): Promise<void> {
    const releaseDir = join(this.assetDir, releaseId);
    if (existsSync(releaseDir)) {
      rmSync(releaseDir, { recursive: true, force: true });
    }
  }

  async saveCiArtifact(jobId: string, name: string, buffer: Buffer): Promise<{
    path: string;
    size: number;
  }> {
    const artifactDir = join(this.assetDir, "ci", jobId);
    if (!existsSync(artifactDir)) {
      mkdirSync(artifactDir, { recursive: true });
    }

    const filePath = join(artifactDir, name);
    writeFileSync(filePath, buffer);

    return { path: filePath, size: buffer.length };
  }

  async getCiArtifact(jobId: string, name: string): Promise<Buffer | null> {
    const filePath = join(this.assetDir, "ci", jobId, name);
    if (!existsSync(filePath)) return null;
    return readFileSync(filePath);
  }

  async deleteCiArtifacts(jobId: string): Promise<void> {
    const artifactDir = join(this.assetDir, "ci", jobId);
    if (existsSync(artifactDir)) {
      rmSync(artifactDir, { recursive: true, force: true });
    }
  }

  createReadStream(type: "avatar" | "upload" | "asset", ...paths: string[]): NodeJS.ReadableStream {
    const baseDir = type === "avatar" ? this.avatarDir : type === "upload" ? this.uploadDir : this.assetDir;
    const filePath = join(baseDir, ...paths);
    if (!existsSync(filePath)) throw new AppError("File not found", 404, "NOT_FOUND");
    return createReadStream(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  getStorageStats(): { totalSize: number; fileCount: number } {
    let totalSize = 0;
    let fileCount = 0;

    const walkDir = (dir: string) => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    };

    walkDir(this.storageDir);
    return { totalSize, fileCount };
  }

  private mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "image/x-icon": ".ico",
    };
    return map[mimeType] || ".bin";
  }

  private extToMime(ext: string): string {
    const map: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".zip": "application/zip",
      ".gz": "application/gzip",
      ".tar": "application/x-tar",
      ".pdf": "application/pdf",
    };
    return map[ext] || "application/octet-stream";
  }
}

export const storageService = new StorageService();
