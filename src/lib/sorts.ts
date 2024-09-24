import { Product } from "../types/product";

// Ordena los productos por precio
export const sortProductsByPrice = (products: Product[]): Product[] => {
  return products.sort((a, b) => a.price - b.price);
};
