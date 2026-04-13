"use client";
import Image from "next/image";
import Link from "next/link";
import { imageLoader } from "@/features/price-search/image-loader";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { ALL } from "@/features/price-search/constants";
import { loadingMessages } from "@/features/price-search/loading-messages";
import { capitalize } from "@/lib/capitalize";
import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";

const ITEMS_PER_PAGE = 12;

const SKELETON_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden animate-pulse">
      <div className="bg-muted h-[140px] w-full shrink-0" />
      <div className="flex flex-col gap-[10px] p-3 w-full">
        <div className="bg-muted h-[10px] w-[80px] rounded-sm" />
        <div className="bg-muted h-[10px] w-full rounded-sm" />
        <div className="bg-muted h-[10px] w-3/4 rounded-sm" />
        <div className="bg-muted h-[24px] w-[60px] rounded-sm" />
        <div className="bg-muted h-[18px] w-[100px] rounded-sm" />
      </div>
    </div>
  );
}

export default function ProductList() {
  const { products, selectedBrand, selectedStore, isLoading } =
    useProductsStore();
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevBrand, setPrevBrand] = useState(selectedBrand);
  const [prevStore, setPrevStore] = useState(selectedStore);
  const [prevProducts, setPrevProducts] = useState(products);

  if (prevBrand !== selectedBrand || prevStore !== selectedStore || prevProducts !== products) {
    setPrevBrand(selectedBrand);
    setPrevStore(selectedStore);
    setPrevProducts(products);
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

  let filteredProducts = products;
  if (selectedBrand !== ALL) {
    filteredProducts = filteredProducts.filter(
      (product) => capitalize(product.brand) === selectedBrand,
    );
  }
  if (selectedStore !== ALL) {
    filteredProducts = filteredProducts.filter(
      (product) => product.from === selectedStore,
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {loadingMessage && (
          <p className="text-xs text-muted-foreground">{loadingMessage}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {SKELETON_KEYS.map((id) => (
            <SkeletonCard key={id} />
          ))}
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0 && products.length > 0) {
    return <EmptyState />;
  }

  if (filteredProducts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-foreground">
          {filteredProducts.length} resultado
          {filteredProducts.length === 1 ? "" : "s"}
        </span>
        <span className="text-xs sm:text-sm font-normal text-muted-foreground">
          <span className="sm:hidden">Precio ↕</span>
          <span className="hidden sm:inline">Ordenar: Menor precio ↕</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {paginatedProducts.map((product) => {
          if (!product.price || !product.name || !product.url) return null;
          return (
            <Link
              key={product.url}
              href={product.url}
              target="_blank"
              className="rounded-xl bg-card border border-border flex flex-col items-center overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="w-full h-[140px] bg-surface relative overflow-hidden">
                <Image
                  loader={imageLoader}
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-3"
                />
                <div className="absolute bottom-2 right-2 bg-card/90 px-2 py-[3px] rounded-[4px]">
                  <span className="text-xs font-medium text-secondary-foreground whitespace-nowrap">
                    {product.from}
                  </span>
                </div>
              </div>

              <div className="w-full p-3 flex flex-col gap-[6px]">
                <h3 className="text-sm font-normal text-muted-foreground line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-price-green">
                  {product.price.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
                <div className="flex gap-[6px] items-start flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {product.brand}
                  </span>
                  {product.installment ? (
                    <span className="bg-orange-500 rounded-md px-2 py-[3px] text-xs font-medium text-background">
                      {product.installment}x sin interes
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-1 items-center justify-center px-1 py-2 mt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border border-border rounded-md h-[36px] flex-1 sm:flex-none sm:w-[120px] px-3 text-sm text-foreground disabled:opacity-40"
          >
            ← <span className="hidden sm:inline">Anterior</span><span className="sm:hidden">Ant.</span>
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
                  className="size-[36px] flex items-center justify-center text-xs text-muted-foreground select-none"
                >
                  •••
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item as number)}
                  className={
                    item === currentPage
                      ? "bg-primary rounded-md size-[36px] text-sm font-medium text-primary-foreground"
                      : "border border-border rounded-md size-[36px] text-sm text-foreground"
                  }
                >
                  {item}
                </button>
              ),
            )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border border-border rounded-md h-[36px] flex-1 sm:flex-none sm:w-[120px] px-3 text-sm text-foreground disabled:opacity-40"
          >
            <span className="hidden sm:inline">Siguiente</span><span className="sm:hidden">Sig.</span> →
          </button>
        </div>
      )}
    </div>
  );
}
