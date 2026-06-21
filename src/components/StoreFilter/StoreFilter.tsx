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
    <div className="flex flex-wrap items-center gap-2">
      <span className="hidden shrink-0 text-sm font-medium text-muted-foreground sm:inline">
        Tiendas:
      </span>
      {stores.map((store) => {
        const active = selectedStores.includes(store);
        return (
          <button
            key={store}
            onClick={() => toggleStore(store)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-[5px] rounded-full px-3 py-[7px] text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:brightness-[0.96]",
            )}
          >
            {active && (
              <svg
                viewBox="0 0 13 13"
                width="13"
                height="13"
                className="shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M3 7.4 5.6 10 11 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {store}
          </button>
        );
      })}
    </div>
  );
}
