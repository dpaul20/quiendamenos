import { scrapeWebsite } from "@/features/price-search/service";
import { cacheKey, setQueryCache } from "@/platform/cache";

/**
 * Schedules a background revalidation of the query cache (Stale-While-Revalidate).
 *
 * Intentionally NOT using Bull/BullMQ: free-tier Redis has a ~30MB memory cap
 * and Bull stores job metadata (lists, hashes) that compete with our actual
 * product data. A detached Promise is sufficient here because:
 *   - We don't need durability — the stale data keeps serving requests.
 *   - We don't need retries — the next SWR hit will retry automatically.
 *   - The scope is a single Next.js process, not a distributed system.
 */
export function scheduleRevalidation(query: string): void {
  // Fire-and-forget: detach from the current request lifecycle
  setImmediate(() => {
    void (async () => {
      try {
        const fresh = await scrapeWebsite(query);
        await setQueryCache(cacheKey.query(query), fresh);
        console.log(`[queue] SWR revalidation complete for query="${query}"`);
      } catch (err) {
        console.error(`[queue] SWR revalidation failed for query="${query}":`, err);
      }
    })();
  });
}
