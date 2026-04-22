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
    <div className="bg-card border border-border rounded-[10px] px-4 py-[14px] flex flex-col gap-[6px] w-full">
      <div className="flex gap-2 items-center">
        <Store className="h-5 w-5 text-foreground shrink-0" />
        <span className="text-base font-semibold text-foreground">
          Tiendas consultadas en:
        </span>
        <span className="text-lg">🇦🇷</span>
      </div>
      <p className="text-sm text-muted-foreground leading-[1.5]">
        Resultados encontrados en {stores.length}{" "}
        {stores.length === 1 ? "tienda" : "tiendas"}: {stores.join(", ")}
      </p>
    </div>
  );
}
