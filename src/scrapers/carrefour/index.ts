import { load } from "cheerio";
import { capitalize } from "@/lib/capitalize";
import { vtexProduct } from "@/types/vtex-product";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import {
  buildVtexIsUrl,
  formatVtexProduct,
  isElectronicsProduct,
} from "@/platform/vtex/helpers";
import { httpClient } from "@/platform/http";
import { sanitizeUrl } from "@/platform/url";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Extrae productos del caché Apollo de VTEX IO embebido en el HTML de la página de categoría. */
function extractFromApolloCache(html: string): Product[] {
  const $ = load(html);
  let cache: Record<string, unknown> = {};

  $("script:not([src])").each((_, el) => {
    if (cache && Object.keys(cache).length > 0) return; // ya encontrado
    const content = $(el).html() ?? "";
    if (!/"productName":"/.test(content)) return;
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      if (Object.keys(parsed).some((k) => k.startsWith("Product:"))) {
        cache = parsed;
      }
    } catch {
      // JSON inválido – continuar escaneando
    }
  });

  const productKeys = Object.keys(cache).filter((k) =>
    /^Product:sp-\d+-none$/.test(k),
  );

  return productKeys
    .map((key) => {
      const p = cache[key] as {
        productName?: string;
        brand?: string;
        link?: string;
      };
      const sp = cache[`$${key}.priceRange.sellingPrice`] as {
        lowPrice?: number;
      };
      const price = sp?.lowPrice ?? 0;

      let imageUrl = "";
      for (let i = 0; i < 3; i++) {
        const item = cache[
          `${key}.items({"filter":"ALL_AVAILABLE"}).${i}`
        ] as { images?: Array<{ id?: string }> } | undefined;
        if (!item) break;
        const imgRef = item.images?.[0]?.id;
        if (imgRef) {
          const d = cache[imgRef.replace(/^\$/, "")] as {
            imageUrl?: string;
          };
          if (d?.imageUrl) {
            imageUrl = d.imageUrl;
            break;
          }
        }
      }

      if (!p?.productName || !price) return null;

      const result: Product = {
        name: p.productName,
        price,
        url: `https://www.carrefour.com.ar${p.link ?? ""}`,
        image: imageUrl,
        brand: capitalize(p.brand ?? ""),
        from: StoreNamesEnum.CARREFOUR,
      };
      return result;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

const DOMAIN = "https://www.carrefour.com.ar";

const formatProductCarrefour = (product: vtexProduct): Product => {
  const sellers = product.items?.[0]?.sellers ?? [];
  const defaultSeller = sellers.find((s) => s.sellerDefault);
  const installments = defaultSeller?.commertialOffer?.Installments ?? [];
  return formatVtexProduct(product, StoreNamesEnum.CARREFOUR, DOMAIN, installments);
};

export async function scrapeCarrefour(query: string): Promise<Product[]> {
  const url = buildVtexIsUrl(DOMAIN, query);
  try {
    const { data } = await httpClient.get(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    // IS API devolvió productos directamente → flujo estándar
    if (data?.products?.length > 0) {
      return (data.products as vtexProduct[])
        .filter(isElectronicsProduct)
        .map(formatProductCarrefour);
    }

    // IS API configuró una redirección a página de categoría → extraer caché Apollo
    if (data?.redirect) {
      try {
        const redirect: string = data.redirect;
        const resolvedUrl = redirect.startsWith('/')
          ? `https://www.carrefour.com.ar${redirect}`
          : redirect;
        sanitizeUrl(resolvedUrl);
        if (new URL(resolvedUrl).origin !== 'https://www.carrefour.com.ar') {
          console.warn('[carrefour] Redirect origin mismatch, skipping:', resolvedUrl);
          return [];
        }
        const { data: html } = await httpClient.get<string>(resolvedUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "es-AR,es;q=0.9",
          },
        });
        return extractFromApolloCache(html);
      } catch {
        console.warn('[carrefour] Redirect blocked:', data.redirect);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching products from Carrefour:", error);
    return [];
  }
}
