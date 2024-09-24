"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import ProductList from "@/components/ProductList";
import { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
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
      // Asegurarse de que los precios sean números
      const productsWithNumericPrices = results.map((product: Product) => ({
        ...product,
        price: Number(product.price),
      }));
      // Ordenar los productos por menor precio
      const sortedResults = productsWithNumericPrices.sort(
        (a: Product, b: Product) => a.price - b.price
      );

      setProducts(sortedResults);
      setFilteredProducts(sortedResults);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = event.target.value;
    setSelectedBrand(brand);
  };

  useEffect(() => {
    if (selectedBrand) {
      const filtered = products.filter(
        (product) => product.brand === selectedBrand
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedBrand, products]);

  // Obtener la lista de marcas disponibles
  const brands = Array.from(new Set(products.map((product) => product.brand)));

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">
        Comparador de Productos Electrónicos
      </h1>
      <SearchForm onSearch={handleSearch} />
      <div className="mb-4">
        <label htmlFor="brand" className="mr-2">
          Filtrar por marca:
        </label>
        <select
          id="brand"
          value={selectedBrand}
          onChange={handleBrandChange}
          className="border rounded p-2"
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </main>
  );
}
