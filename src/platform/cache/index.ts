import redis from "../redis";

const normalize = (s: string) => s.toLowerCase().trim().replaceAll(/\s+/g, "_");

/** Claves de caché con namespace — evita colisiones entre caché de consulta y por tienda. */
export const cacheKey = {
  /** Caché primario: resultado completo de una búsqueda. TTL = 1h. */
  query: (q: string) => `q:${normalize(q)}`,
  /** Caché de respaldo: resultado por tienda para una consulta. TTL = 24h. */
  store: (store: string, q: string) => `s:${store}:${normalize(q)}`,
};

export const TTL = {
  QUERY: 3_600,   // 1h  — ruta primaria rápida
  STORE: 86_400,  // 24h — respaldo por tienda (supera intencionalmente al caché de consulta)
  /** Dispara revalidación SWR cuando se consume esta fracción del TTL de consulta. */
  SWR_RATIO: 0.75, // a partir de 45min de los 60min de TTL
};

interface CacheEntry<T> {
  data: T;
  createdAt: number; // Date.now() ms — determina el tiempo de vida SWR
}

/**
 * Retorna true cuando la entrada cacheada es lo suficientemente antigua como para
 * requerir una revalidación en segundo plano (Stale-While-Revalidate).
 * La entrada se sigue sirviendo tal cual; el llamador es responsable de disparar la actualización.
 */
export function isSwr(createdAt: number, ttlSeconds = TTL.QUERY): boolean {
  const ageMs = Date.now() - createdAt;
  return ageMs >= ttlSeconds * 1000 * TTL.SWR_RATIO;
}

/**
 * Lee el caché primario de consulta.
 * Devuelve los datos junto a un flag `stale` para que el llamador decida
 * si disparar una revalidación en segundo plano sin bloquear la respuesta.
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
 * Escribe el caché primario de consulta con un timestamp de creación embebido.
 * El timestamp permite verificar la antigüedad SWR en lecturas posteriores.
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
 * Escribe en lote entradas de respaldo por tienda usando SET NX (solo si no existe).
 * Evita reescribir claves de 24h en cada actualización SWR, ahorrando memoria en
 * Redis de plan gratuito. Cada par (tienda, consulta) se almacena como máximo una vez cada 24h.
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
 * Lectura de bajo nivel usada por el path de fallback en router.ts.
 * Devuelve el JSON deserializado o null.
 */
export async function getCachedData(key: string): Promise<unknown> {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


