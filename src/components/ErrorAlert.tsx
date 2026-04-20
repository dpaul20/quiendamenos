"use client";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

export function ErrorAlert() {
  const error = useProductsStore((s) => s.error);
  if (!error) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {error}
    </div>
  );
}
