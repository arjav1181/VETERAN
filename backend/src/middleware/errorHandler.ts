import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger.js";

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT");
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err.constructor.name === "PrismaClientKnownRequestError") {
    if ((err as { code?: string }).code === "P2002") {
      res.status(409).json({
        message: "Resource already exists",
        code: "CONFLICT",
      });
      return;
    }
    if ((err as { code?: string }).code === "P2025") {
      res.status(404).json({
        message: "Resource not found",
        code: "NOT_FOUND",
      });
      return;
    }
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      message: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }

  logger.error({ err, message: err.message }, "Unhandled error");

  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
