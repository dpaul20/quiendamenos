import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StoresList } from "./StoresList";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";

/**
 * Panel informativo que resume las tiendas donde se encontraron resultados.
 * Muestra el número de tiendas y sus nombres en una sola línea.
 */
const meta = {
  title: "Components/StoresList",
  component: StoresList,
  tags: ["autodocs"],
} satisfies Meta<typeof StoresList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resultados encontrados en múltiples tiendas. */
export const MultipleStores: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        stores: [
          StoreNamesEnum.FRAVEGA,
          StoreNamesEnum.CETROGAR,
          StoreNamesEnum.NALDO,
          StoreNamesEnum.CARREFOUR,
        ],
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Resultado encontrado en una sola tienda. */
export const SingleStore: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        stores: [StoreNamesEnum.MERCADOLIBRE],
        isLoading: false,
      });
      return <Story />;
    },
  ],
};
