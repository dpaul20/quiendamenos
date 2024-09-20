import puppeteer from "puppeteer";
import { Product } from "./types";

type Scraper = (url: string) => Promise<Product[]>;

const scrapers: Record<string, Scraper> = {
  naldo: async (url) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle2" });

      const products: Product[] = await page.evaluate(() => {
        const items = document.querySelectorAll(
          ".vtex-product-summary-2-x-container.vtex-product-summary-2-x-container--product-card.vtex-product-summary-2-x-containerNormal.vtex-product-summary-2-x-containerNormal--product-card"
        );
        return Array.from(items).map((item) => {
          const name =
            item
              .querySelector(".vtex-product-summary-2-x-productBrand")
              ?.textContent?.trim() || "No name available";
          const price =
            item
              .querySelector(
                ".vtex-flex-layout-0-x-flexColChild.vtex-flex-layout-0-x-flexColChild--product-price-container-2"
              )
              ?.textContent?.trim() || "No price available";
          const image =
            item
              .querySelector(
                ".vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image.vtex-product-summary-2-x-image--product-card"
              )
              ?.getAttribute("src") || "https://placehold.co/300x200";

          const url = item.querySelector("a")?.getAttribute("href");
          return {
            name: name.toLowerCase(),
            price: price
              // .split("-")[0]
              // .trim()
              .replace(/[^0-9,.-]+/g, ""),
            from: "naldo",
            image,
            url: `https://www.naldo.com.ar${url}`,
          };
        });
      });

      await browser.close();
      return products;
    } catch (error) {
      console.error("Error scraping Naldo:", error);
      return [];
    }
  },
  cetrogar: async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".product-item");
      return Array.from(items).map((item) => {
        const name =
          item.querySelector(".product-item-name")?.textContent?.trim() ||
          "No name available";
        const price =
          item.querySelector(".price")?.textContent?.trim() ||
          "No price available";
        return {
          name,
          price,
          from: "cetrogar",
          image: "https://placehold.co/300x200",
          url: "https://www.cetrogar.com.ar",
        };
      });
    });

    await browser.close();
    return products;
  },
  musimundo: async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
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
        };
      });
    });

    await browser.close();
    return products;
  },
  fravega: async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const products: Product[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".product-card");
      return Array.from(items).map((item) => {
        const name =
          item.querySelector(".product-card__title")?.textContent?.trim() ||
          "No name available";
        const price =
          item.querySelector(".product-card__price")?.textContent?.trim() ||
          "No price available";
        return {
          name,
          price,
          from: "fravega",
          image: "https://placehold.co/300x200",
          url: "https://www.fravega.com",
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
