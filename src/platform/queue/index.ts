import { scrapeWebsite } from "@/features/price-search/service";
import { cacheKey, setQueryCache } from "@/platform/cache";

/**
 * Programa una revalidación en segundo plano del caché de consulta (Stale-While-Revalidate).
 *
 * Deliberadamente NO se usa Bull/BullMQ: Redis en plan gratuito tiene ~30MB de límite
 * y Bull almacena metadatos de jobs (lists, hashes) que compiten con los datos de productos.
 * Una Promise desacoplada es suficiente porque:
 *   - No se necesita durabilidad — los datos stale siguen respondiendo peticiones.
 *   - No se necesitan reintentos — el próximo hit SWR reintentará automáticamente.
 *   - El alcance es un único proceso Next.js, no un sistema distribuido.
 */
export function scheduleRevalidation(query: string): void {
  // Fire-and-forget: desacopla del ciclo de vida de la petición actual
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
