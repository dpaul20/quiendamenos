"use client";
import React, { useEffect } from "react";
import { Store } from "lucide-react";
import { useProductsStore } from "@/store/products.store";
import argentinaFlag from "../../public/argentina_flag.webp";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

export function StoresList() {
  const { stores, products, isLoading } = useProductsStore();
  const { setStores } = useProductsStore();

  useEffect(() => {
    setStores();
  }, [products, setStores]);

  if (stores.length === 0) return null;

  if (isLoading) return <Skeleton className="h-9 w-full" />;

  return (
    <div className="rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-1">
        <Store className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Tiendas consultadas en:</h2>
        <Image src={argentinaFlag} alt="Bandera de Argentina" />
      </div>
      <p className="text-sm text-gray-600">
        Resultados encontrados en {stores.length}{" "}
        {stores.length === 1 ? "tienda" : "tiendas"}: {stores.join(", ")}
      </p>
    </div>
  );
}
