import { execSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { env } from "../../config/env.js";
import { gitService } from "./git.service.js";
import { AppError } from "../../middleware/errorHandler.js";
import { MAX_ARCHIVE_SIZE } from "../../config/constants.js";

export class ArchiveService {
  private tempDir: string;

  constructor() {
    this.tempDir = join(env.STORAGE_DIR, "archives");
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async createArchive(
    fullName: string,
    ref: string,
    format: "zip" | "tar" | "tar.gz" = "zip"
  ): Promise<{ path: string; size: number; contentType: string }> {
    const repoPath = gitService.getRepoPath(fullName);
    if (!existsSync(repoPath)) {
      throw new AppError("Repository not found", 404, "NOT_FOUND");
    }

    const archiveName = `${fullName.replace("/", "-")}-${ref.replace("/", "-")}`;
    const ext = format === "tar.gz" ? "tar.gz" : format;
    const outputPath = join(this.tempDir, `${archiveName}.${ext}`);

    if (existsSync(outputPath)) {
      const stats = await import("node:fs/promises").then(fs => fs.stat(outputPath));
      return {
        path: outputPath,
        size: stats.size,
        contentType: this.getContentType(format),
      };
    }

    try {
      const archiveFormat = format === "tar.gz" ? "tar.gz" : format;
      execSync(
        `git archive --format=${archiveFormat} --output="${outputPath}" "${ref}"`,
        { cwd: repoPath, stdio: "pipe" }
      );

      const stats = await import("node:fs/promises").then(fs => fs.stat(outputPath));

      if (stats.size > MAX_ARCHIVE_SIZE) {
        unlinkSync(outputPath);
        throw new AppError("Archive exceeds maximum size", 413, "ARCHIVE_TOO_LARGE");
      }

      return {
        path: outputPath,
        size: stats.size,
        contentType: this.getContentType(format),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create archive", 500, "ARCHIVE_FAILED");
    }
  }

  createArchiveStream(fullName: string, ref: string, format: "zip" | "tar" | "tar.gz" = "zip"): NodeJS.ReadableStream {
    const repoPath = gitService.getRepoPath(fullName);
    if (!existsSync(repoPath)) {
      throw new AppError("Repository not found", 404, "NOT_FOUND");
    }

    const archiveFormat = format === "tar.gz" ? "tar.gz" : format;
    const child = execSync(
      `git archive --format=${archiveFormat} "${ref}"`,
      { cwd: repoPath, encoding: "buffer", maxBuffer: MAX_ARCHIVE_SIZE }
    );

    const { Readable } = require("stream");
    const stream = new Readable();
    stream.push(child);
    stream.push(null);
    return stream;
  }

  async cleanupArchive(archivePath: string): Promise<void> {
    try {
      if (existsSync(archivePath)) {
        unlinkSync(archivePath);
      }
    } catch {
      // Non-critical cleanup
    }
  }

  async getArchiveInfo(fullName: string, ref: string, format: "zip" | "tar" | "tar.gz" = "zip"): Promise<{
    filename: string;
    contentType: string;
    format: string;
  }> {
    const ext = format === "tar.gz" ? "tar.gz" : format;
    const filename = `${fullName.replace("/", "-")}-${ref.replace("/", "-")}.${ext}`;

    return {
      filename,
      contentType: this.getContentType(format),
      format,
    };
  }

  private getContentType(format: string): string {
    switch (format) {
      case "zip":
        return "application/zip";
      case "tar":
        return "application/x-tar";
      case "tar.gz":
        return "application/gzip";
      default:
        return "application/octet-stream";
    }
  }
}

export const archiveService = new ArchiveService();
