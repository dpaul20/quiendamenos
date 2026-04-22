"use client";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/store/productsStore";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreFilter() {
  const stores = useProductsStore((s) => s.stores);
  const selectedStores = useProductsStore((s) => s.selectedStores);
  const toggleStore = useProductsStore((s) => s.toggleStore);
  const isLoading = useProductsStore((s) => s.isLoading);

  if (isLoading) return <Skeleton className="h-7 w-full max-w-sm" />;
  if (stores.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="hidden sm:inline text-sm font-medium text-muted-foreground shrink-0">Tiendas:</span>
      {stores.map((store) => {
        const active = selectedStores.includes(store);
        return (
          <button
            key={store}
            onClick={() => toggleStore(store)}
            aria-pressed={active}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary-foreground border border-border hover:border-primary"
            )}
          >
            {store}
          </button>
        );
      })}
    </div>
  );
}
