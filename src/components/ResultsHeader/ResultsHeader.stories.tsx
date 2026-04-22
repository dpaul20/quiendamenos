import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { ResultsHeader } from "./ResultsHeader";
import { useProductsStore } from "@/store/productsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";
import type { Product } from "@/types/product";

const MOCK_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  from: StoreNamesEnum.FRAVEGA,
  name: `Producto ${i + 1}`,
  price: 100000 * (i + 1),
  image: "https://placehold.co/400x320/e2e8f0/475569?text=Prod",
  url: `https://fravega.com/p/${i + 1}`,
  brand: "samsung",
}));

function withStore(state: Partial<ReturnType<typeof useProductsStore.getState>>) {
  const Decorator = (Story: React.ComponentType) => {
    useEffect(() => {
      useProductsStore.setState(state);
      return () => useProductsStore.setState({ products: [], isLoading: false });
    }, []);
    return <Story />;
  };
  Decorator.displayName = "StoreDecorator";
  return Decorator;
}

/**
 * Encabezado de resultados: muestra la cantidad de productos encontrados
 * y el control de ordenamiento interactivo. Se oculta si no hay resultados o está cargando.
 */
const meta = {
  title: "Components/ResultsHeader",
  component: ResultsHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof ResultsHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Con resultados: muestra conteo y SortControl */
export const WithResults: Story = {
  decorators: [
    withStore({ products: MOCK_PRODUCTS, selectedBrand: ALL, selectedStores: [], isLoading: false, sortBy: "price_asc" }),
  ],
};

/** Un solo resultado (singular) */
export const SingleResult: Story = {
  decorators: [
    withStore({ products: [MOCK_PRODUCTS[0]], selectedBrand: ALL, selectedStores: [], isLoading: false, sortBy: "price_asc" }),
  ],
};

/** Ordenado por mayor precio */
export const SortedByPriceDesc: Story = {
  decorators: [
    withStore({ products: MOCK_PRODUCTS, selectedBrand: ALL, selectedStores: [], isLoading: false, sortBy: "price_desc" }),
  ],
};

/** Sin resultados: no renderiza nada */
export const NoResults: Story = {
  decorators: [
    withStore({ products: [], selectedBrand: ALL, selectedStores: [], isLoading: false }),
  ],
};

/** Cargando: no renderiza nada */
export const Loading: Story = {
  decorators: [
    withStore({ products: [], selectedBrand: ALL, selectedStores: [], isLoading: true }),
  ],
};

/** Modo oscuro */
export const Dark: Story = {
  decorators: [
    withStore({ products: MOCK_PRODUCTS, selectedBrand: ALL, selectedStores: [], isLoading: false, sortBy: "price_asc" }),
    (Story) => (
      <div className="dark bg-background p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
};
