// @ts-nocheck
import prisma from "../../config/database.js";
import { env } from "../../config/env.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateNumericCode,
} from "../../utils/crypto.js";
import { tokenService } from "./token.service.js";
import { emailService } from "../email.service.js";
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from "../../middleware/errorHandler.js";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(2).max(39).regex(/^[a-z0-9](?:[a-z0-9]|-){0,37}[a-z0-9]$/),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export class AuthService {
  async register(data: z.infer<typeof registerSchema>, ipAddress?: string) {
    const parsed = registerSchema.parse(data);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: parsed.username },
          { email: parsed.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === parsed.username) {
        throw new ConflictError("Username already taken");
      }
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await prisma.user.create({
      data: {
        username: parsed.username,
        email: parsed.email,
        passwordHash,
      },
    });

    const verificationToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { email: parsed.email },
    });

    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.username);
    } catch {
      // Email sending is non-critical
    }

    const tokens = await tokenService.generateTokens(user.id, ipAddress);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async login(login: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: login }, { email: login }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is inactive");
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = await tokenService.generateTokens(user.id, ipAddress);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
      },
      ...tokens,
    };
  }

  async logout(sessionId?: string, userId?: string) {
    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    }
    if (userId && !sessionId) {
      await prisma.session.deleteMany({ where: { userId } });
    }
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        company: true,
        location: true,
        websiteUrl: true,
        avatarUrl: true,
        isEmailVerified: true,
        timezone: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            stars: true,
            ownedRepositories: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateProfile(userId: string, data: {
    displayName?: string;
    bio?: string;
    company?: string;
    location?: string;
    websiteUrl?: string;
    avatarUrl?: string;
    timezone?: string;
    language?: string;
    theme?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        company: true,
        location: true,
        websiteUrl: true,
        avatarUrl: true,
        timezone: true,
        language: true,
        theme: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash,
      },
    });

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch {
      // Non-critical
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { isActive: true },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400, "INVALID_TOKEN");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });
  }

  async verifyEmail(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }

  async enable2FA(userId: string) {
    const secret = generateNumericCode(32);
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
    return { secret };
  }

  async verify2FA(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) {
      throw new AppError("2FA not enabled", 400, "2FA_NOT_ENABLED");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  async disable2FA(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const authService = new AuthService();
