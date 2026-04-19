import { load } from "cheerio";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";

export interface StoreConfig {
  key: string;
  displayName: string;
  parser?: string;
  url: string;
  selectors: {
    container: string;
    name: string;
    price: string;
    image: string;
    url: string;
    installment?: string;
    brand?: string;
  };
}

export function createCheerioScraper(
  config: StoreConfig,
): (query: string) => Promise<Product[]> {
  const origin = new URL(config.url.replace("{query}", "x")).origin;

  return async (query: string): Promise<Product[]> => {
    const url = config.url.replace("{query}", encodeURIComponent(query));
    try {
      const { data } = await httpClient.get(url);
      const $ = load(data);
      const { selectors } = config;

      const products: Product[] = $(selectors.container)
        .map((_, item) => {
          const name = $(item).find(selectors.name).text().trim();

          const priceText = $(item)
            .find(selectors.price)
            .text()
            .trim()
            .replaceAll(/[^\d,.-]/g, "")
            .replaceAll(".", "")
            .replace(",", ".");

          const imageEl = $(item).find(selectors.image);
          const image =
            imageEl.attr("src") ??
            imageEl.attr("data-src") ??
            "https://placehold.co/300x200";

          const rawUrl = $(item).find(selectors.url).attr("href") ?? "";
          const productUrl = rawUrl.startsWith("http")
            ? rawUrl
            : `${origin}${rawUrl}`;

          const installmentText = selectors.installment
            ? $(item).find(selectors.installment).text().trim()
            : "";
          const installment = installmentText ? Number(installmentText) : 0;

          const brand = selectors.brand
            ? $(item).find(selectors.brand).text().trim() || "Unknown"
            : "Unknown";

          return {
            name,
            price: Number(priceText) || 0,
            from: config.displayName as unknown as StoreNamesEnum,
            image,
            url: productUrl,
            brand,
            installment,
          };
        })
        .get();

      return products;
    } catch (error) {
      console.error(
        `[cheerio.parser] Error scraping ${config.displayName}:`,
        error,
      );
      return [];
    }
  };
}
