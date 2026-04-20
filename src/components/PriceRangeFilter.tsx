"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

export function PriceRangeFilter() {
  const priceMin = useProductsStore((s) => s.priceMin);
  const priceMax = useProductsStore((s) => s.priceMax);
  const setPriceMin = useProductsStore((s) => s.setPriceMin);
  const setPriceMax = useProductsStore((s) => s.setPriceMax);

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        placeholder="Desde $"
        value={priceMin ?? ""}
        onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
        className="w-24 h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label="Precio mínimo"
      />
      <span className="text-muted-foreground text-sm">—</span>
      <input
        type="number"
        min={0}
        placeholder="Hasta $"
        value={priceMax ?? ""}
        onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
        className="w-24 h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label="Precio máximo"
      />
    </div>
  );
}
