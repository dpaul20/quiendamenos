import axios from "axios";
import { load } from "cheerio";
import { capitalize } from "./capitalize";
import { encodeQuery } from "./vtex-helpers";
import { vtexProduct } from "@/types/vtex-product";
import { MusimundoProductSource } from "@/types/musimundo";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

type Scraper = (url: string) => Promise<Product[]>;

const formatProductNaldo = (product: vtexProduct): Product => {
  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.naldo.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    from: StoreNamesEnum.NALDO,
  };
};

const formatProductCarrefour = (product: vtexProduct): Product => {
  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.carrefour.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    from: StoreNamesEnum.CARREFOUR,
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
        (product: vtexProduct) => formatProductNaldo(product)
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
  carrefour: async (query: string) => {
    const url = buildUrl(query);

    try {
      const { data } = await axios.get(url);
      const products = data?.data?.productSuggestions?.products?.map(
        (product: vtexProduct) => formatProductCarrefour(product)
      );

      if (!products) {
        return [];
      }

      return products;
    } catch (error) {
      console.error("Error fetching products from Carrefour:", error);
      return [];
    }
  },
  cetrogar: async (query) => {
    const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=${query}`;
    try {
      const { data } = await axios.get(url);
      const $ = load(data);

      const products: Product[] = $(".item.product.product-item")
        .map((_, item) => {
          const name = $(item)
            .find(".product.name.product-item-name")
            .text()
            .trim();
          const price = $(item)
            .find("span[data-price-type='finalPrice']")
            .text()
            .trim()
            .replace(/[^\d,.-]/g, "") // Elimina cualquier carácter que no sea dígito, coma, punto o guion
            .replace(/\./g, "") // Elimina los puntos (separadores de miles)
            .replace(",", "."); // Reemplaza la coma (separador decimal) por un punto

          const imageStyle = $(item).find(".product-image-photo").attr("style");
          const imageUrlMatch = imageStyle?.match(/url\(['"]?(.*?)['"]?\)/);
          const imageUrl = imageUrlMatch
            ? imageUrlMatch[1]
            : "https://placehold.co/300x200";
          const url = $(item).find("a").attr("href");

          return {
            name,
            price: Number(price),
            from: StoreNamesEnum.CETROGAR,
            image: imageUrl,
            url,
            brand: "Unknown",
          };
        })
        .get();

      return products;
    } catch (error) {
      console.error("Error fetching products from Cetrogar:", error);
      return [];
    }
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
            from: StoreNamesEnum.MUSIMUNDO,
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
    const url = `https://www.fravega.com/l/?keyword=${query}`;
    try {
      const { data } = await axios.get(url);
      const $ = load(data);

      const products: Product[] = $("article[data-test-id='result-item']")
        .map((_, item) => {
          const name = $(item).find("a > div > div > span").text().trim();
          const priceText = $(item)
            .find("div[data-test-id='product-price'] > span")
            .text()
            .trim()
            .replace(/[^0-9,-]+/g, "");
          const imageUrl =
            $(item).find("figure img").attr("src") ??
            "https://placehold.co/300x200";
          const productUrl = $(item).find("a[rel='bookmark']").attr("href");

          return {
            name,
            price: Number(priceText),
            from: StoreNamesEnum.FRAVEGA,
            image: imageUrl,
            url: `https://www.fravega.com${productUrl}`,
            brand: "Unknown",
          };
        })
        .get();

      return products;
    } catch (error) {
      console.error("Error fetching products from Fravega:", error);
      return [];
    }
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
      `https://www.carrefour.com.ar`,
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
