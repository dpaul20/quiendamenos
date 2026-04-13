import { Product } from "@/types/product";
import { scrapers } from "@/scrapers";
import { getAllStores } from "@/scrapers/registry";
import { scrapeWithFallback } from "./router";
import { cacheKey, setStoreCacheNX } from "@/platform/cache";

export async function scrapeWebsite(query: string): Promise<Product[]> {
  try {
    const allStores = [
      // Deriva las tiendas hardcodeadas directo del registro de scrapers — sin lista paralela
      ...Object.entries(scrapers)
        .filter(([key]) => key !== "default")
        .map(([key, scraper]) => ({ key, scraper })),
      ...getAllStores(),
    ];

    const settled = await Promise.allSettled(
      allStores.map(async ({ key: store, scraper }) => {
        const products = await scrapeWithFallback(store, query, scraper);
        return { store, products };
      }),
    );

    settled
      .filter((r) => r.status === "rejected")
      .forEach((r) =>
        console.error("[scrape] tienda falló:", r.reason),
      );

    const exitosos = settled.filter(
      (r): r is PromiseFulfilledResult<{ store: string; products: Product[] }> =>
        r.status === "fulfilled",
    );

    // Escribe en lote los resultados exitosos para respaldo por tienda (fire-and-forget).
    // Usa SET NX: omite tiendas ya cacheadas en las últimas 24h — ahorra memoria de Redis en plan gratuito.
    const toCache = exitosos
      .filter(({ value: { products } }) => products.length > 0)
      .map(({ value: { store, products } }) => ({
        key: cacheKey.store(store, query),
        data: products,
      }));
    setStoreCacheNX(toCache).catch((err) =>
      console.error("[cache] pipeline write failed:", err),
    );

    return exitosos.flatMap(({ value: { products } }) => products);
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  }
}
