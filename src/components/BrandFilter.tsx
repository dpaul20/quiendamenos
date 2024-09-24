"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [open, setOpen] = React.useState(false);

  // Filtrar marcas vacías
  const validBrands = brands.filter((brand) => brand.trim() !== "");

  return (
    <div className="my-4 w-1/3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedBrand
              ? validBrands.find((brand) => brand === selectedBrand) ??
                "Todas las marcas"
              : "Todas las marcas"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Buscar marca..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró la marca.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="Todas las marcas"
                  onSelect={() => {
                    onBrandChange("Todas las marcas");
                    setOpen(false);
                  }}
                >
                  Todas las marcas
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedBrand === "Todas las marcas"
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
                {validBrands.map((brand) => (
                  <CommandItem
                    key={brand}
                    value={brand}
                    onSelect={(currentValue) => {
                      onBrandChange(
                        currentValue === selectedBrand ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {brand}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedBrand === brand ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BrandFilter;
