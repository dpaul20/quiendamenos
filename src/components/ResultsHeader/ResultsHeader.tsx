"use client";
import { useProductsStore } from "@/store/productsStore";
import { SortControl } from "@/components/SortControl";

export function ResultsHeader() {
  const count = useProductsStore((s) => s.filteredProducts().length);
  const isLoading = useProductsStore((s) => s.isLoading);

  if (isLoading || count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs sm:text-sm font-medium text-foreground">
        {count} resultado{count === 1 ? "" : "s"}
      </span>
      <SortControl />
    </div>
  );
}
