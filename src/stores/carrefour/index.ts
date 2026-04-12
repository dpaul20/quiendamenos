import axios from "axios";
import { load } from "cheerio";
import { capitalize } from "@/lib/capitalize";
import { vtexProduct } from "@/types/vtex-product";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Extracts products from the VTEX IO Apollo cache embedded in category-page HTML. */
function extractFromApolloCache(html: string): Product[] {
  const $ = load(html);
  let cache: Record<string, unknown> = {};

  $("script:not([src])").each((_, el) => {
    if (cache && Object.keys(cache).length > 0) return; // already found
    const content = $(el).html() ?? "";
    if (!/"productName":"/.test(content)) return;
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      if (Object.keys(parsed).some((k) => k.startsWith("Product:"))) {
        cache = parsed;
      }
    } catch {
      // not valid JSON – keep scanning
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

const formatProductCarrefour = (product: vtexProduct): Product => {
  const sellers = product.items?.[0]?.sellers || [];
  const defaultSeller = sellers.find((seller) => seller.sellerDefault);

  const installments = defaultSeller?.commertialOffer?.Installments || [];
  const validInstallments = installments.filter(
    (installment) => installment.InterestRate === 0,
  );
  const maxInstallment = validInstallments.reduce(
    (max, installment) => {
      return installment.NumberOfInstallments > max.NumberOfInstallments
        ? installment
        : max;
    },
    { NumberOfInstallments: 0, InterestRate: 0 },
  );

  const NumberOfInstallments = maxInstallment.NumberOfInstallments;

  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `https://www.carrefour.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    installment: NumberOfInstallments,
    from: StoreNamesEnum.CARREFOUR,
  };
};

const buildUrlCarrefour = (query: string) => {
  const params = new URLSearchParams({
    query,
    count: "20",
    from: "0",
    to: "19",
    locale: "es-AR",
    hideUnavailableItems: "true",
  });
  return `https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3?${params}`;
};

export async function scrapeCarrefour(query: string): Promise<Product[]> {
  const url = buildUrlCarrefour(query);
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    // IS API returned products directly → standard path
    if (data?.products?.length > 0) {
      return (data.products as vtexProduct[]).map(formatProductCarrefour);
    }

    // IS API configured a redirect to a category page → scrape Apollo cache
    if (data?.redirect) {
      const categoryUrl = `https://www.carrefour.com.ar${data.redirect}`;
      const { data: html } = await axios.get<string>(categoryUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "es-AR,es;q=0.9",
        },
      });
      return extractFromApolloCache(html);
    }

    return [];
  } catch (error) {
    console.error("Error fetching products from Carrefour:", error);
    return [];
  }
}
