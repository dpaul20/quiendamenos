import type { PriceHistoryEntry } from "./types";

export async function fetchPriceHistory(
  query: string,
): Promise<PriceHistoryEntry[]> {
  try {
    const res = await fetch(
      `/api/prices/history?query=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return [];

    const entries: PriceHistoryEntry[] = await res.json();
    if (!Array.isArray(entries) || entries.length === 0) return [];

    // API returns DESC (newest first); reverse to ASC for charting
    return [...entries].reverse();
  } catch {
    return [];
  }
}
