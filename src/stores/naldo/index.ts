import axios from "axios";
import { capitalize } from "@/lib/capitalize";
import { vtexProduct } from "@/types/vtex-product";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

const formatProductNaldo = (product: vtexProduct): Product => {
  const installments =
    product.items?.[0]?.sellers?.[0]?.commertialOffer?.Installments || [];
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
    url: `https://www.naldo.com.ar${product.link}`,
    image: product.items[0].images[0].imageUrl,
    brand: capitalize(product.brand),
    installment: NumberOfInstallments,
    from: StoreNamesEnum.NALDO,
  };
};

const buildUrlNaldo = (query: string) => {
  const params = new URLSearchParams({
    query,
    count: "20",
    from: "0",
    to: "19",
    locale: "es-AR",
    hideUnavailableItems: "true",
    workspace: "master",
  });
  return `https://www.naldo.com.ar/_v/api/intelligent-search/product_search/v3?${params}`;
};

export async function scrapeNaldo(query: string): Promise<Product[]> {
  const url = buildUrlNaldo(query);
  try {
    const { data } = await axios.get(url);
    const products = data?.products?.map(
      (product: vtexProduct) => formatProductNaldo(product),
    );
    if (!products) return [];
    return products;
  } catch (error) {
    console.error("Error fetching products from Naldo:", error);
    return [];
  }
}
