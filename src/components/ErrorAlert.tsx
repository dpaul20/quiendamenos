"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

export function ErrorAlert() {
  const error = useProductsStore((s) => s.error);
  if (!error) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-3"
    >
      <div className="size-5 rounded-full bg-destructive shrink-0 mt-0.5 flex items-center justify-center">
        <div className="w-0.5 h-2.5 bg-white rounded-full" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-destructive">Error al cargar resultados</p>
        <p className="text-xs text-destructive/80">{error}</p>
      </div>
    </div>
  );
}
