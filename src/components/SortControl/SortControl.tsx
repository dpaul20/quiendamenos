"use client";
import React from "react";
import { useProductsStore } from "@/store/productsStore";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const OPTIONS = [
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "installments_desc", label: "Más cuotas" },
  { value: "best_installment", label: "Mejor cuota" },
] as const;

export function SortControl() {
  const [open, setOpen] = React.useState(false);
  const sortBy = useProductsStore((s) => s.sortBy);
  const setSortBy = useProductsStore((s) => s.setSortBy);
  const label = OPTIONS.find((o) => o.value === sortBy)?.label ?? "Menor precio";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Ordenar resultados"
          className="h-[46px] shrink-0 flex flex-col justify-center gap-0.5 px-3 rounded-[8px] border border-border bg-background hover:bg-accent transition-colors"
        >
          <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">Ordenar por</span>
          <span className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground leading-none whitespace-nowrap">{label}</span>
            <ChevronDownIcon className="h-3 w-3 shrink-0 text-primary" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 w-[180px]" align="end">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={sortBy === opt.value}
            onClick={() => { setSortBy(opt.value); setOpen(false); }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors",
              sortBy === opt.value ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {opt.label}
            {sortBy === opt.value && <CheckIcon className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
