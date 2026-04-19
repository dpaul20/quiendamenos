import { load } from "cheerio";
import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";

interface JsonLdOffer {
  "@type": string;
  name?: string;
  brand?: { "@type": string; name?: string } | string;
  price?: number;
  url?: string;
  image?: string | string[];
}

interface JsonLdDocument {
  "@graph"?: JsonLdOffer[];
  itemListElement?: { item?: JsonLdOffer }[];
}

/**
 * Extrae un mapa title→brand desde los bloques JSON-LD embebidos en el HTML de ML.
 * ML incluye schema.org/ItemList o schema.org/Product con el campo brand.
 */
function extraerMarcasDesdeJsonLd(html: string): Map<string, string> {
  const marcasPorTitulo = new Map<string, string>();
  try {
    const $ = load(html);
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).html();
      if (!raw) return;
      const json = JSON.parse(raw) as JsonLdDocument | JsonLdOffer;
      let items: JsonLdOffer[];
      if ("@graph" in json && Array.isArray(json["@graph"])) {
        items = json["@graph"];
      } else if ("itemListElement" in json && Array.isArray(json.itemListElement)) {
        items = (json.itemListElement ?? [])
          .map((e) => e.item)
          .filter(Boolean) as JsonLdOffer[];
      } else {
        items = [json as JsonLdOffer];
      }
      for (const item of items) {
        if (!item.name) continue;
        const brand =
          typeof item.brand === "string"
            ? item.brand
            : item.brand?.name ?? null;
        if (brand) marcasPorTitulo.set(item.name.trim(), brand);
      }
    });
  } catch {
    // JSON-LD malformado — continuamos sin marcas
  }
  return marcasPorTitulo;
}

export async function scrapeMercadoLibre(query: string): Promise<Product[]> {
  const formattedQuery = query.replaceAll(/\s+/g, "-");
  const url = `https://listado.mercadolibre.com.ar/${encodeURIComponent(formattedQuery)}`;
  try {
    const { data } = await httpClient.get<string>(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "es-AR,es;q=0.9",
      },
    });
    const $ = load(data);
    const marcasPorTitulo = extraerMarcasDesdeJsonLd(data);

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

        // Intentar brand desde JSON-LD, luego desde el elemento de marca del card
        const brandRaw =
          marcasPorTitulo.get(name) ||
          $(item).find(".poly-component__brand").text().trim() ||
          "Unknown";

        if (!name) return null;
        return {
          name,
          price: Number(priceText),
          from: StoreNamesEnum.MERCADOLIBRE,
          image: imageUrl,
          url: productUrl,
          brand: capitalize(brandRaw),
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

