import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    const logFn = logger[level] as (msg: string, ...args: unknown[]) => void;
    logFn(`${method} ${url} ${statusCode} ${duration}ms`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.headers["user-agent"],
      userId: (req as unknown as Record<string, unknown>).user ? ((req as unknown as Record<string, unknown>).user as Record<string, unknown>).id : undefined,
    });
  });

  next();
}
