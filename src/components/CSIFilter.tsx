"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { cn } from "@/lib/utils";

const OPTIONS: { label: string; value: number | null }[] = [
  { label: "Cualquiera", value: null },
  { label: "6 CSI", value: 6 },
  { label: "12 CSI", value: 12 },
  { label: "18+ CSI", value: 18 },
];

export function CSIFilter() {
  const selectedCSI = useProductsStore((s) => s.selectedCSI);
  const setSelectedCSI = useProductsStore((s) => s.setSelectedCSI);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Cuotas sin interés">
      {OPTIONS.map(({ label, value }) => {
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
