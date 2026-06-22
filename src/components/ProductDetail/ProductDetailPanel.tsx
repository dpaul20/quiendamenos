"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceTrend } from "@/components/PriceTrend";
import { InstallmentBadge } from "@/components/InstallmentBadge";
import { CompareTable } from "@/components/CompareTable";
import { PriceHistoryChart } from "@/components/PriceHistory";
import { matchOffers } from "@/features/price-search/match";
import { fetchPriceHistory } from "@/features/price-history/history";
import { useFollowedProduct } from "@/features/price-follow/useFollowedProduct";
import { useProductsStore } from "@/store/productsStore";
import { imageLoader } from "@/features/price-search/image-loader";
import type { Product } from "@/types/product.d";
import type {
  PriceHistoryEntry,
  TrendMap,
} from "@/features/price-history/types";

const fmtARS = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export interface ProductDetailPanelProps {
  product: Product;
  onBack: () => void;
  currentQuery: string;
  trendMap?: TrendMap;
  narrow?: boolean;
}

export function ProductDetailPanel({
  product,
  onBack,
  currentQuery,
  trendMap = {},
  narrow = false,
}: ProductDetailPanelProps) {
  const allProducts = useProductsStore((s) => s.products);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const { isFollowed, toggle } = useFollowedProduct(product.url);

  useEffect(() => {
    if (!currentQuery) return;
    fetchPriceHistory(currentQuery)
      .then(setPriceHistory)
      .catch(() => {});
  }, [currentQuery]);

  const offers = matchOffers(product, allProducts);
  const trend = product.url
    ? (trendMap[product.url] ?? trendMap["__global__"])
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Volver a resultados
      </button>

      {/* Hero grid */}
      <div
        className={
          narrow
            ? "grid grid-cols-1 gap-8"
            : "grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,420px)_1fr]"
        }
      >
        {/* Image column */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              loader={imageLoader}
              src={product.image || "/placeholder.png"}
              alt={product.name ?? "Producto"}
              fill
              sizes="420px"
              className="object-contain p-4"
            />
          </div>
          {/* Thumbnail row placeholders */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 shrink-0 rounded-md bg-muted" />
            ))}
          </div>
        </div>

        {/* Buy box column */}
        <div className="flex flex-col gap-3">
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
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              {product.brand}
            </p>
          )}

          {/* Name */}
          {product.name && (
            <h1 className="font-display text-3xl font-bold text-foreground">
              {product.name}
            </h1>
          )}

          {/* Price */}
          {product.price != null && (
            <p
              className="font-display text-4xl font-bold"
              style={{ color: "var(--price)" }}
            >
              {fmtARS(product.price)}
            </p>
          )}

          {/* Trend + installment */}
          <div className="flex flex-wrap items-center gap-2">
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

          {/* Best price label */}
          {offers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              El mejor precio entre {offers.length} tienda
              {offers.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="h-px bg-border" />

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Button asChild className="flex-1 rounded-xl py-3">
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                Ir a {product.from}
              </a>
            </Button>
            <Button
              variant={isFollowed ? "secondary" : "outline"}
              className="rounded-xl px-4 py-3"
              onClick={toggle}
            >
              {isFollowed ? "✓ Siguiendo" : "♡ Seguir precio"}
            </Button>
          </div>
        </div>
      </div>

      {/* Compare section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">
          Comparar entre tiendas
        </h2>
        {offers.length > 0 ? (
          <CompareTable
            offers={offers}
            onGoToStore={(url) => window.open(url, "_blank")}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No se encontraron otras tiendas con este producto.
          </p>
        )}
      </div>

      {/* Price history section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">
          Historial de precios
        </h2>
        <div className="rounded-lg border p-4">
          <PriceHistoryChart data={priceHistory} />
          {priceHistory.length < 2 && (
            <p className="mt-2 text-xs text-muted-foreground">
              No hay suficiente historial para mostrar el gráfico.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
