"use client";

import { useProductsStore, selectPhase } from "@/store/productsStore";
import { useShallow } from "zustand/react/shallow";

interface Category {
  label: string;
  query: string;
}

const CATEGORIES: Category[] = [
  { label: "Celulares", query: "celular" },
  { label: "Tablets", query: "tablet" },
  { label: "TVs", query: "tv" },
  { label: "Auriculares", query: "auriculares" },
  { label: "Notebooks", query: "notebook" },
  { label: "Consolas", query: "consola" },
  { label: "Heladeras", query: "heladera" },
  { label: "Lavadoras", query: "lavarropas" },
];

export default function CategoryChips() {
  const { getProducts, phase } = useProductsStore(
    useShallow((s) => ({
      getProducts: s.getProducts,
      phase: selectPhase(s),
    })),
  );

  if (phase === "results") return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => getProducts(cat.query)}
          className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
