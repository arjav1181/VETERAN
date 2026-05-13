// @ts-nocheck
import prisma from "../config/database.js";
import { generateFingerprint } from "../utils/crypto.js";
import { logger } from "../utils/logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authenticateKey(ctx: any): Promise<void> {
  try {
    const username = ctx.username as string;
    const key = ctx.key as { getPublicPEM: () => string } | undefined;

    if (username === "git" && key && typeof key.getPublicPEM === "function") {
      const keyPem = key.getPublicPEM();
      const fingerprint = generateFingerprint(keyPem);

      const sshKey = await prisma.sshKey.findFirst({
        where: { fingerprint },
        include: { user: true },
      });

      if (sshKey && sshKey.user.isActive) {
        await prisma.sshKey.update({
          where: { id: sshKey.id },
          data: { lastUsedAt: new Date() },
        });

        ctx.accept();
        logger.info("SSH authentication successful via public key", {
          username: sshKey.user.username,
          fingerprint,
        });
        return;
      }
    }

    ctx.reject(["publickey"]);
    logger.warn("SSH authentication failed", { username });
  } catch (error) {
    logger.error("SSH authentication error", { error });
    ctx.reject(["publickey"]);
  }
}
