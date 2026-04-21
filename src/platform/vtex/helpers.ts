import { capitalize } from "@/lib/capitalize";
import { vtexProduct } from "@/types/vtex-product";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";

export type VtexInstallment =
  vtexProduct["items"][number]["sellers"][number]["commertialOffer"]["Installments"][number];

/**
 * Devuelve la CSI representativa: la moda del máximo sin interés por medio de pago.
 * Excluye cuotas de 1 (siempre 0%) y promos bancarias que inflan el máximo absoluto
 * (ej: Ahora 20 de un solo banco cuando el resto de los medios ofrece 12).
 * En empate de frecuencia gana el valor más bajo (más conservador).
 */
export function getMaxFreeInstallments(
  installments: VtexInstallment[],
): number {
  const maxPerSystem = new Map<string, number>();
  for (const i of installments) {
    if (i.InterestRate !== 0 || i.NumberOfInstallments <= 1) continue;
    const cur = maxPerSystem.get(i.PaymentSystemName) ?? 0;
    if (i.NumberOfInstallments > cur) {
      maxPerSystem.set(i.PaymentSystemName, i.NumberOfInstallments);
    }
  }

  if (maxPerSystem.size === 0) return 0;

  const freq = new Map<number, number>();
  for (const v of maxPerSystem.values()) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }

  let result = 0;
  let topFreq = 0;
  for (const [value, count] of freq) {
    if (count > topFreq || (count === topFreq && value < result)) {
      result = value;
      topFreq = count;
    }
  }

  return result;
}

/**
 * Construye la URL REST de VTEX Intelligent Search para un dominio y consulta dados.
 * Carrefour omite el workspace, por eso es opcional (se omite cuando es undefined).
 */
export function buildVtexIsUrl(
  domain: string,
  query: string,
  workspace?: string,
): string {
  const params = new URLSearchParams({
    query,
    count: "20",
    from: "0",
    to: "19",
    locale: "es-AR",
    hideUnavailableItems: "true",
    ...(workspace ? { workspace } : {}),
  });
  return `${domain}/_v/api/intelligent-search/product_search/v3?${params}`;
}

/**
 * Patrón para rutas de categorías VTEX no electrónicas.
 * Se usa para filtrar productos de supermercado/hogar en tiendas de catálogo mixto.
 */
export const NON_ELECTRONICS_PATTERN =
  /\/(supermercado|limpieza|alimentos|bebidas|higiene|bazar|ferretería|jardín|mascotas)/i;

export function isElectronicsProduct(product: vtexProduct): boolean {
  if (!product.categories?.length) return true;
  return !product.categories.some((cat) =>
    NON_ELECTRONICS_PATTERN.test(cat),
  );
}

/**
 * Mapea un vtexProduct al shape compartido Product.
 * Se puede pasar `installments` explícitas para sobreescribir el default (items[0].sellers[0]) —
 * útil para tiendas como Carrefour que eligen el vendedor por defecto.
 */
export function formatVtexProduct(
  product: vtexProduct,
  store: StoreNamesEnum,
  domain: string,
  installments?: VtexInstallment[],
): Product {
  const allInstallments =
    installments ??
    product.items?.[0]?.sellers?.[0]?.commertialOffer?.Installments ??
    [];
  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `${domain}${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    installment: getMaxFreeInstallments(allInstallments),
    from: store,
  };
}

/**
 * Fábrica que devuelve un scraper VTEX IS para una tienda dada.
 * Elimina la duplicación entre tiendas que usan el mismo endpoint (Naldo, OnCity, etc.).
 */
export function createVtexScraper(
  domain: string,
  storeName: StoreNamesEnum,
  workspace = "master",
): (query: string) => Promise<Product[]> {
  return async (query: string): Promise<Product[]> => {
    const url = buildVtexIsUrl(domain, query, workspace);
    try {
      const { data } = await httpClient.get(url);
      return (data?.products ?? ([] as vtexProduct[]))
        .filter(isElectronicsProduct)
        .map((p: vtexProduct) => formatVtexProduct(p, storeName, domain));
    } catch (error) {
      console.error(`[${storeName}] Error al obtener productos:`, error);
      return [];
    }
  };
}


