import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

let prisma: PrismaClient;

function getLogLevels(): ("query" | "info" | "warn" | "error")[] {
  if (env.NODE_ENV === "production") return ["error"];
  if (env.NODE_ENV === "test") return ["error"];
  return ["query", "info", "warn", "error"];
}

prisma = new PrismaClient({
  log: getLogLevels(),
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(
      `Connected to database (provider: ${env.DATABASE_PROVIDER})`,
    );
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export function isSqlite(): boolean {
  return env.DATABASE_PROVIDER === "sqlite";
}

export function isPostgres(): boolean {
  return env.DATABASE_PROVIDER === "postgresql";
}

export default prisma;
