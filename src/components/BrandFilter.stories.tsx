import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BrandFilter from "./BrandFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { ALL } from "@/features/price-search/constants";

/**
 * Filtro de marcas tipo combobox con búsqueda.
 * Se oculta cuando no hay marcas disponibles y muestra un skeleton durante la carga.
 */
const meta = {
  title: "Components/BrandFilter",
  component: BrandFilter,
  tags: ["autodocs"],
} satisfies Meta<typeof BrandFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Combobox con múltiples marcas disponibles, sin ninguna seleccionada. */
export const WithBrands: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        brands: [ALL, "Samsung", "LG", "Motorola", "Apple"],
        selectedBrand: ALL,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Marca activamente seleccionada. */
export const BrandSelected: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        brands: [ALL, "Samsung", "LG", "Motorola"],
        selectedBrand: "Samsung",
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Skeleton durante la carga de productos. */
export const Loading: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({ brands: [ALL], isLoading: true });
      return <Story />;
    },
  ],
};
