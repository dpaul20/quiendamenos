"use client";
import { useProductsStore } from "@/store/productsStore";
import { Loader2, Search } from "lucide-react";
import { ALL } from "@/features/price-search/constants";

export default function SearchForm() {
  const { getProducts, setIsLoading, setSelectedBrand, isLoading } =
    useProductsStore();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const productName = (form.elements[0] as HTMLInputElement).value;
    getProducts(productName);
    setIsLoading(true);
    setSelectedBrand(ALL);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 gap-2 items-center h-[46px]">
      <div className="flex flex-1 items-center gap-2 bg-card border border-border rounded-lg px-3 h-full">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Nombre del producto..."
          required
          className="flex-1 text-base bg-transparent outline-none text-foreground placeholder:text-muted-foreground min-w-0"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="h-full px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shrink-0 flex items-center gap-2 disabled:opacity-60 transition-opacity"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}
