import { StoreNamesEnum } from "@/enums/stores.enum";
import { getProduct } from "@/features/price-search/api";
import { ALL } from "@/features/price-search/constants";
import { updateUnknownBrands } from "@/features/price-search/unknown-brands";
import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { create } from "zustand";

type SortBy = "price_asc" | "price_desc" | "installments_desc" | "best_installment";

interface State {
  getProducts: (productName: string) => Promise<void>;
  products: Product[];
  productSearched: string;
  brands: string[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedStores: string[];
  toggleStore: (store: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setStores: () => void;
  stores: StoreNamesEnum[];
  error: string | null;
  setError: (msg: string | null) => void;
  priceMin: number | null;
  priceMax: number | null;
  selectedCSI: number | null;
  sortBy: SortBy;
  setPriceMin: (v: number | null) => void;
  setPriceMax: (v: number | null) => void;
  setSelectedCSI: (v: number | null) => void;
  setSortBy: (v: SortBy) => void;
  clearFilters: () => void;
  filteredProducts: () => Product[];
}

export const useProductsStore = create<State>((set, get) => ({
  products: [],
  productSearched: "",
  brands: [],
  selectedBrand: ALL,
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  error: null,
  setError: (msg) => set({ error: msg }),
  getProducts: async (productName: string) => {
    set({ error: null });
    try {
      const products = await getProduct(productName);
      const productsUpdated = updateUnknownBrands(products);
      productsUpdated.sort((a: Product, b: Product) => {
        const priceA = a.price ?? Infinity;
        const priceB = b.price ?? Infinity;
        return priceA - priceB;
      });

      const brands = productsUpdated.map((product: Product) =>
        capitalize(product.brand)
      );
      const uniqueBrands = Array.from(new Set(brands));
      uniqueBrands.sort((a, b) => a.localeCompare(b));
      uniqueBrands.unshift(ALL);

      set(() => ({
        products: productsUpdated,
        productSearched: productName,
        brands: uniqueBrands,
        isLoading: false,
        error: null,
      }));
    } catch {
      set({
        isLoading: false,
        error: "No se pudo conectar. Verificá tu conexión e intentá de nuevo.",
      });
    }
  },
  setSelectedBrand: (brand: string) => set({ selectedBrand: brand }),
  selectedStores: [],
  toggleStore: (store: string) =>
    set((s) => ({
      selectedStores: s.selectedStores.includes(store)
        ? s.selectedStores.filter((x) => x !== store)
        : [...s.selectedStores, store],
    })),
  stores: [],
  setStores: () => {
    const { products, selectedBrand } = get();
    const filtered =
      selectedBrand === ALL
        ? products
        : products.filter((p) => capitalize(p.brand) === selectedBrand);
    const stores = filtered.map((product) => product.from);
    const uniqueStores = Array.from(new Set(stores));
    set(() => ({ stores: uniqueStores }));
  },
  priceMin: null,
  priceMax: null,
  selectedCSI: null,
  sortBy: "price_asc",
  setPriceMin: (v) => set({ priceMin: v }),
  setPriceMax: (v) => set({ priceMax: v }),
  setSelectedCSI: (v) => set({ selectedCSI: v }),
  setSortBy: (v) => set({ sortBy: v }),
  clearFilters: () =>
    set({ priceMin: null, priceMax: null, selectedCSI: null, sortBy: "price_asc", error: null, selectedStores: [] }),
  filteredProducts: () => {
    const { products, selectedBrand, selectedStores, priceMin, priceMax, selectedCSI, sortBy } = get();

    let result = products.filter((p) => {
      if (selectedBrand !== ALL && capitalize(p.brand) !== selectedBrand) return false;
      if (selectedStores.length > 0 && !selectedStores.includes(p.from)) return false;
      if (priceMin !== null && (p.price ?? 0) < priceMin) return false;
      if (priceMax !== null && (p.price ?? 0) > priceMax) return false;
      if (selectedCSI !== null && (p.installment ?? 0) !== selectedCSI) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "price_asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sortBy === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === "installments_desc") return (b.installment ?? 0) - (a.installment ?? 0);
      if (sortBy === "best_installment") {
        const aVal = (a.installment ?? 0) > 0 ? (a.price ?? 0) / a.installment! : Infinity;
        const bVal = (b.installment ?? 0) > 0 ? (b.price ?? 0) / b.installment! : Infinity;
        return aVal - bVal;
      }
      return 0;
    });

    return result;
  },
}));
