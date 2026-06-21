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
    <div className="flex flex-wrap items-center gap-2">
      {/* Brand pill */}
      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={brandOpen}
            aria-label="Seleccionar marca"
            className="flex h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted"
          >
            <span
              className={cn(
                "whitespace-nowrap leading-none",
                selectedBrand === ALL
                  ? "text-muted-foreground"
                  : "font-medium text-foreground",
              )}
            >
              {selectedBrand === ALL ? "Marca" : selectedBrand}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
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
                      const matched =
                        brands.find(
                          (b) => b.toLowerCase() === value.toLowerCase(),
                        ) ?? ALL;
                      setSelectedBrand(
                        selectedBrand === matched ? ALL : matched,
                      );
                      setBrandOpen(false);
                    }}
                  >
                    {brand}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedBrand === brand ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Price pill */}
      <div className="flex h-[40px] shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
        <span className="shrink-0 text-muted-foreground">$</span>
        <input
          type="number"
          min={0}
          value={priceMin ?? ""}
          onChange={(e) =>
            setPriceMin(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="desde"
          className="w-[52px] bg-transparent text-sm font-medium leading-none text-foreground outline-none [appearance:textfield] placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio mínimo"
        />
        <span className="shrink-0 text-muted-foreground">–</span>
        <input
          type="number"
          min={0}
          value={priceMax ?? ""}
          onChange={(e) =>
            setPriceMax(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="hasta"
          className="w-[52px] bg-transparent text-sm font-medium leading-none text-foreground outline-none [appearance:textfield] placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio máximo"
        />
      </div>

      {/* Cuotas segmented control */}
      {csiOptions.length > 1 && (
        <fieldset className="m-0 flex shrink-0 items-center gap-0.5 rounded-full border-0 bg-secondary p-1">
          <legend className="sr-only">Cuotas sin interés</legend>
          {csiOptions.map(({ label, value }) => {
            const active = selectedCSI === value;
            return (
              <button
                key={label}
                onClick={() => setSelectedCSI(value)}
                aria-pressed={active}
                className={cn(
                  "h-8 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
