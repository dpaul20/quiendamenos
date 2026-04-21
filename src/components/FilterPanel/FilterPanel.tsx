"use client";
import { useProductsStore } from "@/store/productsStore";
import { countActiveFilters } from "@/store/selectors";
import { StoreFilter } from "@/components/StoreFilter";
import BrandFilter from "@/components/BrandFilter";
import { PriceRangeFilter } from "@/components/PriceRangeFilter";
import { CSIFilter } from "@/components/CSIFilter";
import { FiltersBar } from "@/components/FiltersBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function useActiveFilterCount() {
  const selectedStores = useProductsStore((s) => s.selectedStores);
  const selectedBrand = useProductsStore((s) => s.selectedBrand);
  const priceMin = useProductsStore((s) => s.priceMin);
  const priceMax = useProductsStore((s) => s.priceMax);
  const selectedCSI = useProductsStore((s) => s.selectedCSI);

  return countActiveFilters({ selectedStores, selectedBrand, priceMin, priceMax, selectedCSI });
}

function FiltersContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Tienda</span>
        <StoreFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Marca</span>
        <BrandFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Precio</span>
        <PriceRangeFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Cuotas sin interés</span>
        <CSIFilter />
      </div>
    </div>
  );
}

export function FilterPanel() {
  const activeCount = useActiveFilterCount();
  const clearFilters = useProductsStore((s) => s.clearFilters);
  const products = useProductsStore((s) => s.products);

  if (products.length === 0) return null;

  return (
    <>
      {/* Desktop / Tablet — stores (shrink-0) | FiltersBar (flex-1) */}
      <div className="hidden sm:flex items-center gap-2 h-14 py-2">
        <div className="flex shrink-0 items-center gap-1.5 overflow-hidden">
          <StoreFilter />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <FiltersBar />
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Limpiar ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Mobile — trigger bottom sheet */}
      <div className="sm:hidden flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <button className="h-9 px-4 text-sm rounded-full border border-border bg-background text-foreground flex items-center gap-2">
              Filtros
              {activeCount > 0 && (
                <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {activeCount}
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
            </DialogHeader>
            <FiltersContent />
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Limpiar filtros ({activeCount})
              </button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
