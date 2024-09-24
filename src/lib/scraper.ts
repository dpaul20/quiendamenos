import puppeteer from "puppeteer";
import { Product } from "./types";
import axios from "axios";
import { encodeQuery, encodeUrl } from "./helpers";

type Scraper = (url: string) => Promise<Product[]>;

const formatProduct = (product: any): Product => {
  return {
    name: product.productName,
    price: parseFloat(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.naldo.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: product.brand.toLowerCase(),
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
    const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=${encodeUrl(
      query
    )}`;
    await page.goto(url, { waitUntil: "networkidle2" });

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

        // Obtener la URL de la imagen desde el atributo style
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
          price,
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

      const products: Product[] = data?.hits?.hits?.map((hit: any) => {
        const product = hit._source;
        return {
          name: product.Descripcion,
          price: parseFloat(product.Precio.replace(/[^0-9,-]+/g, "")),
          from: "musimundo",
          image: product.UrlImagen,
          url: product.Link,
          brand: product.Marca.toLowerCase(),
        };
      });

      return products;
    } catch (error) {
      console.error("Error fetching products from Musimundo:", error);
      return [];
    }
  },
  fravega: async (query) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.fravega.com/l/?keyword=${query}`;
    await page.goto(url, { waitUntil: "networkidle2" });

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
        const price = parseFloat(priceText);
        const imageUrl = item.querySelector("figure img")?.getAttribute("src");
        const productUrl = item
          .querySelector("a[rel='bookmark']")
          ?.getAttribute("href");

        return {
          name,
          price,
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
