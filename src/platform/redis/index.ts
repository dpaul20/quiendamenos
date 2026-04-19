import Redis from "ioredis";

if (
  process.env.NODE_ENV === 'production' &&
  (process.env.REDIS_PASSWORD === undefined || process.env.REDIS_PASSWORD === '')
) {
  throw new Error('FATAL: REDIS_PASSWORD environment variable is required in production');
}

const redis = new Redis({
  host: process.env.REDIS_URL ?? "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD,
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
