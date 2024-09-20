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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Ingrese el nombre del producto"
        required
        className="w-full"
      />
      <Button type="submit" className="w-full">
        Buscar
      </Button>
    </form>
  );
}
