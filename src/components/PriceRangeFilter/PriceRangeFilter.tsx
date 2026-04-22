"use client";
import { useProductsStore } from "@/store/productsStore";

export function PriceRangeFilter() {
  const priceMin = useProductsStore((s) => s.priceMin);
  const priceMax = useProductsStore((s) => s.priceMax);
  const setPriceMin = useProductsStore((s) => s.setPriceMin);
  const setPriceMax = useProductsStore((s) => s.setPriceMax);

  return (
    <div className="h-[46px] border border-border rounded-[8px] flex items-center overflow-hidden">
      <label className="flex flex-col gap-0.5 px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Desde</span>
        <input
          type="number"
          min={0}
          value={priceMin ?? ""}
          onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
          placeholder="$ 0"
          className="text-sm font-medium text-foreground leading-none bg-transparent outline-none w-[60px] placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio mínimo"
        />
      </label>

      <div className="w-px h-7 bg-border shrink-0" />

      <label className="flex flex-col gap-0.5 px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Hasta</span>
        <input
          type="number"
          min={0}
          value={priceMax ?? ""}
          onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
          placeholder="$ ∞"
          className="text-sm font-medium text-foreground leading-none bg-transparent outline-none w-[60px] placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Precio máximo"
        />
      </label>
    </div>
  );
}
