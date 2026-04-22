import Redis from "ioredis";

if (
  process.env.NODE_ENV === 'production' &&
  (process.env.REDIS_PASSWORD === undefined || process.env.REDIS_PASSWORD === '')
) {
  throw new Error('FATAL: REDIS_PASSWORD environment variable is required in production');
}

const isUpstash = (process.env.REDIS_URL ?? "").includes("upstash.io");

const redis = new Redis({
  host: process.env.REDIS_URL ?? "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD,
  tls: isUpstash ? {} : undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    if (err.message.includes("READONLY")) return true;
    return false;
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
