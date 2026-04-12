import axios from "axios";
import { load } from "cheerio";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { StoreConfig } from "@/stores/loader";

export function createCheerioScraper(
  config: StoreConfig,
): (query: string) => Promise<Product[]> {
  const origin = new URL(config.url.replace("{query}", "x")).origin;

  return async (query: string): Promise<Product[]> => {
    const url = config.url.replace("{query}", encodeURIComponent(query));
    try {
      const { data } = await axios.get(url);
      const $ = load(data);
      const { selectors } = config;

      const products: Product[] = $(selectors.container)
        .map((_, item) => {
          const name = $(item).find(selectors.name).text().trim();

          const priceText = $(item)
            .find(selectors.price)
            .text()
            .trim()
            .replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
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

          return {
            name,
            price: Number(priceText) || 0,
            from: config.displayName as unknown as StoreNamesEnum,
            image,
            url: productUrl,
            brand: "Unknown",
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
