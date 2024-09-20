"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ProductList from "@/components/ProductList";
import { Product } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearch = async (productName: string) => {
    const urls = [
      `https://www.naldo.com.ar/lavavajillas?_q=${productName}&map=ft`,
      `https://www.musimundo.com/mi-musimundo/search?text=${productName}`,
      `https://www.cetrogar.com.ar/catalogsearch/result/?q=${productName}`,
      `https://www.fravega.com/l/?keyword=${productName}`,
    ];
    console.log("Searching for:", productName);
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
    }
  };

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">
        Comparador de Productos Electrónicos
      </h1>
      <SearchForm onSearch={handleSearch} />

      <ProductList products={filteredProducts} />
    </main>
  );
}
