import { knownBrands } from "./constants";
import { Product } from "../types/product";

// Actualiza las marcas "unknown" utilizando las marcas conocidas
export const updateUnknownBrands = (products: Product[]): Product[] => {
  return products.map((product) => {
    if (product.brand.toLowerCase() === "unknown") {
      const foundBrand = knownBrands.find((brand: string) =>
        product.name.toLowerCase().includes(brand.toLowerCase())
      );
      if (foundBrand) {
        return { ...product, brand: foundBrand };
      }
    }
    return product;
  });
};
