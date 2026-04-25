"use client";
import Image from "next/image";
import Link from "next/link";
import { imageLoader } from "@/features/price-search/image-loader";
import { useProductsStore } from "@/store/productsStore";
import { loadingMessages } from "@/features/price-search/loading-messages";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchTrendMap } from "@/features/price-history/trend";
import type { TrendMap } from "@/features/price-history/types";

const ITEMS_PER_PAGE = 12;

const SKELETON_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="h-[140px] w-full shrink-0 bg-muted" />
      <div className="flex w-full flex-col gap-[10px] p-3">
        <div className="h-[10px] w-[80px] rounded-sm bg-muted" />
        <div className="h-[10px] w-full rounded-sm bg-muted" />
        <div className="h-[10px] w-3/4 rounded-sm bg-muted" />
        <div className="h-[24px] w-[60px] rounded-sm bg-muted" />
        <div className="h-[18px] w-[100px] rounded-sm bg-muted" />
      </div>
    </div>
  );
}

export default function ProductList() {
  const products = useProductsStore((s) => s.products);
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const visible = useProductsStore(useShallow((s) => s.filteredProducts()));
  const currentQuery = useProductsStore((s) => s.productSearched);

  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevProductsRef, setPrevProductsRef] = useState(products);
  const [trendMap, setTrendMap] = useState<TrendMap>({});

  if (prevProductsRef !== products) {
    setPrevProductsRef(products);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (isLoading) {
      const simulate = async () => {
        for (const message of loadingMessages) {
          setLoadingMessage(message);
          await new Promise((res) => setTimeout(res, 1500));
        }
      };
      simulate();
    }
  }, [isLoading]);

  useEffect(() => {
    if (products.length === 0 || !currentQuery) return;
    fetchTrendMap(currentQuery)
      .then(setTrendMap)
      .catch(() => {});
  }, [products, currentQuery]);

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const paginatedProducts = visible.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {loadingMessage && (
          <p className="text-xs text-muted-foreground">{loadingMessage}</p>
        )}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {SKELETON_KEYS.map((id) => (
            <SkeletonCard key={id} />
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return <ErrorAlert />;
  }

  if (visible.length === 0 && products.length > 0) {
    return <EmptyState />;
  }

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert />

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {paginatedProducts.map((product) => {
          if (!product.price || !product.name || !product.url) return null;
          return (
            <Link
              key={product.url}
              href={product.url}
              target="_blank"
              data-testid="product-card"
              className="flex flex-col items-center overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="relative h-[140px] w-full overflow-hidden bg-surface">
                <Image
                  loader={imageLoader}
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-contain p-3"
                />
                <div className="absolute bottom-2 right-2 rounded-[4px] bg-card/90 px-2 py-[3px]">
                  <span className="whitespace-nowrap text-xs font-medium text-secondary-foreground">
                    {product.from}
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-[6px] p-3">
                <h3 className="line-clamp-2 text-sm font-normal text-muted-foreground">
                  {product.name}
                </h3>
                <p
                  data-testid="product-price"
                  className="text-2xl font-bold text-price-green"
                >
                  {product.price.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
                {trendMap["__global__"] && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit text-xs font-medium",
                      trendMap["__global__"].direction === "down"
                        ? "border-green-200 bg-green-500/10 text-green-700 dark:border-green-800 dark:bg-green-500/10 dark:text-green-400"
                        : "border-red-200 bg-red-500/10 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400",
                    )}
                  >
                    {trendMap["__global__"].direction === "down" ? "↓" : "↑"}{" "}
                    {trendMap["__global__"].delta}% vs ayer
                  </Badge>
                )}
                <div className="flex flex-wrap items-start gap-[6px]">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {product.brand}
                  </span>
                  {product.installment ? (
                    <span
                      data-testid="product-installment"
                      className="rounded-md bg-orange-500 px-2 py-[3px] text-xs font-medium text-white"
                    >
                      {product.installment} CSI
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1 px-1 py-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-[36px] flex-1 rounded-md border border-border px-3 text-sm text-foreground disabled:opacity-40 sm:w-[120px] sm:flex-none"
          >
            ← <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">Ant.</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1,
            )
            .reduce<(number | "ellipsis")[]>((acc, page, i, arr) => {
              const prev = arr[i - 1];
              if (i > 0 && typeof prev === "number" && page - prev > 1) {
                acc.push("ellipsis");
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, i, arr) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${arr[i - 1]}-${arr[i + 1]}`}
                  className="flex size-[36px] select-none items-center justify-center text-xs text-muted-foreground"
                >
                  •••
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={
                    item === currentPage
                      ? "size-[36px] rounded-md bg-primary text-sm font-medium text-primary-foreground"
                      : "size-[36px] rounded-md border border-border text-sm text-foreground"
                  }
                >
                  {item}
                </button>
              ),
            )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-[36px] flex-1 rounded-md border border-border px-3 text-sm text-foreground disabled:opacity-40 sm:w-[120px] sm:flex-none"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">Sig.</span> →
          </button>
        </div>
      )}
    </div>
  );
}
