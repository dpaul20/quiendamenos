"use client";
import { useProductsStore } from "@/store/productsStore";

export function ErrorAlert() {
  const error = useProductsStore((s) => s.error);
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/20 px-4 py-3"
      style={{ background: "var(--error-bg)" }}
    >
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
        <div className="h-2.5 w-0.5 rounded-full bg-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-destructive">
          Error al cargar resultados
        </p>
        <p className="text-xs text-destructive/80">{error}</p>
      </div>
    </div>
  );
}
