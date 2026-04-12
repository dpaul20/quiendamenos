import { Product } from "@/types/product";
import { loadStores } from "./loader";
import { createCheerioScraper } from "./parsers/cheerio.parser";

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

export function getStore(key: string): Scraper | null {
  return store.get(key) ?? null;
}

export function initRegistry(): void {
  const configs = loadStores();
  for (const config of configs) {
    register(config.key, createCheerioScraper(config));
  }
}

/** Only for use in tests — clears all registered scrapers. */
export function _clearForTests(): void {
  store.clear();
}

initRegistry();
