import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { FiltersBar } from "./FiltersBar";
import { useProductsStore } from "@/store/productsStore";
import { ALL } from "@/features/price-search/constants";

function withStore(state: Partial<ReturnType<typeof useProductsStore.getState>>) {
  const Decorator = (Story: React.ComponentType) => {
    useEffect(() => {
      useProductsStore.setState(state);
      return () => useProductsStore.setState({ priceMin: null, priceMax: null, selectedCSI: null, selectedBrand: ALL });
    }, []);
    return <Story />;
  };
  Decorator.displayName = "StoreDecorator";
  return Decorator;
}

/**
 * Contenedor unificado de filtros: Marca / Precio (Desde–Hasta) / Cuotas.
 * Se muestra en desktop/tablet dentro de FilterPanel.
 */
const meta = {
  title: "Components/FiltersBar",
  component: FiltersBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FiltersBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado por defecto — sin filtros activos */
export const Default: Story = {
  decorators: [
    withStore({ selectedBrand: ALL, priceMin: null, priceMax: null, selectedCSI: null }),
  ],
};

/** Con precio mínimo y máximo activos */
export const WithPriceRange: Story = {
  decorators: [
    withStore({ selectedBrand: ALL, priceMin: 50000, priceMax: 300000, selectedCSI: null }),
  ],
};

/** Con cuotas sin interés de 12 activas */
export const WithCSI12: Story = {
  decorators: [
    withStore({ selectedBrand: ALL, priceMin: null, priceMax: null, selectedCSI: 12 }),
  ],
};

/** Con marca seleccionada */
export const WithBrand: Story = {
  decorators: [
    withStore({ selectedBrand: "Samsung", priceMin: null, priceMax: null, selectedCSI: null }),
  ],
};

/** Todos los filtros activos */
export const AllActive: Story = {
  decorators: [
    withStore({ selectedBrand: "LG", priceMin: 100000, priceMax: 500000, selectedCSI: 6 }),
  ],
};

/** Modo oscuro */
export const Dark: Story = {
  decorators: [
    withStore({ selectedBrand: ALL, priceMin: null, priceMax: null, selectedCSI: null }),
    (Story) => (
      <div className="dark bg-background p-4">
        <Story />
      </div>
    ),
  ],
};
