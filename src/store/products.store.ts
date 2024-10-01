import { getProduct } from "@/lib/api";
import { ALL } from "@/lib/constants";
import { updateUnknownBrands } from "@/lib/unkonw-brands";
import { Product } from "@/types/product";
import { create } from "zustand";

interface State {
  products: Product[];
  productSearched: string;
  brands: string[];
  showDisclaimer: boolean;
  setDisclaimer: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedBrand: string;
  getProducts: (productName: string) => Promise<void>;
  setSelectedBrand: (brand: string) => void;
  // filterProducts: (selectedBrand: string) => Product[];
}

export const useProductsStore = create<State>((set) => ({
  products: [],
  productSearched: "",
  brands: [],
  showDisclaimer: true,
  selectedBrand: ALL,
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  getProducts: async (productName: string) => {
    const products = await getProduct(productName);
    const productsUpdated = updateUnknownBrands(products);
    // Ordenar los productos por menor precio
    productsUpdated.sort((a: Product, b: Product) => {
      const priceA = a.price ?? Number.MAX_VALUE; // Use a very high value if price is undefined
      const priceB = b.price ?? Number.MAX_VALUE;
      return priceA - priceB;
    });

    const brands = productsUpdated.map((product: Product) =>
      product.brand.toUpperCase()
    );
    const uniqueBrands = Array.from(new Set(brands));

    uniqueBrands.sort();

    uniqueBrands.unshift(ALL);

    set(() => ({
      products: productsUpdated,
      productSearched: productName,
      brands: uniqueBrands,
      isLoading: false,
    }));
  },
  setSelectedBrand: (brand: string) => set({ selectedBrand: brand }),
  setDisclaimer: (show: boolean) => set({ showDisclaimer: show }),
}));
