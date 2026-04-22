"use client";
import { useMemo } from "react";
import { useProductsStore } from "@/store/productsStore";
import { getAvailableCSI } from "@/store/selectors";
import { cn } from "@/lib/utils";

export function CSIFilter() {
  const products = useProductsStore((s) => s.products);
  const selectedCSI = useProductsStore((s) => s.selectedCSI);
  const setSelectedCSI = useProductsStore((s) => s.setSelectedCSI);

  const options = useMemo(() => getAvailableCSI(products), [products]);

  if (options.length <= 1) return null;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Cuotas sin interés">
      {options.map(({ label, value }) => {
        const active = selectedCSI === value;
        return (
          <button
            key={label}
            onClick={() => setSelectedCSI(value)}
            className={cn(
              "h-8 px-3 text-sm rounded-full border transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary"
            )}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
