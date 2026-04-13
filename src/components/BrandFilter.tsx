"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { ALL } from "@/features/price-search/constants";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandFilter() {
  const [open, setOpen] = React.useState(false);
  const { brands, selectedBrand, isLoading, setSelectedBrand } =
    useProductsStore();

  if (brands.length === 0) return null;
  if (isLoading) return <Skeleton className="w-[81px] h-[46px] rounded-md" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className="h-[46px] border border-border rounded-md flex items-center gap-2 pl-3 pr-[10px] text-sm font-medium text-foreground bg-background whitespace-nowrap shrink-0"
        >
          {selectedBrand === ALL ? "Marca" : selectedBrand.toLowerCase()}
          <CaretSortIcon className="h-2 w-2.5 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Buscar marca..." className="h-9" />
          <CommandList>
            <CommandEmpty>No hay marcas.</CommandEmpty>
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand}
                  value={brand}
                  onSelect={(value) => {
                    setSelectedBrand(selectedBrand === value ? ALL : value);
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
  );
}
