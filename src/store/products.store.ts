import { StoreNamesEnum } from "@/enums/stores.enum";
import { getProduct } from "@/lib/api";
import { ALL } from "@/lib/constants";
import { updateUnknownBrands } from "@/lib/unknown-brands";
import { Product } from "@/types/product";
import { create } from "zustand";

interface State {
  getProducts: (productName: string) => Promise<void>;
  products: Product[];
  productSearched: string;
  brands: string[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
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
      product.brand.toUpperCase()
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
  stores: [],
  setStores: () => {
    const products = get().products;
    const stores = products.map((product) => product.from);
    const uniqueStores = Array.from(new Set(stores));
    set(() => ({ stores: uniqueStores }));
  },
}));
