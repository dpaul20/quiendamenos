"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductsStore } from "@/store/products.store";
import { Loader2, Search } from "lucide-react";

export default function SearchForm() {
  const { getProducts, setIsLoading } = useProductsStore();
  const { isLoading } = useProductsStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const productName = (form.elements[0] as HTMLInputElement).value;
    getProducts(productName);
    setIsLoading(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-row gap-2 w-full max-w-3xl mx-auto"
    >
      <Input
        type="text"
        placeholder="Ingrese el nombre del producto"
        required
        className="w-full border-green-300 focus:ring-green-500 focus:border-green-500 rounded-full"
      />
      <Button
        type="submit"
        className="w-1/5 text-white rounded-full"
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
