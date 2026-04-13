import { StoreNamesEnum } from "@/enums/stores.enum";
import { getProduct } from "@/features/price-search/api";
import { ALL } from "@/features/price-search/constants";
import { updateUnknownBrands } from "@/features/price-search/unknown-brands";
import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { create } from "zustand";

interface State {
  getProducts: (productName: string) => Promise<void>;
  products: Product[];
  productSearched: string;
  brands: string[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setStores: () => void;
  stores: StoreNamesEnum[];
}

export const useProductsStore = create<State>((set, get) => ({
  products: [],
  productSearched: "",
  brands: [],
  selectedBrand: ALL,
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  getProducts: async (productName: string) => {
    const products = await getProduct(productName);
    const productsUpdated = updateUnknownBrands(products);
    // Ordenar los productos por menor precio
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
    }));
  },
  setSelectedBrand: (brand: string) => set({ selectedBrand: brand }),
  selectedStore: ALL,
  setSelectedStore: (store: string) => set({ selectedStore: store }),
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
}));
