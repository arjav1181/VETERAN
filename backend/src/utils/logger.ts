import winston from "winston";
import pino from "pino";
import { env } from "../config/env.js";

const pinoLogger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

const winstonLogger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === "development"
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json()
  ),
  defaultMeta: { service: "veteran-backend" },
  transports: [
    new winston.transports.Console(),
    ...(env.NODE_ENV === "production"
      ? [
          new winston.transports.File({ filename: "logs/error.log", level: "error" }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  message: string;
  [key: string]: unknown;
}

function log(level: LogLevel, entry: LogEntry | string, ...args: unknown[]): void {
  const message = typeof entry === "string" ? entry : entry.message;
  const meta = typeof entry === "object" ? entry : { message, args };

  pinoLogger[level](meta);
  winstonLogger[level](meta);
}

export const logger = {
  debug: (entry: LogEntry | string, ...args: unknown[]) => log("debug", entry, ...args),
  info: (entry: LogEntry | string, ...args: unknown[]) => log("info", entry, ...args),
  warn: (entry: LogEntry | string, ...args: unknown[]) => log("warn", entry, ...args),
  error: (entry: LogEntry | string, ...args: unknown[]) => log("error", entry, ...args),
};
