// @ts-nocheck
import prisma from "../../config/database.js";
import { env } from "../../config/env.js";
import {
  signAccessToken,
  signRefreshToken,
  signApiToken,
  verifyToken,
  generateToken,
  generateFingerprint,
} from "../../utils/crypto.js";
import { AppError } from "../../middleware/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export class TokenService {
  async generateTokens(userId: string, ipAddress?: string, userAgent?: string) {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);

    const session = await prisma.session.create({
      data: {
        userId,
        token: refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresIn: 900,
    };
  }

  async refreshAccessToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      throw new AppError("Invalid refresh token", 401, "INVALID_TOKEN");
    }

    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError("Session expired", 401, "SESSION_EXPIRED");
    }

    if (!session.user.isActive) {
      throw new AppError("Account is inactive", 401, "ACCOUNT_INACTIVE");
    }

    const accessToken = signAccessToken(payload.sub);

    await prisma.session.update({
      where: { id: session.id },
      data: { ipAddress, userAgent },
    });

    return { accessToken, expiresIn: 900 };
  }

  async revokeSession(sessionId: string, userId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError("Session not found", 404, "NOT_FOUND");
    }

    await prisma.session.delete({ where: { id: sessionId } });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string) {
    const where: Record<string, unknown> = { userId };
    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }
    await prisma.session.deleteMany({ where });
  }

  async listSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async createApiToken(userId: string, name: string, scopes: string[], expiresInDays?: number) {
    const tokenId = uuidv4();
    const token = signApiToken(userId, tokenId);

    const apiToken = await prisma.apiToken.create({
      data: {
        userId,
        name,
        token: tokenId,
        scopes,
        expiresAt: expiresInDays
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });

    return { ...apiToken, token };
  }

  async listApiTokens(userId: string) {
    return prisma.apiToken.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        scopes: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async deleteApiToken(tokenId: string, userId: string) {
    const token = await prisma.apiToken.findFirst({
      where: { id: tokenId, userId },
    });

    if (!token) {
      throw new AppError("API token not found", 404, "NOT_FOUND");
    }

    await prisma.apiToken.delete({ where: { id: tokenId } });
  }

  async verifyApiToken(token: string) {
    const tokenHash = token;
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!apiToken || !apiToken.user.isActive) {
      return null;
    }

    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      await prisma.apiToken.delete({ where: { id: apiToken.id } });
      return null;
    }

    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() },
    });

    return apiToken;
  }
}

export const tokenService = new TokenService();
