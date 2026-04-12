import { Product } from "@/types/product";
import { scrapers } from "@/stores";
import { getAllStores } from "@/stores/registry";
import { scrapeWithFallback } from "./router";
import { cacheKey, setStoreCacheNX } from "@/platform/cache";

const HARDCODED_STORES = [
  "naldo",
  "musimundo",
  "cetrogar",
  "fravega",
  "carrefour",
  "mercadolibre",
  "oncity",
];

export async function scrapeWebsite(query: string): Promise<Product[]> {
  try {
    const allStores = [
      ...HARDCODED_STORES.map((key) => ({
        key,
        scraper: scrapers[key] ?? scrapers.default,
      })),
      ...getAllStores(),
    ];

    const results = await Promise.all(
      allStores.map(async ({ key: store, scraper }) => {
        const products = await scrapeWithFallback(store, query, scraper);
        return { store, products };
      }),
    );

    // Batch-write successful results for future per-store fallback (fire-and-forget).
    // Uses SET NX: skips stores already cached within 24h — saves free-tier Redis memory.
    const toCache = results
      .filter(({ products }) => products.length > 0)
      .map(({ store, products }) => ({
        key: cacheKey.store(store, query),
        data: products,
      }));
    setStoreCacheNX(toCache).catch((err) =>
      console.error("[cache] pipeline write failed:", err),
    );

    return results.flatMap(({ products }) => products);
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  }
}
