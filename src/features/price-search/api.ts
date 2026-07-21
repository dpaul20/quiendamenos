import { Product } from "@/types/product";
import { ScrapeApiError, userMessageForStatus } from "./errors";

export async function getProduct(productName: string) {
  const response = await fetch(
    `/api/scrape?query=${encodeURIComponent(productName)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new ScrapeApiError(
      userMessageForStatus(response.status),
      response.status,
    );
  }

  const results = await response.json();
  const productsWithNumericPrices = results.map((product: Product) => ({
    ...product,
    price: Number(product.price),
  }));

  return productsWithNumericPrices;
}
