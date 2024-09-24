import puppeteer from "puppeteer";
import { Product } from "./types";
import axios from "axios";
import { encodeQuery } from "./helpers";

type Scraper = (url: string) => Promise<Product[]>;

const formatProduct = (product: any): Product => {
  return {
    name: product.productName,
    price: parseFloat(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.naldo.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: product.brand,
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
      // console.log('productSuggestions', data?.data?.productSuggestions?.products)
      const products = data?.data?.productSuggestions?.products?.map(
        (product: any) => formatProduct(product)
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=${query}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".product-item");
      return Array.from(items).map((item) => {
        const name =
          item.querySelector(".product-item-name")?.textContent?.trim() ??
          "No name available";
        const priceText =
          item.querySelector(".price")?.textContent?.trim() ??
          "No price available";

        // Convertir el precio a un número
        const price = parseFloat(
          priceText.replace(/[^0-9,-]+/g, "").replace(",", "")
        );
        console.log("price", price);
        return {
          name,
          price,
          from: "cetrogar",
          image: "https://placehold.co/300x200",
          url: "https://www.cetrogar.com.ar",
          brand: "unknown",
        };
      });
    });

    await browser.close();

    return products;
  },
  musimundo: async (query) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.musimundo.com/mi-musimundo/search?text=${query}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".product-box");
      return Array.from(items).map((item) => {
        const name =
          item.querySelector(".product-title")?.textContent?.trim() ||
          "No name available";
        const price =
          item.querySelector(".price-fraction")?.textContent?.trim() ||
          "No price available";

        return {
          name,
          price,
          from: "musimundo",
          image: "https://placehold.co/300x200",
          url: "https://www.musimundo.com",
          brand: "unknown",
        };
      });
    });

    await browser.close();

    return products;
  },
  fravega: async (query) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.fravega.com/l/?keyword=${query}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".product-card");
      return Array.from(items).map((item) => {
        const name =
          item.querySelector(".product-card__title")?.textContent?.trim() ||
          "No name available";
        const price = item
          .querySelector(".product-card__price")
          ?.textContent?.trim();

        return {
          name,
          price,
          from: "fravega",
          image: "https://placehold.co/300x200",
          url: "https://www.fravega.com",
          brand: "unknown",
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
      `https://www.musimundo.com/mi-musimundo/search?text=${query}`,
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
