import axios from "axios";
import { capitalize } from "@/lib/capitalize";
import { vtexProduct } from "@/types/vtex-product";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

const BASE_URL = "https://www.oncity.com";

const formatProductOnCity = (product: vtexProduct): Product => {
  const installments =
    product.items?.[0]?.sellers?.[0]?.commertialOffer?.Installments ?? [];
  const validInstallments = installments.filter(
    (installment) => installment.InterestRate === 0,
  );
  const maxInstallment = validInstallments.reduce(
    (max, installment) =>
      installment.NumberOfInstallments > max.NumberOfInstallments
        ? installment
        : max,
    { NumberOfInstallments: 0, InterestRate: 0 },
  );

  return {
    name: product.productName,
    price: Number(product.priceRange.sellingPrice.lowPrice),
    url: `${BASE_URL}${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    installment: maxInstallment.NumberOfInstallments,
    from: StoreNamesEnum.ONCITY,
  };
};

const buildUrl = (query: string) => {
  const params = new URLSearchParams({
    query,
    count: "20",
    from: "0",
    to: "19",
    locale: "es-AR",
    hideUnavailableItems: "true",
    workspace: "master",
  });
  return `${BASE_URL}/_v/api/intelligent-search/product_search/v3?${params}`;
};

export async function scrapeOnCity(query: string): Promise<Product[]> {
  const url = buildUrl(query);
  try {
    const { data } = await axios.get(url);
    const products = data?.products?.map(
      (product: vtexProduct) => formatProductOnCity(product),
    );
    if (!products) return [];
    return products;
  } catch (error) {
    console.error("Error fetching products from OnCity:", error);
    return [];
  }
}
