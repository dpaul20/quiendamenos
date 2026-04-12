import { Product } from "../types/product";

// Actualiza las marcas "unknown" usando las marcas que ya existen en los propios productos
export const updateUnknownBrands = (products: Product[]): Product[] => {
  const marcasConocidas = Array.from(
    new Set(
      products
        .filter((p) => p.brand.toLowerCase() !== "unknown")
        .map((p) => p.brand.toUpperCase()),
    ),
  );

  return products.map((product) => {
    if (product.brand.toLowerCase() === "unknown") {
      const marcaEncontrada = marcasConocidas.find((marca) =>
        product?.name?.toLowerCase().includes(marca.toLowerCase()),
      );
      if (marcaEncontrada) {
        return { ...product, brand: marcaEncontrada };
      }
    }
    return product;
  });
};
