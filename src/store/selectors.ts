import type { Product } from "@/types/product";
import { ALL } from "@/features/price-search/constants";

export function getAvailableCSI(
  products: Product[]
): { label: string; value: number | null }[] {
  const seen = new Set<number>();
  products.forEach((p) => {
    if (p.installment && p.installment > 0) seen.add(p.installment);
  });
  const sorted = [...seen].sort((a, b) => a - b);
  return [
    { label: "Cualquiera", value: null },
    ...sorted.map((csi) => ({ label: String(csi), value: csi })),
  ];
}

interface FilterState {
  selectedStores: string[];
  selectedBrand: string;
  priceMin: number | null;
  priceMax: number | null;
  selectedCSI: number | null;
}

export function countActiveFilters(filters: FilterState): number {
  return [
    filters.selectedStores.length > 0,
    filters.selectedBrand !== ALL,
    filters.priceMin !== null,
    filters.priceMax !== null,
    filters.selectedCSI !== null,
  ].filter(Boolean).length;
}
