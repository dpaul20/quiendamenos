import { exponentialBackoff } from '@/platform/backoff';
import { getCachedData, cacheKey } from '@/platform/cache';
import { Product } from '@/types/product';

/**
 * Wraps a scraper with exponential backoff + per-store cache fallback.
 * Cache writes are intentionally NOT done here — service.ts batch-writes
 * all successful results via Redis pipeline after Promise.all completes.
 */
export async function scrapeWithFallback(
  store: string,
  query: string,
  primaryScraper: (q: string) => Promise<Product[]>,
): Promise<Product[]> {
  const result = await exponentialBackoff(() => primaryScraper(query));

  if (result.success && result.data !== undefined) {
    console.log(`[Router] store=${store} attempt=${result.attempts} outcome=success`);
    return result.data;
  }

  console.log(`[Router] store=${store} attempt=${result.attempts} outcome=retry_exhausted`);

  const key = cacheKey.store(store, query);
  const cached = await getCachedData(key);
  if (cached !== null) {
    console.log(`[Router] store=${store} outcome=cache_hit`);
    return cached as Product[];
  }

  console.log(`[Router] store=${store} outcome=cache_miss`);
  return [];
}
