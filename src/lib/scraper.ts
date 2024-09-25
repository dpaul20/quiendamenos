import { chromium } from "playwright";
import { Product } from "../types/product";
import axios from "axios";
import { capitalize } from "./capitalize";
import { encodeQuery } from "./vtex-helpers";
import { vtexProduct } from "@/types/vtex-product";
import { MusimundoProductSource } from "@/types/musimundo";

type Scraper = (url: string) => Promise<Product[]>;

const formatProduct = (product: vtexProduct): Product => {
  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.naldo.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    from: "naldo",
  };
};

const buildUrl = (query: string) => {
  const baseUrl = "https://www.naldo.com.ar/_v/segment/graphql/v1";
  return `${baseUrl}?${encodeQuery(query)}`;
};

const scrapers: Record<string, Scraper> = {
  naldo: async (query: string) => {
    const url = buildUrl(query);

    try {
      const { data } = await axios.get(url);
      const products = data?.data?.productSuggestions?.products?.map(
        (product: vtexProduct) => formatProduct(product)
      );

      if (!products) {
        return [];
      }

      return products;
    } catch (error) {
      console.error("Error fetching products from Naldo:", error);
      return [];
    }
  },
  cetrogar: async (query) => {
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=${query}`;
    await page.goto(url, { waitUntil: "networkidle" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".item.product.product-item");
      return Array.from(items).map((item) => {
        const name = item
          .querySelector(".product.name.product-item-name")
          ?.textContent?.trim();

        const price = item
          .querySelector(".price")
          ?.textContent?.trim()
          .replace(/[^0-9,-]+/g, "")
          .replace(",", "");

        const imageStyle = item
          .querySelector(".product-image-photo")
          ?.getAttribute("style");
        const imageUrlMatch = imageStyle?.match(/url\(['"]?(.*?)['"]?\)/);
        const imageUrl = imageUrlMatch
          ? imageUrlMatch[1]
          : "https://placehold.co/300x200";

        const url = item.querySelector("a")?.getAttribute("href");

        return {
          name,
          price: Number(price),
          from: "cetrogar",
          image: imageUrl,
          url,
          brand: "Unknown",
        };
      });
    });

    await browser.close();

    return products;
  },
  musimundo: async (query) => {
    try {
      const url = `https://u.braindw.com/els/musimundoapi?ft=${query}&qt=100&sc=emsa&refreshmetadata=true&exclusive=0&aggregations=true`;

      const { data } = await axios.get(url);

      const products: Product[] = data?.hits?.hits?.map(
        (hit: { _source: MusimundoProductSource }) => {
          const product = hit._source;
          return {
            name: product.Descripcion,
            price: parseFloat(product.Precio.replace(/[^0-9,-]+/g, "")),
            from: "musimundo",
            image: product.UrlImagen,
            url: product.Link,
            brand: capitalize(product.Marca),
          };
        }
      );

      return products;
    } catch (error) {
      console.error("Error fetching products from Musimundo:", error);
      return [];
    }
  },
  fravega: async (query) => {
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const url = `https://www.fravega.com/l/?keyword=${query}`;
    await page.goto(url, { waitUntil: "networkidle" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(
        "article[data-test-id='result-item']"
      );
      return Array.from(items).map((item) => {
        const name = item
          .querySelector("a > div > div > span")
          ?.textContent?.trim();

        const priceText = item
          .querySelector("div[data-test-id='product-price'] > span")
          ?.textContent?.trim()
          .replace(/[^0-9,-]+/g, "");

        const imageUrl =
          item.querySelector("figure img")?.getAttribute("src") ||
          "https://placehold.co/300x200";
        const productUrl = item
          .querySelector("a[rel='bookmark']")
          ?.getAttribute("href");

        return {
          name,
          price: Number(priceText),
          from: "fravega",
          image: imageUrl,
          url: `https://www.fravega.com${productUrl}`,
          brand: "Unknown",
        };
      });
    });

    await browser.close();

    return products;
  },
  default: async (url) => {
    console.warn(
      `No specific scraper found for ${url}. Using default scraper.`
    );
    return [];
  },
};

export async function scrapeWebsite(query: string): Promise<Product[]> {
  try {
    const urls = [
      `https://www.naldo.com.ar`,
      `https://www.musimundo.com`,
      `https://www.cetrogar.com.ar/catalogsearch/result/?q=${query}`,
      `https://www.fravega.com/l/?keyword=${query}`,
    ];

    const promises = urls.map((url) => {
      const store = url.split(".")[1];
      const scraper = scrapers[store] || scrapers.default;
      return scraper(query);
    });

    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  }
}
