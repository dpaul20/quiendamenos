export interface PriceSnapshot {
  store: string;
  query_hash: string;
  product_name: string;
  price_cents: number;
  url: string;
}
export interface PriceHistoryEntry {
  date: string; // ISO "2026-04-25"
  minPrice: number; // en centavos
}
export interface PriceTrend {
  direction: "up" | "down";
  delta: number; // porcentaje redondeado ej. 12
}
export type TrendMap = Record<string, PriceTrend>; // key = product url
