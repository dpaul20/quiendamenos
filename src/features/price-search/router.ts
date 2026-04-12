import { exponentialBackoff } from '@/platform/backoff';
import { getCachedData, setCachedData } from '@/platform/cache';
import { Product } from '@/types/product';

export async function scrapeWithFallback(
  store: string,
  query: string,
  primaryScraper: (q: string) => Promise<Product[]>,
): Promise<Product[]> {
  const result = await exponentialBackoff(() => primaryScraper(query));

  if (result.success && result.data !== undefined) {
    console.log(`[Router] store=${store} attempt=${result.attempts} outcome=success`);
    await setCachedData(store, result.data);
    return result.data;
  }

  console.log(`[Router] store=${store} attempt=${result.attempts} outcome=retry_exhausted`);

  const cached = await getCachedData(store);
  if (cached !== null) {
    console.log(`[Router] store=${store} outcome=cache_hit`);
    return cached as Product[];
  }

  console.log(`[Router] store=${store} outcome=cache_miss`);
  return [];
}
