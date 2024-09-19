import { useState } from "react";

interface SearchFormProps {
  onSearch: (url: string) => void;
}

export default function SearchForm({ onSearch }: Readonly<SearchFormProps>) {
  const [productName, setProductName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(productName);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Ingrese el nombre del producto"
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Buscar
      </button>
    </form>
  );
}
