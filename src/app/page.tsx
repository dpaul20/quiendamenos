"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ProductList from "@/components/ProductList";
import { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      // Ordenar los productos por menor precio
      const sortedResults = results.sort((a: Product, b: Product) => a.price - b.price);
      console.log("sortedResults:", sortedResults);
      setProducts(sortedResults);
      setFilteredProducts(sortedResults);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">
        Comparador de Productos Electrónicos
      </h1>
      <SearchForm onSearch={handleSearch} />
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
