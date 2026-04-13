"use client";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/store/products.store";
import { ALL } from "@/lib/constants";
import { Skeleton } from "./ui/skeleton";

export function StoreFilter() {
  const { stores, selectedStore, setSelectedStore, isLoading } =
    useProductsStore();

  if (isLoading) return <Skeleton className="h-7 w-full max-w-sm" />;
  if (stores.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground shrink-0">Tiendas:</span>
      {stores.map((store) => (
        <button
          key={store}
          onClick={() =>
            setSelectedStore(selectedStore === store ? ALL : store)
          }
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            selectedStore === store
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-foreground hover:border-primary/50"
          )}
        >
          {store}
        </button>
      ))}
    </div>
  );
}
