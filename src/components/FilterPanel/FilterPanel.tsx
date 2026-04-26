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

  return countActiveFilters({
    selectedStores,
    selectedBrand,
    priceMin,
    priceMax,
    selectedCSI,
  });
}

function FiltersContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Tienda
        </span>
        <StoreFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Marca</span>
        <BrandFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Precio
        </span>
        <PriceRangeFilter />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Cuotas sin interés
        </span>
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
      <div className="hidden h-14 items-center gap-2 py-2 sm:flex">
        <div className="flex shrink-0 items-center gap-1.5 overflow-hidden">
          <StoreFilter />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <FiltersBar />
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="shrink-0 whitespace-nowrap text-sm text-muted-foreground underline transition-colors hover:text-foreground"
            >
              Limpiar ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Mobile — trigger bottom sheet */}
      <div className="flex items-center gap-2 sm:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm text-foreground">
              Filtros
              {activeCount > 0 && (
                <span
                  data-testid="active-filters-count"
                  className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                >
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
                className="mt-2 text-sm text-muted-foreground underline transition-colors hover:text-foreground"
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
