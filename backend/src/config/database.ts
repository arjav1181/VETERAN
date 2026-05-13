import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

let prisma: PrismaClient;

if (env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
  });
} else {
  prisma = new PrismaClient({
    log: env.NODE_ENV === "test" ? ["error"] : ["query", "info", "warn", "error"],
  });
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
