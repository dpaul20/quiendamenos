import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchForm from "./SearchForm";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

/**
 * Formulario de búsqueda de productos por nombre.
 * Incluye un campo de texto y un botón con estado de carga animado.
 */
const meta = {
  title: "Components/SearchForm",
  component: SearchForm,
  tags: ["autodocs"],
} satisfies Meta<typeof SearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado base listo para recibir una búsqueda. */
export const Default: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({ isLoading: false });
      return <Story />;
    },
  ],
};

/** Estado durante una búsqueda activa (spinner + texto "Buscando..."). */
export const Loading: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({ isLoading: true });
      return <Story />;
    },
  ],
};
