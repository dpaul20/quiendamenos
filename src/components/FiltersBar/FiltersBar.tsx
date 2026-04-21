"use client";
import React, { useMemo } from "react";
import { useProductsStore } from "@/store/productsStore";
import { getAvailableCSI } from "@/store/selectors";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { ALL } from "@/features/price-search/constants";
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

function Divider() {
  return <div className="w-px h-7 bg-border shrink-0" />;
}

export function FiltersBar() {
  const [brandOpen, setBrandOpen] = React.useState(false);

  const products = useProductsStore((s) => s.products);
  const brands = useProductsStore((s) => s.brands);
  const selectedBrand = useProductsStore((s) => s.selectedBrand);
  const setSelectedBrand = useProductsStore((s) => s.setSelectedBrand);
  const priceMin = useProductsStore((s) => s.priceMin);
  const priceMax = useProductsStore((s) => s.priceMax);
  const setPriceMin = useProductsStore((s) => s.setPriceMin);
  const setPriceMax = useProductsStore((s) => s.setPriceMax);
  const selectedCSI = useProductsStore((s) => s.selectedCSI);
  const setSelectedCSI = useProductsStore((s) => s.setSelectedCSI);

  const csiOptions = useMemo(() => getAvailableCSI(products), [products]);

  return (
    <div className="h-[46px] bg-muted border border-border rounded-xl flex items-center overflow-hidden flex-1 min-w-0">
      {/* Marca */}
      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={brandOpen}
            aria-label="Seleccionar marca"
            className="flex items-center gap-1.5 px-3 h-full hover:bg-accent transition-colors shrink-0"
          >
            <span className={cn(
              "text-sm leading-none whitespace-nowrap",
              selectedBrand === ALL ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              {selectedBrand === ALL ? "Marca" : selectedBrand}
            </span>
            <ChevronDownIcon className="h-3 w-3 shrink-0 text-primary" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]" align="start">
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
                      const matched = brands.find((b) => b.toLowerCase() === value.toLowerCase()) ?? ALL;
                      setSelectedBrand(selectedBrand === matched ? ALL : matched);
                      setBrandOpen(false);
                    }}
                  >
                    {brand}
                    <CheckIcon className={cn("ml-auto h-4 w-4", selectedBrand === brand ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Divider />

      {/* Precio — Desde */}
      <label className="flex flex-col gap-0.5 px-3 py-1.5 min-w-[80px]">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Desde</span>
        <input
          type="number"
          min={0}
          value={priceMin ?? ""}
          onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
          placeholder="$ 0"
          className="text-sm font-medium text-foreground leading-none bg-transparent outline-none w-full placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio mínimo"
        />
      </label>

      <Divider />

      {/* Precio — Hasta */}
      <label className="flex flex-col gap-0.5 px-3 py-1.5 min-w-[80px]">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Hasta</span>
        <input
          type="number"
          min={0}
          value={priceMax ?? ""}
          onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
          placeholder="$ ∞"
          className="text-sm font-medium text-foreground leading-none bg-transparent outline-none w-full placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio máximo"
        />
      </label>

      {csiOptions.length > 1 && (
        <>
          <Divider />
          <div
            className="flex flex-col gap-0.5 px-3 py-1.5"
            role="group"
            aria-label="Cuotas sin interés"
          >
            <span className="text-[10px] text-muted-foreground leading-none">Cuotas</span>
            <div className="flex items-center gap-2.5">
              {csiOptions.map(({ label, value }) => {
                const active = selectedCSI === value;
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedCSI(value)}
                    className={cn(
                      "text-sm leading-none transition-colors",
                      active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
