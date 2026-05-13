import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { createHttpServer } from "./realtime/socket.js";
import { startSshServer, stopSshServer } from "./ssh/server.js";
import { startQueueWorkers, stopQueueWorkers } from "./workers/queue.js";
import { logger } from "./utils/logger.js";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

let httpServer: ReturnType<typeof createServer>;
let io: SocketIOServer;

export async function start(): Promise<void> {
  try {
    await connectDatabase();
    await connectRedis();

    const { httpServer: server, io: socketIO } = createHttpServer(app);
    httpServer = server;
    io = socketIO;

    httpServer.listen(env.PORT, env.HOST, () => {
      logger.info(`Server listening on ${env.HOST}:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    startSshServer().catch(err => {
      logger.warn("SSH server failed to start", { error: err });
    });

    await startQueueWorkers();

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      stopQueueWorkers();
      stopSshServer();
      io.close();
      httpServer.close();
      await disconnectRedis();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

start();
