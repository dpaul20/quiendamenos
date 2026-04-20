"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

const SORT_LABELS: Record<string, string> = {
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
  installments_desc: "Más cuotas",
  best_installment: "Mejor cuota",
};

export function ResultsHeader() {
  const filteredProducts = useProductsStore((s) => s.filteredProducts);
  const sortBy = useProductsStore((s) => s.sortBy);
  const isLoading = useProductsStore((s) => s.isLoading);

  const visible = filteredProducts();

  if (isLoading || visible.length === 0) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs sm:text-sm font-medium text-foreground">
        {visible.length} resultado{visible.length === 1 ? "" : "s"}
      </span>
      <span className="text-xs sm:text-sm font-normal text-muted-foreground">
        <span className="sm:hidden">Precio ↕</span>
        <span className="hidden sm:inline">Ordenar: {SORT_LABELS[sortBy]} ↕</span>
      </span>
    </div>
  );
}
