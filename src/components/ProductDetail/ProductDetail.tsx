"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceTrend } from "@/components/PriceTrend";
import { InstallmentBadge } from "@/components/InstallmentBadge";
import { CompareTable } from "@/components/CompareTable";
import { PriceHistoryChart } from "@/components/PriceHistory";
import { matchOffers } from "@/features/price-search/match";
import { fetchPriceHistory } from "@/features/price-history/history";
import { useProductsStore } from "@/store/productsStore";
import { imageLoader } from "@/features/price-search/image-loader";
import type { Product } from "@/types/product.d";
import type { PriceHistoryEntry } from "@/features/price-history/types";
import type { TrendMap } from "@/features/price-history/types";

interface ProductDetailProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  currentQuery: string;
  trendMap?: TrendMap;
}

const fmtARS = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export function ProductDetail({
  product,
  open,
  onClose,
  currentQuery,
  trendMap = {},
}: ProductDetailProps) {
  const allProducts = useProductsStore((s) => s.products);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  useEffect(() => {
    if (!open || !currentQuery) return;
    fetchPriceHistory(currentQuery).then(setPriceHistory);
  }, [open, currentQuery]);

  if (!product) return null;

  const offers = matchOffers(product, allProducts);
  const trend = product.url
    ? (trendMap[product.url] ?? trendMap["__global__"])
    : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent side="right" className="overflow-y-auto p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{product.name ?? "Detalle del producto"}</SheetTitle>
        </SheetHeader>

        {/* Hero */}
        <div className="flex flex-col gap-4 p-6">
          {/* Product image */}
          <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-[hsl(var(--surface))]">
            <Image
              loader={imageLoader}
              src={product.image || "/placeholder.png"}
              alt={product.name ?? "Producto"}
              fill
              sizes="480px"
              className="object-contain p-4"
            />
          </div>

          {/* Store badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full text-[11px] font-semibold"
            >
              {product.from}
            </Badge>
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="font-display text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              {product.brand}
            </p>
          )}

          {/* Name */}
          {product.name && (
            <h2 className="font-display text-lg font-bold text-foreground">
              {product.name}
            </h2>
          )}

          {/* Price + trend + installment */}
          <div className="flex flex-wrap items-center gap-2">
            {product.price != null && (
              <p
                className="font-display text-2xl font-bold"
                style={{ color: "hsl(var(--price-green))" }}
              >
                {fmtARS(product.price)}
              </p>
            )}
            {trend && (
              <PriceTrend
                direction={trend.direction}
                delta={trend.delta}
                label="vs ayer"
              />
            )}
            {product.installment != null && (
              <InstallmentBadge installment={product.installment} />
            )}
          </div>

          {/* Primary CTA */}
          <Button
            onClick={() => product.url && window.open(product.url, "_blank")}
            className="w-full rounded-xl py-3"
          >
            Ir a {product.from}
          </Button>

          {/* Seguir precio — disabled with tooltip */}
          <Button
            variant="outline"
            disabled
            title="Próximamente"
            className="w-full rounded-xl py-3"
          >
            Seguir precio
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* CompareTable */}
        {offers.length > 0 && (
          <div className="p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              Comparar precios
            </p>
            <CompareTable
              offers={offers}
              onGoToStore={(url) => window.open(url, "_blank")}
            />
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* PriceHistoryChart */}
        <div className="p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Historial de precios
          </p>
          <PriceHistoryChart data={priceHistory} />
          {priceHistory.length < 2 && (
            <p className="text-xs text-muted-foreground">
              No hay suficiente historial para mostrar el gráfico.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
