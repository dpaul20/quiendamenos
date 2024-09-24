"use client";

import SearchForm from "@/components/SearchForm";
import ProductList from "@/components/ProductList";
import BrandFilter from "@/components/BrandFilter";
import { Loader2 } from "lucide-react";
import { capitalize } from "@/lib/capitalize";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const {
    products,
    filteredProducts,
    isLoading,
    selectedBrand,
    handleSearch,
    handleBrandChange,
  } = useProducts();

  const brands = Array.from(
    new Set(products.map((product) => capitalize(product.brand)))
  );

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">
        Comparador de Productos Electrónicos
      </h1>
      <SearchForm onSearch={handleSearch} />
      <BrandFilter
        brands={brands}
        selectedBrand={selectedBrand}
        onBrandChange={handleBrandChange}
      />
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
