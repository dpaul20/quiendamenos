import { Product } from "@/types/product";
import { scrapeNaldo } from "./naldo";
import { scrapeCetrogar } from "./cetrogar";
import { scrapeFravega } from "./fravega";
import { scrapeCarrefour } from "./carrefour";
import { scrapeMercadoLibre } from "./mercadolibre";
import { scrapeOnCity } from "./oncity";

type Scraper = (query: string) => Promise<Product[]>;

export const scrapers: Record<string, Scraper> = {
  naldo: scrapeNaldo,
  cetrogar: scrapeCetrogar,
  fravega: scrapeFravega,
  carrefour: scrapeCarrefour,
  mercadolibre: scrapeMercadoLibre,
  oncity: scrapeOnCity,
  default: async () => [],
};
