import { exponentialBackoff } from "@/platform/backoff";
import { getCachedData, cacheKey } from "@/platform/cache";
import { Product } from "@/types/product";

/**
 * Presupuesto de reintentos por tienda.
 *
 * Las tiendas se consultan en paralelo, así que la latencia de /api/scrape la
 * marca la más lenta. Sin este tope, un 403 permanente como el de MercadoLibre
 * consumiría los 4 reintentos (2s+4s+8s+16s) sin ninguna chance de éxito.
 *
 * No acota el primer intento: un request ya en vuelo no se puede interrumpir
 * desde acá — ese límite es el timeout de `platform/http`.
 */
export const STORE_RETRY_BUDGET_MS = 10_000;

/**
 * Envuelve un scraper con exponential backoff + caché de respaldo por tienda.
 * Las escrituras en caché NO se hacen aquí intencionalmente — service.ts escribe
 * en lote todos los resultados exitosos via pipeline Redis al completar Promise.all.
 */
export async function scrapeWithFallback(
  store: string,
  query: string,
  primaryScraper: (q: string) => Promise<Product[]>,
): Promise<Product[]> {
  const result = await exponentialBackoff(() => primaryScraper(query), {
    maxTotalTime: STORE_RETRY_BUDGET_MS,
  });

  if (result.success && result.data !== undefined) {
    console.log(
      `[Router] store=${store} attempt=${result.attempts} outcome=success`,
    );
    return result.data;
  }

  console.log(
    `[Router] store=${store} attempt=${result.attempts} outcome=retry_exhausted`,
  );

  const key = cacheKey.store(store, query);
  const cached = await getCachedData(key);
  if (cached !== null) {
    console.log(`[Router] store=${store} outcome=cache_hit`);
    return cached as Product[];
  }

  console.log(`[Router] store=${store} outcome=cache_miss`);
  return [];
}
