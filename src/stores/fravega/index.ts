import axios from "axios";
import { load } from "cheerio";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

export async function scrapeFravega(query: string): Promise<Product[]> {
  const url = `https://www.fravega.com/l/?keyword=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://www.fravega.com/",
      },
    });
    const $ = load(data);

    const products: Product[] = $("article")
      .map((_, item) => {
        const name = $(item)
          .find("[data-test-id='article-title'] span")
          .first()
          .text()
          .trim();
        const priceText = $(item)
          .find("[data-test-id='product-price'] > div > span")
          .text()
          .trim()
          .replaceAll(/[^\d,.-]+/g, "")
          .replaceAll(".", "")
          .replace(",", ".");
        const imageUrl =
          $(item).find("img[src*='images.fravega.com/f300/']").attr("src") ??
          "https://placehold.co/300x200";
        const relativeUrl =
          $(item)
            .find("a[rel='bookmark'][href^='/p/']")            
            .first()
            .attr("href") ?? "";

        if (!name) return null;
        return {
          name,
          price: Number(priceText),
          from: StoreNamesEnum.FRAVEGA,
          image: imageUrl,
          url: `https://www.fravega.com${relativeUrl}`,
          brand: "Unknown",
        };
      })
      .get()
      .filter((p) => p !== null) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching products from Fravega:", error);
    return [];
  }
}
