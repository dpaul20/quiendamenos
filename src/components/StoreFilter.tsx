"use client";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { ALL } from "@/features/price-search/constants";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreFilter() {
  const { stores, selectedStore, setSelectedStore, isLoading } =
    useProductsStore();

  if (isLoading) return <Skeleton className="h-7 w-full max-w-sm" />;
  if (stores.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground shrink-0">Tiendas:</span>
      {stores.map((store) => (
        <button
          key={store}
          onClick={() => setSelectedStore(selectedStore === store ? ALL : store)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            selectedStore === store
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-secondary-foreground border border-border"
          )}
        >
          {store}
        </button>
      ))}
    </div>
  );
}
