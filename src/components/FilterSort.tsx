interface FilterSortProps {
  onFilter: (category: string) => void;
  onSort: (sortType: string) => void;
}

export default function FilterSort({ onFilter, onSort }: Readonly<FilterSortProps>) {
  return (
    <div className="mb-4 flex space-x-4">
      <select
        onChange={(e) => onFilter(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      >
        <option value="">Todos los productos</option>
        <option value="laptop">Laptops</option>
        <option value="smartphone">Smartphones</option>
        <option value="tv">TVs</option>
      </select>
      <select
        onChange={(e) => onSort(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      >
        <option value="price_asc">Precio: Menor a Mayor</option>
        <option value="price_desc">Precio: Mayor a Menor</option>
        <option value="name_asc">Nombre: A-Z</option>
        <option value="name_desc">Nombre: Z-A</option>
      </select>
    </div>
  );
}
