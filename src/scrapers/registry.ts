import { Product } from "@/types/product";

type Scraper = (query: string) => Promise<Product[]>;

interface RegistryEntry {
  key: string;
  scraper: Scraper;
}

const store: Map<string, Scraper> = new Map();

export function register(key: string, scraper: Scraper): void {
  store.set(key, scraper);
}

export function getAllStores(): RegistryEntry[] {
  return Array.from(store.entries()).map(([key, scraper]) => ({
    key,
    scraper,
  }));
}

/** Solo para uso en tests — limpia todos los scrapers registrados. */
export function _clearForTests(): void {
  store.clear();
}
