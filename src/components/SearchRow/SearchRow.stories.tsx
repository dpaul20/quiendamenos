// ...existing code (imports, meta, decorador, Default, WithBrands)...

/** Ambos hijos en loading (BrandFilter y SearchForm). */
export const Loading: Story = {
  decorators: [SearchRowDecorator({ brands: [], isLoading: true, selectedBrand: ALL })],
};
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchRow from "./SearchRow";
import { useProductsStore } from "@/store/productsStore";
import { ALL } from "@/features/price-search/constants";

/**
 * Fila de búsqueda que combina el filtro de marcas y el formulario de búsqueda.
 * Responsive: columna en móvil, fila en escritorio.
 */
const meta = {
  title: "Components/SearchRow",
  component: SearchRow,
  tags: ["autodocs"],
} satisfies Meta<typeof SearchRow>;

export default meta;
type Story = StoryObj<typeof meta>;

import { useEffect } from "react";

type SearchRowState = {
  brands?: string[];
  selectedBrand?: string;
  isLoading?: boolean;
};

type SearchRowDecoratorProps = Readonly<{
  state: SearchRowState;
  Story: React.ComponentType;
}>;

function SearchRowDecorator(state: SearchRowState) {
  const Decorator = (Story: React.ComponentType) => (
    <SearchRowDecoratorComponent state={state} Story={Story} />
  );
  Decorator.displayName = "SearchRowDecorator";
  return Decorator;
}

function SearchRowDecoratorComponent({ state, Story }: SearchRowDecoratorProps) {
  useEffect(() => {
    useProductsStore.setState(state);
    return () => {
      Object.keys(state).forEach((k) => {
        let safeValue = undefined;
        if (k === "brands") safeValue = [];
        else if (k === "selectedBrand") safeValue = undefined;
        else if (k === "isLoading") safeValue = false;
        useProductsStore.setState({ [k]: safeValue });
      });
    };
  }, [state]);
  return <Story />;
}

/** Estado inicial sin productos cargados (BrandFilter oculto). */
export const Default: Story = {
  decorators: [SearchRowDecorator({ brands: [], isLoading: false, selectedBrand: ALL })],
};

/** Con marcas disponibles para filtrar. */
export const WithBrands: Story = {
  decorators: [SearchRowDecorator({
    brands: [ALL, "Samsung", "LG", "Motorola", "Apple"],
    selectedBrand: ALL,
    isLoading: false,
  })],
};
