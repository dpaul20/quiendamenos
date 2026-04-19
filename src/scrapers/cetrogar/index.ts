import { load } from "cheerio";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";

export async function scrapeCetrogar(query: string): Promise<Product[]> {
  const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=${query}`;
  try {
    const { data } = await httpClient.get(url);
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
          .replaceAll(/[^\d,.-]/g, "")
          .replaceAll(".", "")
          .replace(",", ".");

        const imageStyle = $(item).find(".product-image-photo").attr("style");
        const imageUrlMatch = /url\(['"]?(.*?)['"]?\)/.exec(imageStyle ?? "");
        const imageUrl = imageUrlMatch
          ? imageUrlMatch[1]
          : "https://placehold.co/300x200";
        const url = $(item).find("a").attr("href");

        const installmentText = $(item)
          .find(".installment-info > span.value > span.installment-count")
          .text()
          .trim();
        const installment = installmentText ? Number(installmentText) : 0;

        return {
          name,
          price: Number(price),
          from: StoreNamesEnum.CETROGAR,
          image: imageUrl,
          url,
          brand: "Unknown",
          installment,
        };
      })
      .get();

    if (!products) return [];
    return products;
  } catch (error) {
    console.error("Error fetching products from Cetrogar:", error);
    return [];
  }
}
