import { EventEmitter } from "events";
import { createRequire } from "module";
import { env } from "./env.js";

const _require = createRequire(import.meta.url);

type RedisValue = string | number | Buffer | null;
type RedisPipeline = { exec: () => Promise<unknown[]>; [key: string]: unknown };

function createNoopRedis() {
  const warning =
    "Redis not configured — running without Redis. Some features (queues, caching, rate limiting) will be degraded.";

  const noop = new EventEmitter() as ReturnType<typeof createNoopRedis>;

  const noopFn = (...args: unknown[]) => {
    if (
      args.length > 0 &&
      typeof args[args.length - 1] === "function"
    ) {
      (args[args.length - 1] as (...a: unknown[]) => void)(null, "OK");
    }
    return Promise.resolve("OK");
  };

  const methods: Record<string, unknown> = {
    ping: () => {
      console.warn(warning);
      return Promise.resolve("PONG");
    },
    quit: () => Promise.resolve("OK"),
    disconnect: () => {},
    on: noop.on.bind(noop),
    once: noop.once.bind(noop),
    removeListener: noop.removeListener.bind(noop),
    emit: noop.emit.bind(noop),

    // String
    get: () => Promise.resolve(null),
    set: noopFn,
    setex: noopFn,
    setnx: noopFn,
    del: noopFn,
    incr: () => Promise.resolve(1),
    decr: () => Promise.resolve(0),
    expire: noopFn,
    ttl: () => Promise.resolve(-1),
    exists: () => Promise.resolve(0),
    mget: () => Promise.resolve([]),
    mset: noopFn,

    // Hash
    hget: () => Promise.resolve(null),
    hset: noopFn,
    hdel: noopFn,
    hgetall: () => Promise.resolve({}),
    hkeys: () => Promise.resolve([]),
    hvals: () => Promise.resolve([]),
    hlen: () => Promise.resolve(0),
    hmset: noopFn,
    hmget: () => Promise.resolve([]),
    hexists: () => Promise.resolve(0),
    hincrby: () => Promise.resolve(0),

    // List
    lpush: noopFn,
    rpush: noopFn,
    lpop: () => Promise.resolve(null),
    rpop: () => Promise.resolve(null),
    llen: () => Promise.resolve(0),
    lrange: () => Promise.resolve([]),
    lrem: noopFn,
    ltrim: noopFn,

    // Set
    sadd: noopFn,
    srem: noopFn,
    smembers: () => Promise.resolve([]),
    sismember: () => Promise.resolve(0),
    scard: () => Promise.resolve(0),
    sinter: () => Promise.resolve([]),
    sunion: () => Promise.resolve([]),
    sdiff: () => Promise.resolve([]),

    // Sorted Set
    zadd: noopFn,
    zrem: noopFn,
    zrange: () => Promise.resolve([]),
    zrevrange: () => Promise.resolve([]),
    zrangebyscore: () => Promise.resolve([]),
    zrevrangebyscore: () => Promise.resolve([]),
    zrank: () => Promise.resolve(null),
    zrevrank: () => Promise.resolve(null),
    zcard: () => Promise.resolve(0),
    zscore: () => Promise.resolve(null),
    zremrangebyscore: noopFn,
    zremrangebyrank: noopFn,
    zcount: () => Promise.resolve(0),
    zincrby: noopFn,

    // Pub/Sub
    publish: noopFn,
    subscribe: noopFn,
    unsubscribe: noopFn,
    psubscribe: noopFn,
    punsubscribe: noopFn,

    // Connection
    sendCommand: noopFn,
    call: noopFn,

    // Pipeline / Multi
    multi: () => createNoopPipeline(),
    pipeline: () => createNoopPipeline(),

    // Status
    status: "close",
    isCluster: false,
    options: {},

    // Key
    keys: () => Promise.resolve([]),
    randomkey: () => Promise.resolve(null),
    rename: noopFn,
    type: () => Promise.resolve("none"),
    scan: () => Promise.resolve(["0", []]),

    // Server
    flushdb: noopFn,
    flushall: noopFn,
    info: () => Promise.resolve(""),
    dbsize: () => Promise.resolve(0),

    // Bitmap
    setbit: noopFn,
    getbit: () => Promise.resolve(0),
    bitcount: () => Promise.resolve(0),

    // Geo
    geoadd: noopFn,
    geodist: () => Promise.resolve(null),
    geohash: () => Promise.resolve([]),
    geopos: () => Promise.resolve([]),
    georadius: () => Promise.resolve([]),
    georadiusbymember: () => Promise.resolve([]),

    // HyperLogLog
    pfadd: noopFn,
    pfcount: () => Promise.resolve(0),
    pfmerge: noopFn,

    // Streams
    xadd: noopFn,
    xlen: () => Promise.resolve(0),
    xrange: () => Promise.resolve([]),
    xrevrange: () => Promise.resolve([]),
    xread: () => Promise.resolve(null),
    xgroup: noopFn,
    xreadgroup: () => Promise.resolve(null),
    xack: noopFn,
    xdel: noopFn,
    xtrim: noopFn,
    xpending: () => Promise.resolve([]),
    xinfo: () => Promise.resolve([]),

    // Scripting
    eval: noopFn,
    evalsha: noopFn,
    script: noopFn,
  };

  Object.assign(noop, methods);
  return noop as unknown as ReturnType<typeof createNoopRedis>;
}

function createNoopPipeline() {
  const pipeline = {
    exec: () => Promise.resolve([]),
    length: 0,
  };
  return new Proxy(pipeline, {
    get(target, prop) {
      if (prop === "exec") return target.exec;
      if (prop === "length") return target.length;
      return () => pipeline;
    },
  }) as unknown as RedisPipeline;
}

let redisClient: ReturnType<typeof createNoopRedis> | null = null;

export function createRedisClient() {
  if (env.REDIS_URL) {
    try {
      const Redis = _require("ioredis").default as typeof import("ioredis").default;
      const client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times: number) {
          if (times > 10) return null;
          return Math.min(times * 100, 3000);
        },
        lazyConnect: true,
      });

      client.on("error", (err: Error) => {
        console.error("Redis error:", err);
      });

      client.on("connect", () => {
        console.log("Connected to Redis");
      });

      return client;
    } catch (err) {
      console.warn("Failed to create Redis client, falling back to noop:", err);
      return createNoopRedis();
    }
  }

  console.warn("REDIS_URL not set — using noop Redis client. Queues and caching will not work.");
  return createNoopRedis();
}

export function getRedis() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    console.warn("Redis not configured — skipping connection.");
    return;
  }
  try {
    const client = getRedis();
    if (typeof (client as any).ping === "function") {
      await (client as any).ping();
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      await (redisClient as any).quit();
    } catch {
      // ignore
    }
  }
}

export function isRedisAvailable(): boolean {
  return !!env.REDIS_URL;
}

export default getRedis;
