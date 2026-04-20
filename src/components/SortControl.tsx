"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "installments_desc", label: "Más cuotas" },
  { value: "best_installment", label: "Mejor cuota" },
] as const;

export function SortControl() {
  const sortBy = useProductsStore((s) => s.sortBy);
  const setSortBy = useProductsStore((s) => s.setSortBy);
  const label = OPTIONS.find((o) => o.value === sortBy)?.label ?? "Menor precio";

  return (
    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
      <SelectTrigger
        className="h-[46px] w-[180px] rounded-[8px] border border-border bg-background px-3 flex flex-col items-start gap-0.5 [&>span]:flex [&>span]:w-full [&>span]:items-start [&>span]:flex-col"
        aria-label="Ordenar resultados"
      >
        <span className="text-[10px] text-muted-foreground leading-none">Ordenar por</span>
        <span className="text-sm font-medium text-foreground leading-none">{label}</span>
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
