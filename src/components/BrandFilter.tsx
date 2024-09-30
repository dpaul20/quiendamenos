"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/store/products.store";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
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
import { Skeleton } from "./ui/skeleton";

export default function BrandFilter() {
  const [open, setOpen] = React.useState(false);

  const { brands, selectedBrand, isLoading } = useProductsStore();
  const { setSelectedBrand } = useProductsStore();

  if (brands.length === 0) return null;

  if (isLoading) return <Skeleton className="w-[200px] h-9" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedBrand || "Marca"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar marca..." className="h-9" />
          <CommandList>
            <CommandEmpty>No hay marcas.</CommandEmpty>
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand}
                  value={brand}
                  onSelect={(selectedBrand) => {
                    setSelectedBrand(
                      selectedBrand === brand ? selectedBrand : ""
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
  );
}
