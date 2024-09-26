"use client";

import SearchForm from "../components/SearchForm";
import ProductList from "../components/ProductList";
import BrandFilter from "../components/BrandFilter";
import { Loader2 } from "lucide-react";
import { capitalize } from "../lib/capitalize";
import Disclaimer from "../components/Disclaimer";
import Header from "../components/Header";
import FooterAlert from "../components/FooterAlert";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { updateUnknownBrands } from "@/lib/unkonw-brands";
import { sortProductsByPrice } from "@/lib/sorts";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const handleSearch = async (productName: string) => {
    setIsLoading(true);
    setProducts([]);
    setFilteredProducts([]);
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
      const sortedProducts = sortProductsByPrice(updatedProducts);

      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
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
        (product) => product.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedBrand, products]);

  const brands = Array.from(
    new Set(products.map((product) => capitalize(product.brand)))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="container mx-auto space-y-4 px-4 my-3 lg:p-0">
      <Disclaimer />
      <Header />

      <SearchForm onSearch={handleSearch} />

      {filteredProducts.length > 0 && (
        <>
          <BrandFilter
            brands={brands}
            selectedBrand={selectedBrand}
            onBrandChange={handleBrandChange}
          />
          <Badge variant="secondary">
            Productos ordenados por menor precio
          </Badge>

          <ProductList products={filteredProducts} />
        </>
      )}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      <FooterAlert />
    </main>
  );
}
