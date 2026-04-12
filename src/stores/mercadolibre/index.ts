import axios from "axios";
import { load } from "cheerio";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

export async function scrapeMercadoLibre(query: string): Promise<Product[]> {
  const formattedQuery = query.replaceAll(/\s+/g, "-");
  const url = `https://listado.mercadolibre.com.ar/${encodeURIComponent(formattedQuery)}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    const $ = load(data);

    const products: Product[] = $(".poly-card")
      .map((_, item) => {
        const anchor = $(item).find("a.poly-component__title");
        const name = anchor.text().trim();
        const productUrl = anchor.attr("href") ?? "";
        const priceText = $(item)
          .find(".andes-money-amount__fraction")
          .first()
          .text()
          .trim()
          .replaceAll(".", "");
        const imageUrl =
          $(item).find("img.poly-component__picture").attr("src") ??
          $(item).find("img").attr("data-src") ??
          "https://placehold.co/300x200";

        if (!name) return null;
        return {
          name,
          price: Number(priceText),
          from: StoreNamesEnum.MERCADOLIBRE,
          image: imageUrl,
          url: productUrl,
          brand: "Unknown",
        };
      })
      .get()
      .filter((p) => p !== null) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching products from MercadoLibre:", error);
    return [];
  }
}
