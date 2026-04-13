import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchRow from "./SearchRow";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
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

/** Estado inicial sin productos cargados (BrandFilter oculto). */
export const Default: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({ brands: [], isLoading: false, selectedBrand: ALL });
      return <Story />;
    },
  ],
};

/** Con marcas disponibles para filtrar. */
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
