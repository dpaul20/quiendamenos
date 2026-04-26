import { PriceHistoryEntry, TrendMap } from "./types";

export async function fetchTrendMap(query: string): Promise<TrendMap> {
  try {
    const res = await fetch(
      `/api/prices/history?query=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return {};

    const entries: PriceHistoryEntry[] = await res.json();
    if (!Array.isArray(entries) || entries.length < 2) return {};

    // entries está ordenada DESC: [0] = hoy, [1] = ayer
    const todayPrice = entries[0].minPrice;
    const yesterdayPrice = entries[1].minPrice;

    if (yesterdayPrice === 0) return {};

    const delta = Math.round(
      (Math.abs(todayPrice - yesterdayPrice) / yesterdayPrice) * 100,
    );

    if (delta < 1) return {};

    const direction: "up" | "down" =
      todayPrice < yesterdayPrice ? "down" : "up";

    // Retorna con clave especial — ProductList mapea este trend a cada producto
    return { __global__: { direction, delta } };
  } catch {
    return {};
  }
}
