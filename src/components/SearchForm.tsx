"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductsStore } from "@/store/products.store";
import { Loader2, Search } from "lucide-react";
import { ALL } from "@/lib/constants";

export default function SearchForm() {
  const { getProducts, setIsLoading, setSelectedBrand } = useProductsStore();
  const { isLoading } = useProductsStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const productName = (form.elements[0] as HTMLInputElement).value;
    getProducts(productName);
    setIsLoading(true);
    setSelectedBrand(ALL)
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-row gap-2 max-w-3xl justify-end"
    >
      <Input
        type="text"
        placeholder="Nombre del producto..."
        required
        className="rounded-md w-2/3 text-base"
      />
      <Button
        type="submit"
        className="rounded-md w-1/3"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Buscando..." : "Buscar"}
      </Button>
    </form>
  );
}
