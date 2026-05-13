import Redis from "ioredis";
import { env } from "./env.js";

let redis: Redis;

export function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    },
  });

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  client.on("connect", () => {
    console.log("Connected to Redis");
  });

  return client;
}

export function getRedis(): Redis {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  try {
    redis = getRedis();
    await redis.ping();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
  }
}

export default getRedis;
