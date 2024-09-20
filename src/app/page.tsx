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
    const urls = [
      `https://www.naldo.com.ar/lavavajillas?_q=${productName}&map=ft`,
      `https://www.musimundo.com/mi-musimundo/search?text=${productName}`,
      `https://www.cetrogar.com.ar/catalogsearch/result/?q=${productName}`,
      `https://www.fravega.com/l/?keyword=${productName}`,
    ];
    console.log("Searching for:", productName);
    setIsLoading(true);
    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch("/api/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          return response.json();
        })
      );

      const combinedResults = results.flat();
      setProducts(combinedResults);
      setFilteredProducts(combinedResults);
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
