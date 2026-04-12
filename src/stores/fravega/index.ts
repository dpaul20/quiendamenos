import axios from "axios";
import { load } from "cheerio";
import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

interface FravegaNextProduct {
  id?: string;
  title?: string;
  brand?: string;
  price?: number;
  images?: string[];
  url?: string;
}

interface FravegaNextData {
  props?: {
    pageProps?: {
      results?: FravegaNextProduct[];
    };
  };
}

/** Extrae el mapa id→brand desde el JSON __NEXT_DATA__ embebido por Next.js en el HTML. */
function extraerMarcasDesdeNextData(
  html: string,
): Map<string, string> {
  const marcasPorId = new Map<string, string>();
  try {
    const $ = load(html);
    const raw = $("#__NEXT_DATA__").html();
    if (!raw) return marcasPorId;
    const nextData = JSON.parse(raw) as FravegaNextData;
    const results = nextData?.props?.pageProps?.results ?? [];
    for (const p of results) {
      if (p.id && p.brand) {
        marcasPorId.set(p.id, p.brand);
      }
    }
  } catch {
    // Si el JSON no tiene la estructura esperada, devolvemos el mapa vacío
  }
  return marcasPorId;
}

export async function scrapeFravega(query: string): Promise<Product[]> {
  const url = `https://www.fravega.com/l/?keyword=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get<string>(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://www.fravega.com/",
      },
    });
    const $ = load(data);
    const marcasPorId = extraerMarcasDesdeNextData(data);

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
        // El id del producto está en la URL: /p/{id}-...
        const productId = relativeUrl.split("/p/")[1]?.split("-")[0] ?? "";
        const brand = capitalize(
          marcasPorId.get(productId) ?? "Unknown",
        );

        if (!name) return null;
        return {
          name,
          price: Number(priceText),
          from: StoreNamesEnum.FRAVEGA,
          image: imageUrl,
          url: `https://www.fravega.com${relativeUrl}`,
          brand,
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
