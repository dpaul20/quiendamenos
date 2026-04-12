"use client";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { imageLoader } from "@/lib/image-loader";
import cetrogar from "../../public/stores/cetrogar.webp";
import fravega from "../../public/stores/fravega.webp";
import naldo from "../../public/stores/naldo.webp";
import carrefour from "../../public/stores/carrefour.webp";
import mercadolibre from "../../public/stores/mercadolibre.png";
import oncity from "../../public/stores/oncity.png";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { useProductsStore } from "@/store/products.store";
import { ALL } from "@/lib/constants";
import { Badge } from "./ui/badge";
import { loadingMessages } from "@/lib/loading-messages";
import { useEffect, useState } from "react";

const storeLogos: Record<StoreNamesEnum, StaticImageData> = {
  Cetrogar: cetrogar,
  Fravega: fravega,
  Naldo: naldo,
  Carrefour: carrefour,
  MercadoLibre: mercadolibre,
  OnCity: oncity,
};

const SKELETON_KEYS = ["s0","s1","s2","s3","s4","s5","s6","s7"] as const;

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border animate-pulse">
      <div className="aspect-square w-full bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted mt-1" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function ProductList() {
  const { products, selectedBrand, isLoading } = useProductsStore();
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (isLoading) {
      const simulateLoading = async () => {
        for (const message of loadingMessages) {
          setLoadingMessage(message);
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Espera 1.5 segundos entre cada mensaje
        }
      };
      simulateLoading();
    }
  }, [isLoading]);

  let filteredProducts = products;
  if (selectedBrand !== ALL) {
    filteredProducts = products.filter(
      (product) => product.brand.toUpperCase() === selectedBrand,
    );
  }

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <p className="text-xs text-muted-foreground">{loadingMessage}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SKELETON_KEYS.map(id => (
            <SkeletonCard key={id} />
          ))}
        </div>
      </div>
    );

  if (filteredProducts.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="secondary" className="text-xs">
          Ordenados por menor precio
        </Badge>
        <span className="text-xs text-muted-foreground">
          {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product, index) => {
          if (!product.price || !product.name || !product.url) {
            return null;
          }
          return (
            <Card
              key={product.url}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border border-border transition-colors duration-200 hover:border-primary/30",
                index === 0 && "ring-1 ring-primary/40"
              )}
            >
              <Link href={product.url} target="_blank" className="block">
                <div className="relative aspect-square w-full bg-muted">
                  <Image
                    loader={imageLoader}
                    src={product.image}
                    alt={product.name ?? "Product image"}
                    fill
                    className="object-contain p-3"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-background/90 p-1">
                    <Image
                      src={storeLogos[product.from]}
                      alt={product.from}
                      width={48}
                      height={16}
                      className="h-4 w-auto object-contain"
                    />
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-1 p-3">
                <Link href={product.url} target="_blank">
                  <h3 className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xl font-bold text-primary leading-tight">
                  {product.price.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>

                <div className="flex items-center justify-between gap-1 mt-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {product?.installment ? (
                    <Badge className="bg-orange-500 text-[10px] px-1.5 py-0 leading-5">
                      {product.installment}× sin interés
                    </Badge>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
