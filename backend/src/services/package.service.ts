import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import prisma from "../config/database.js";
import { env } from "../config/env.js";
import { AppError, NotFoundError, ConflictError } from "../middleware/errorHandler.js";
import { PACKAGE_TYPES } from "../config/constants.js";
import { parseSemver, satisfies } from "../utils/semver.js";

export class PackageService {
  private packagesDir: string;

  constructor() {
    this.packagesDir = resolve(join(env.STORAGE_DIR, "packages"));
    if (!existsSync(this.packagesDir)) {
      mkdirSync(this.packagesDir, { recursive: true });
    }
  }

  async createPackage(data: {
    repositoryId?: string;
    organizationId?: string;
    ownerId?: string;
    name: string;
    type: string;
    visibility?: string;
    description?: string;
  }) {
    if (!PACKAGE_TYPES.includes(data.type as typeof PACKAGE_TYPES[number])) {
      throw new AppError(`Invalid package type: ${data.type}`, 400, "INVALID_TYPE");
    }

    const existing = await prisma.package.findFirst({
      where: { name: data.name, type: data.type },
    });

    if (existing) throw new ConflictError("Package already exists");

    return prisma.package.create({ data });
  }

  async getPackage(packageId: string) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        repository: { select: { id: true, fullName: true } },
        owner: { select: { id: true, username: true } },
      },
    });

    if (!pkg) throw new NotFoundError("Package");
    return pkg;
  }

  async listPackages(filters: {
    repositoryId?: string;
    organizationId?: string;
    ownerId?: string;
    type?: string;
    visibility?: string;
    page?: number;
    perPage?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.repositoryId) where.repositoryId = filters.repositoryId;
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.type) where.type = filters.type;
    if (filters.visibility) where.visibility = filters.visibility;

    const page = filters.page || 1;
    const perPage = filters.perPage || 30;

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        include: {
          _count: { select: { versions: true } },
          versions: {
            where: { isLatest: true },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.package.count({ where }),
    ]);

    return { packages, total, page, perPage };
  }

  async publishVersion(data: {
    packageId: string;
    version: string;
    metadata?: Record<string, unknown>;
    fileBuffer?: Buffer;
    userId?: string;
  }) {
    const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg) throw new NotFoundError("Package");

    const existing = await prisma.packageVersion.findUnique({
      where: { packageId_version: { packageId: data.packageId, version: data.version } },
    });
    if (existing) throw new ConflictError("Version already exists");

    const semver = parseSemver(data.version);
    if (!semver) throw new AppError("Invalid semver version", 400, "INVALID_VERSION");

    let fileUrl: string | undefined;
    let sha256: string | undefined;
    let size = 0;

    if (data.fileBuffer) {
      const versionDir = join(this.packagesDir, pkg.name, data.version);
      if (!existsSync(versionDir)) {
        mkdirSync(versionDir, { recursive: true });
      }

      let ext: string;
      switch (pkg.type) {
        case "npm": ext = "tgz"; break;
        case "docker": ext = "tar"; break;
        default: ext = "tar.gz";
      }

      const filename = `${pkg.name}-${data.version}.${ext}`;
      const filePath = join(versionDir, filename);
      writeFileSync(filePath, data.fileBuffer);

      const crypto = await import("node:crypto");
      sha256 = crypto.createHash("sha256").update(data.fileBuffer).digest("hex");
      size = data.fileBuffer.length;
      fileUrl = `/packages/${pkg.name}/versions/${data.version}/${filename}`;
    }

    await prisma.packageVersion.updateMany({
      where: { packageId: data.packageId },
      data: { isLatest: false },
    });

    const version = await prisma.packageVersion.create({
      data: {
        packageId: data.packageId,
        version: data.version,
        metadata: data.metadata || {},
        fileUrl,
        sha256,
        size,
        isLatest: true,
      },
    });

    await prisma.package.update({
      where: { id: data.packageId },
      data: { updatedAt: new Date() },
    });

    return version;
  }

  async getVersion(packageId: string, version: string) {
    const ver = await prisma.packageVersion.findUnique({
      where: { packageId_version: { packageId, version } },
      include: {
        package: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    if (!ver) throw new NotFoundError("Version");
    return ver;
  }

  async listVersions(packageId: string, page: number = 1, perPage: number = 30) {
    const [versions, total] = await Promise.all([
      prisma.packageVersion.findMany({
        where: { packageId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.packageVersion.count({ where: { packageId } }),
    ]);

    return { versions, total, page, perPage };
  }

  async deleteVersion(versionId: string) {
    await prisma.packageVersion.delete({ where: { id: versionId } });
  }

  async deletePackage(packageId: string) {
    await prisma.packageVersion.deleteMany({ where: { packageId } });
    await prisma.package.delete({ where: { id: packageId } });

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (pkg) {
      const pkgDir = join(this.packagesDir, pkg.name);
      if (existsSync(pkgDir)) {
        await import("node:fs/promises").then(fs => fs.rm(pkgDir, { recursive: true, force: true }));
      }
    }
  }

  async downloadVersion(versionId: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const version = await prisma.packageVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundError("Version");

    await prisma.packageDownload.create({
      data: {
        versionId,
        userId,
        ipAddress,
        userAgent,
      },
    });

    await prisma.package.update({
      where: { id: version.packageId },
      data: { downloadCount: { increment: 1 } },
    });

    if (version.fileUrl && version.fileUrl.startsWith("/packages/")) {
      const filePath = join(this.packagesDir, version.fileUrl.replace("/packages/", ""));
      if (existsSync(filePath)) {
        return readFileSync(filePath);
      }
    }

    return null;
  }

  async getNpmPackage(name: string) {
    const pkg = await prisma.package.findFirst({
      where: { name, type: "npm" },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pkg) throw new NotFoundError("Package");

    const distTags: Record<string, string> = {};
    const versions: Record<string, unknown> = {};

    for (const ver of pkg.versions) {
      versions[ver.version] = {
        name: pkg.name,
        version: ver.version,
        ...(ver.metadata as Record<string, unknown>),
        dist: ver.fileUrl ? {
          tarball: ver.fileUrl,
          shasum: ver.sha256,
          size: ver.size,
        } : undefined,
      };
      if (ver.isLatest) {
        distTags.latest = ver.version;
      }
    }

    return {
      name: pkg.name,
      "dist-tags": distTags,
      versions,
      description: pkg.description,
    };
  }

  async getDockerPackage(name: string) {
    return { name, type: "docker" };
  }
}

export const packageService = new PackageService();
