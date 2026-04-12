import redis from "../redis";

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_");

/** Namespaced cache keys — prevents collisions between query and store caches. */
export const cacheKey = {
  /** Primary cache: full result for a search query. TTL = 1h. */
  query: (q: string) => `q:${normalize(q)}`,
  /** Fallback cache: per-store result for a query. TTL = 24h. */
  store: (store: string, q: string) => `s:${store}:${normalize(q)}`,
};

export const TTL = {
  QUERY: 3_600,   // 1h  — primary fast path
  STORE: 86_400,  // 24h — per-store fallback (outlives query cache on purpose)
  /** Trigger SWR revalidation when this fraction of QUERY TTL is consumed. */
  SWR_RATIO: 0.75, // after 45min of 60min TTL
};

interface CacheEntry<T> {
  data: T;
  createdAt: number; // Date.now() ms — used to determine SWR staleness
}

/**
 * Returns true when the cached entry is old enough to warrant a background
 * revalidation (Stale-While-Revalidate). The entry is still served as-is;
 * the caller is responsible for triggering the refresh.
 */
export function isSwr(createdAt: number, ttlSeconds = TTL.QUERY): boolean {
  const ageMs = Date.now() - createdAt;
  return ageMs >= ttlSeconds * 1000 * TTL.SWR_RATIO;
}

/**
 * Read the primary query cache.
 * Returns the data plus a `stale` flag so the caller can decide whether to
 * trigger a background revalidation without blocking the response.
 */
export async function getQueryCache(
  key: string,
): Promise<{ data: unknown; stale: boolean } | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return { data: entry.data, stale: isSwr(entry.createdAt) };
  } catch {
    return null;
  }
}

/**
 * Write the primary query cache with a creation timestamp embedded.
 * The timestamp enables SWR staleness checks on subsequent reads.
 */
export async function setQueryCache(key: string, data: unknown): Promise<void> {
  try {
    const entry: CacheEntry<unknown> = { data, createdAt: Date.now() };
    await redis.set(key, JSON.stringify(entry), "EX", TTL.QUERY);
  } catch (error) {
    console.error("[cache] setQueryCache error:", error);
  }
}

/**
 * Batch-write per-store fallback entries using SET NX (only-if-not-exists).
 * This prevents re-writing 24h keys on every SWR refresh, saving memory on
 * free-tier Redis. Each (store, query) pair is stored at most once per 24h.
 */
export async function setStoreCacheNX(
  entries: Array<{ key: string; data: unknown }>,
): Promise<void> {
  if (entries.length === 0) return;
  try {
    const pipeline = redis.pipeline();
    for (const { key, data } of entries) {
      pipeline.set(key, JSON.stringify(data), "EX", TTL.STORE, "NX");
    }
    await pipeline.exec();
  } catch (error) {
    console.error("[cache] setStoreCacheNX error:", error);
  }
}

/**
 * Low-level read used by the fallback path in router.ts.
 * Returns raw parsed JSON or null.
 */
export async function getCachedData(key: string): Promise<unknown> {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** @deprecated Use setQueryCache or setStoreCacheNX instead. */
export async function setCachedData(
  key: string,
  data: unknown,
  ttlSeconds = TTL.QUERY,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (error) {
    console.error("[cache] setCachedData error:", error);
  }
}
