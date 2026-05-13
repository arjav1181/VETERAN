import { Request, Response, NextFunction } from "express";
import { verifyToken, verifyApiToken } from "../utils/crypto.js";
import prisma from "../config/database.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        isAdmin: boolean;
      };
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme.toLowerCase() === "bearer") {
      const payload = verifyToken(token);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, username: true, email: true, isAdmin: true, isActive: true },
        });
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch {
    // Token invalid, continue without user
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme.toLowerCase() === "bearer") {
      const payload = verifyToken(token);
      if (!payload) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, email: true, isAdmin: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ message: "User not found or inactive" });
        return;
      }

      req.user = user;
      next();
      return;
    }

    if (scheme.toLowerCase() === "token" || scheme.toLowerCase() === "basic") {
      const apiToken = scheme.toLowerCase() === "basic"
        ? Buffer.from(token, "base64").toString().split(":")[0]
        : token;

      const payload = verifyApiToken(apiToken);
      if (!payload) {
        res.status(401).json({ message: "Invalid API token" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true, isAdmin: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ message: "User not found or inactive" });
        return;
      }

      await prisma.apiToken.update({
        where: { id: payload.tokenId },
        data: { lastUsedAt: new Date() },
      });

      req.user = user;
      next();
      return;
    }

    res.status(401).json({ message: "Invalid authorization scheme" });
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (!req.user.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

export function requireOrgRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgSlug } = req.params;
      if (!req.user) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
      if (!org) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      const membership = await prisma.orgMember.findUnique({
        where: { organizationId_userId: { organizationId: org.id, userId: req.user.id } },
      });

      if (!membership) {
        res.status(403).json({ message: "Not a member of this organization" });
        return;
      }

      if (roles.length > 0 && !roles.includes(membership.role)) {
        res.status(403).json({ message: `Required role: ${roles.join(" or ")}` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
