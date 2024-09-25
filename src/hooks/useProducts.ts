import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { sortProductsByPrice } from "@/lib/sorts";
import { updateUnknownBrands } from "@/lib/unkonw-brands";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const handleSearch = async (productName: string) => {
    setIsLoading(true);
    try {
      console.log("Searching for:", productName);
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: productName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const results = await response.json();
      const productsWithNumericPrices = results.map((product: Product) => ({
        ...product,
        price: Number(product.price),
      }));

      const updatedProducts = updateUnknownBrands(productsWithNumericPrices);
      const sortedResults = sortProductsByPrice(updatedProducts);

      setProducts(sortedResults);
      setFilteredProducts(sortedResults);
      setSelectedBrand("Todas las marcas");
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
  };

  useEffect(() => {
    if (selectedBrand && selectedBrand !== "Todas las marcas") {
      const filtered = products.filter(
        (product) => product.brand === selectedBrand
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedBrand, products]);

  return {
    products,
    filteredProducts,
    isLoading,
    selectedBrand,
    handleSearch,
    handleBrandChange,
  };
};
