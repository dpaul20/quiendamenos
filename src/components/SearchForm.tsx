import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
  onSearch: (productName: string) => void;
}

export default function SearchForm({ onSearch }: Readonly<SearchFormProps>) {
  const [productName, setProductName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(productName);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-row gap-2 w-full max-w-3xl mx-auto">
      <Input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Ingrese el nombre del producto"
        required
        className="w-full border-green-300 focus:ring-green-500 focus:border-green-500 rounded-full"
      />
      <Button type="submit" className="w-1/5 text-white rounded-full">
        Buscar
      </Button>
    </form>
  );
}
