import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StoreFilter } from "./StoreFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";

/**
 * Filtro de tiendas mediante chips/botones pill.
 * Muestra únicamente las tiendas donde se encontraron resultados para la búsqueda actual.
 */
const meta = {
  title: "Components/StoreFilter",
  component: StoreFilter,
  tags: ["autodocs"],
} satisfies Meta<typeof StoreFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Múltiples tiendas disponibles, ninguna seleccionada. */
export const WithStores: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        stores: [StoreNamesEnum.FRAVEGA, StoreNamesEnum.CETROGAR, StoreNamesEnum.NALDO],
        selectedStore: ALL,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Una tienda activamente seleccionada. */
export const StoreSelected: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        stores: [StoreNamesEnum.FRAVEGA, StoreNamesEnum.CETROGAR, StoreNamesEnum.MERCADOLIBRE],
        selectedStore: StoreNamesEnum.FRAVEGA,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Skeleton durante la carga. */
export const Loading: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        stores: [StoreNamesEnum.FRAVEGA],
        isLoading: true,
      });
      return <Story />;
    },
  ],
};
