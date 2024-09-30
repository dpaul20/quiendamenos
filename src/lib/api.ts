import { Product } from "@/types/product";

export async function getProduct(productName: string) {
  const response = await fetch(`/api/scrape?query=${productName}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scrape");
  }

  const results = await response.json();
  const productsWithNumericPrices = results.map((product: Product) => ({
    ...product,
    price: Number(product.price),
  }));

  // const updatedProducts = updateUnknownBrands(productsWithNumericPrices);
  // const sortedProducts = sortProductsByPrice(updatedProducts);
  return productsWithNumericPrices;
}
