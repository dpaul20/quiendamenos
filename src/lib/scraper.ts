import axios from "axios";
import { load } from "cheerio";

interface Product {
  name: string;
  price: string;
  specs: string;
  category: string;
}

type Scraper = (url: string) => Promise<Product[]>;

const scrapers: Record<string, Scraper> = {
  naldo: async (url) => {
    const response = await axios.get(url);
    console.log({ response });
    const $ = load(response.data);
    const products: Product[] = [];

    // Adaptar los selectores a la estructura HTML de VTEX
    $(".vtex-product-summary-2-x-container").each((index, element) => {
      const name = $(element)
        .find(".vtex-store-components-3-x-productNameContainer")
        .text()
        .trim();
      const price = $(element)
        .find(".vtex-product-price-1-x-sellingPrice")
        .text()
        .trim();
      const specs = $(element)
        .find(".vtex-product-specs-1-x-specs")
        .text()
        .trim();
      const category = $(element)
        .find(".vtex-store-components-3-x-categoryName")
        .text()
        .trim();
      products.push({ name, price, specs, category });
    });
    console.log({ products });
    return products;
  },
  centrohogar: async (url) => {
    const response = await axios.get(url);
    const $ = load(response.data);
    const products: Product[] = [];

    $(".product-item").each((index, element) => {
      const name = $(element).find(".product-item-name").text();
      const price = $(element).find(".price").text();
      const specs = $(element).find(".product-item-description").text();
      products.push({ name, price, specs, category: "unknown" });
    });

    return products;
  },
  musimundo: async (url) => {
    const response = await axios.get(url);
    const $ = load(response.data);
    const products: Product[] = [];

    $(".product-box").each((index, element) => {
      const name = $(element).find(".product-title").text();
      const price = $(element).find(".price-fraction").text();
      const specs = $(element).find(".product-features").text();
      products.push({ name, price, specs, category: "unknown" });
    });

    return products;
  },
  fravega: async (url) => {
    const response = await axios.get(url);
    const $ = load(response.data);
    const products: Product[] = [];

    $(".product-card").each((index, element) => {
      const name = $(element).find(".product-card__title").text();
      const price = $(element).find(".product-card__price").text();
      const specs = $(element).find(".product-card__description").text();
      products.push({ name, price, specs, category: "unknown" });
    });

    return products;
  },
  default: async (url) => {
    console.warn(
      `No specific scraper found for ${url}. Using default scraper.`
    );
    const response = await axios.get(url);
    const $ = load(response.data);
    const products: Product[] = [];

    $("div, article").each((index, element) => {
      const name = $(element).find("h2, h3, .title").first().text();
      const price = $(element).find('.price, [class*="price"]').first().text();
      const specs = $(element)
        .find('p, .description, [class*="description"]')
        .first()
        .text();
      if (name && price) {
        products.push({
          name,
          price,
          specs: specs || "No specifications available",
          category: "unknown",
        });
      }
    });

    return products;
  },
};

export async function scrapeWebsite(url: string): Promise<Product[]> {
  try {
    const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
    const scraper = scrapers[domain] || scrapers.default;
    return await scraper(url);
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  }
}
