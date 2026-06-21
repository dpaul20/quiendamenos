"use client";
import React, { useEffect } from "react";
import { Store } from "lucide-react";
import { useProductsStore } from "@/store/productsStore";
import { Skeleton } from "@/components/ui/skeleton";

export function StoresList() {
  const { stores, products, selectedBrand, isLoading, setStores } =
    useProductsStore();

  useEffect(() => {
    setStores();
  }, [products, selectedBrand, setStores]);

  if (stores.length === 0) return null;
  if (isLoading) return <Skeleton className="h-9 w-full" />;

  return (
    <div className="flex w-full flex-col gap-[6px] rounded-lg bg-card px-4 py-[14px] shadow-[inset_0_0_0_1px_hsl(var(--border))]">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 shrink-0 text-foreground" />
        <span className="text-base font-semibold text-foreground">
          Tiendas consultadas en:
        </span>
        <span className="text-lg">🇦🇷</span>
      </div>
      <p className="text-sm leading-[1.5] text-muted-foreground">
        Resultados encontrados en {stores.length}{" "}
        {stores.length === 1 ? "tienda" : "tiendas"}: {stores.join(", ")}
      </p>
    </div>
  );
}
