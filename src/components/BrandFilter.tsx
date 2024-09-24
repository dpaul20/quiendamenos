import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrand,
  onBrandChange,
}) => {
  if (brands.length === 0) {
    return null;
  }
  return (
    <div className="my-4 w-1/3">
      <Select value={selectedBrand} onValueChange={onBrandChange}>
        <SelectTrigger className="border rounded p-2">
          <SelectValue placeholder="Todas las marcas">
            {selectedBrand || "Todas las marcas"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Marcas</SelectLabel>
            <SelectItem value="Todas las marcas">Todas las marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BrandFilter;
