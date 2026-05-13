import { createServer, Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import type { Express } from "express";
import { verifyToken } from "../utils/crypto.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let io: SocketIOServer;

export function createHttpServer(app: Express): { httpServer: HttpServer; io: SocketIOServer } {
  const httpServer = createServer(app);

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(",").map(o => o.trim()),
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    const payload = verifyToken(token as string);
    if (!payload) {
      next(new Error("Invalid token"));
      return;
    }

    (socket as unknown as Record<string, unknown>).userId = payload.sub;
    next();
  });

  io.on("connection", (socket) => {
    const userId = (socket as unknown as Record<string, unknown>).userId as string;
    logger.info("Socket connected", { userId, socketId: socket.id });

    socket.join(`user:${userId}`);

    socket.on("join:repo", (repoId: string) => {
      socket.join(`repo:${repoId}`);
      logger.info("Joined repo room", { userId, repoId });
    });

    socket.on("leave:repo", (repoId: string) => {
      socket.leave(`repo:${repoId}`);
    });

    socket.on("join:pipeline", (pipelineId: string) => {
      socket.join(`pipeline:${pipelineId}`);
    });

    socket.on("leave:pipeline", (pipelineId: string) => {
      socket.leave(`pipeline:${pipelineId}`);
    });

    socket.on("join:pr", (prId: string) => {
      socket.join(`pr:${prId}`);
    });

    socket.on("leave:pr", (prId: string) => {
      socket.leave(`pr:${prId}`);
    });

    socket.on("join:codespace", (codespaceId: string) => {
      socket.join(`codespace:${codespaceId}`);
    });

    socket.on("leave:codespace", (codespaceId: string) => {
      socket.leave(`codespace:${codespaceId}`);
    });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { userId, socketId: socket.id });
    });
  });

  return { httpServer, io };
}

export function getIO(): SocketIOServer {
  return io;
}

export function sendToUser(userId: string, event: string, data: unknown): void {
  io.to(`user:${userId}`).emit(event, data);
}

export function sendToRepo(repoId: string, event: string, data: unknown): void {
  io.to(`repo:${repoId}`).emit(event, data);
}

export function sendToPipeline(pipelineId: string, event: string, data: unknown): void {
  io.to(`pipeline:${pipelineId}`).emit(event, data);
}

export function sendToPR(prId: string, event: string, data: unknown): void {
  io.to(`pr:${prId}`).emit(event, data);
}

export function sendToCodespace(codespaceId: string, event: string, data: unknown): void {
  io.to(`codespace:${codespaceId}`).emit(event, data);
}
