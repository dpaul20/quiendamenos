import { Product } from "../types/product";

// Ordena los productos por precio
export const sortProductsByPrice = (products: Product[]): Product[] => {
  return products.sort((a, b) => {
    if (!a.price || !b.price) {
      return 0;
    }
    return a.price - b.price
  });
};
