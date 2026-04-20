"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

const OPTIONS = [
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "installments_desc", label: "Más cuotas" },
  { value: "best_installment", label: "Mejor cuota" },
] as const;

export function SortControl() {
  const sortBy = useProductsStore((s) => s.sortBy);
  const setSortBy = useProductsStore((s) => s.setSortBy);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        className="h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label="Ordenar resultados"
      >
        {OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
