import { Redis } from "@upstash/redis";

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error('FATAL: UPSTASH_REDIS_REST_TOKEN environment variable is required in production');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export default redis;
