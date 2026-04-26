"use client";
import { useProductsStore } from "@/store/productsStore";
import { SortControl } from "@/components/SortControl";

export function ResultsHeader() {
  const count = useProductsStore((s) => s.filteredProducts().length);
  const isLoading = useProductsStore((s) => s.isLoading);

  if (isLoading || count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <span
        data-testid="results-count"
        className="text-xs font-medium text-foreground sm:text-sm"
      >
        {count} resultado{count === 1 ? "" : "s"}
      </span>
      <SortControl />
    </div>
  );
}
