import { Product } from "@/types/product";
import { scrapeNaldo } from "./naldo";
import { scrapeCetrogar } from "./cetrogar";
import { scrapeFravega } from "./fravega";
import { scrapeMusimundo } from "./musimundo";
import { scrapeCarrefour } from "./carrefour";
import { scrapeMercadoLibre } from "./mercadolibre";

type Scraper = (query: string) => Promise<Product[]>;

export const scrapers: Record<string, Scraper> = {
  naldo: scrapeNaldo,
  cetrogar: scrapeCetrogar,
  fravega: scrapeFravega,
  musimundo: scrapeMusimundo,
  carrefour: scrapeCarrefour,
  mercadolibre: scrapeMercadoLibre,
  default: async () => [],
};
