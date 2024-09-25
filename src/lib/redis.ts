// src/lib/redis.ts
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_URL,
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => {
    // Estrategia de reintento exponencial
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Solo reconectar en errores específicos
      return true;
    }
    return false;
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
