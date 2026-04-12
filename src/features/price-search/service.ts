import { Product } from "@/types/product";
import { scrapers } from "@/stores";
import { getAllStores } from "@/stores/registry";
import { scrapeWithFallback } from "./router";

export async function scrapeWebsite(query: string): Promise<Product[]> {
  try {
    const storeKeys = [
      "naldo",
      "musimundo",
      "cetrogar",
      "fravega",
      "carrefour",
      "mercadolibre",
    ];
    const hardcodedPromises = storeKeys.map((store) => {
      const scraper = scrapers[store] ?? scrapers.default;
      return scrapeWithFallback(store, query, scraper);
    });

    const configPromises = getAllStores().map(({ key, scraper }) =>
      scrapeWithFallback(key, query, scraper),
    );

    const results = await Promise.all([...hardcodedPromises, ...configPromises]);
    return results.flat();
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  }
}
