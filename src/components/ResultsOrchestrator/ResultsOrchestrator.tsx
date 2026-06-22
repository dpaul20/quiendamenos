"use client";

import { useProductsStore } from "@/store/productsStore";
import { ProductDetailPanel } from "@/components/ProductDetail/ProductDetailPanel";
import type { ReactNode } from "react";

interface ResultsOrchestratorProps {
  children: ReactNode;
}

export function ResultsOrchestrator({ children }: ResultsOrchestratorProps) {
  const selectedProduct = useProductsStore((s) => s.selectedProduct);
  const setSelectedProduct = useProductsStore((s) => s.setSelectedProduct);
  const currentQuery = useProductsStore((s) => s.productSearched);

  if (selectedProduct !== null) {
    return (
      <ProductDetailPanel
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        currentQuery={currentQuery}
      />
    );
  }

  return <>{children}</>;
}
