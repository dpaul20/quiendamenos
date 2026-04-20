"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

function formatValue(v: number | null, fallback: string) {
  if (v === null) return fallback;
  return `$ ${v.toLocaleString("es-AR")}`;
}

export function PriceRangeFilter() {
  const priceMin = useProductsStore((s) => s.priceMin);
  const priceMax = useProductsStore((s) => s.priceMax);
  const setPriceMin = useProductsStore((s) => s.setPriceMin);
  const setPriceMax = useProductsStore((s) => s.setPriceMax);

  return (
    <div className="h-[46px] border border-border rounded-[8px] flex items-center overflow-hidden">
      {/* Desde */}
      <label className="flex flex-col gap-0.5 px-3 py-1.5 cursor-pointer min-w-[72px]">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Desde</span>
        <div className="relative">
          <span className="text-sm font-medium text-foreground leading-none pointer-events-none">
            {priceMin === null ? "$ 0" : `$ ${priceMin.toLocaleString("es-AR")}`}
          </span>
          <input
            type="number"
            min={0}
            value={priceMin ?? ""}
            onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            aria-label="Precio mínimo"
          />
        </div>
      </label>

      {/* Divider */}
      <div className="w-px h-7 bg-border shrink-0" />

      {/* Hasta */}
      <label className="flex flex-col gap-0.5 px-3 py-1.5 cursor-pointer min-w-[72px]">
        <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Hasta</span>
        <div className="relative">
          <span className="text-sm font-medium text-foreground leading-none pointer-events-none">
            {priceMax === null ? "$ ∞" : `$ ${priceMax.toLocaleString("es-AR")}`}
          </span>
          <input
            type="number"
            min={0}
            value={priceMax ?? ""}
            onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            aria-label="Precio máximo"
          />
        </div>
      </label>
    </div>
  );
}
