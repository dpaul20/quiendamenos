import axios from "axios";
import { load } from "cheerio";
import { Product } from "./types";

type Scraper = (url: string) => Promise<Product[]>;

const scrapers: Record<string, Scraper> = {
  naldo: async (url) => {
    const response = await axios.get(url);

    const $ = load(response.data);
    const products: Product[] = [];

    // Adaptar los selectores a la estructura HTML de VTEX
    $(
      ".vtex-product-summary-2-x-container.vtex-product-summary-2-x-container--product-card.vtex-product-summary-2-x-containerNormal.vtex-product-summary-2-x-containerNormal--product-card"
    ).each((index, element) => {
      const name = $(element)
        .find(".vtex-product-summary-2-x-productBrand")
        .text()
        .trim();
      const price = $(element)
        .find(
          ".vtex-flex-layout-0-x-flexColChild.vtex-flex-layout-0-x-flexColChild--product-price-container-2"
        )
        .text()
        .trim();
      const image =
        $(element)
          .find(
            ".vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image.vtex-product-summary-2-x-image--product-card"
          )
          .attr("src") ?? "https://placehold.co/300x200";
      products.push({
        name,
        price: price.split("-")[0].trim(),
        from: "naldo",
        image,
      });
    });
    console.log({ products });
    return products;
  },
  cetrogar: async (url) => {
    const response = await axios.get(url);
    const $ = load(response.data);
    const products: Product[] = [];

    $(".product-item").each((index, element) => {
      const name = $(element).find(".product-item-name").text();
      const price = $(element).find(".price").text();

      products.push({
        name,
        price,
        from: "cetrogar",
        image: "https://placehold.co/300x200",
      });
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

      products.push({
        name,
        price,

        from: "musimundo",
        image: "https://placehold.co/300x200",
      });
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

      products.push({
        name,
        price,
        from: "fravega",
        image: "https://placehold.co/300x200",
      });
    });

    return products;
  },
  default: async (url) => {
    console.warn(
      `No specific scraper found for ${url}. Using default scraper.`
    );

    return [];
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
