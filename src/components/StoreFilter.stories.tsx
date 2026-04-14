import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StoreFilter } from "./StoreFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";
import { useEffect } from "react";
import { userEvent, within } from "storybook/test";

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

type StoreFilterState = {
  stores?: StoreNamesEnum[];
  selectedStore?: string;
  isLoading?: boolean;
};

type StoreFilterDecoratorProps = Readonly<{
  state: StoreFilterState;
  Story: React.ComponentType;
}>;

function StoreFilterDecorator(state: StoreFilterState) {
  const Decorator = (Story: React.ComponentType) => (
    <StoreFilterDecoratorComponent state={state} Story={Story} />
  );
  Decorator.displayName = "StoreFilterDecorator";
  return Decorator;
}

function StoreFilterDecoratorComponent({
  state,
  Story,
}: StoreFilterDecoratorProps) {
  useEffect(() => {
    useProductsStore.setState(state);
    return () => {
      Object.keys(state).forEach((k) => {
        let safeValue = undefined;
        if (k === "stores") safeValue = [];
        else if (k === "selectedStore") safeValue = undefined;
        else if (k === "isLoading") safeValue = false;
        useProductsStore.setState({ [k]: safeValue });
      });
    };
  }, [state]);
  return <Story />;
}

/** Múltiples tiendas disponibles, ninguna seleccionada. */
export const WithStores: Story = {
  decorators: [
    StoreFilterDecorator({
      stores: [
        StoreNamesEnum.FRAVEGA,
        StoreNamesEnum.CETROGAR,
        StoreNamesEnum.NALDO,
      ],
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};

/** Una tienda activamente seleccionada. */
export const StoreSelected: Story = {
  decorators: [
    StoreFilterDecorator({
      stores: [
        StoreNamesEnum.FRAVEGA,
        StoreNamesEnum.CETROGAR,
        StoreNamesEnum.MERCADOLIBRE,
      ],
      selectedStore: StoreNamesEnum.FRAVEGA,
      isLoading: false,
    }),
  ],
};

/** Skeleton durante la carga. */
export const Loading: Story = {
  decorators: [
    StoreFilterDecorator({
      stores: [StoreNamesEnum.FRAVEGA],
      isLoading: true,
    }),
  ],
};

/** Interacción: el usuario selecciona una tienda diferente */
export const SelectStoreInteraction: Story = {
  decorators: [
    StoreFilterDecorator({
      stores: [
        StoreNamesEnum.FRAVEGA,
        StoreNamesEnum.CETROGAR,
        StoreNamesEnum.NALDO,
      ],
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Busca y hace click en el botón de la tienda "Naldo"
    const naldoButton = await canvas.findByRole("button", { name: /naldo/i });
    await userEvent.click(naldoButton);
  },
};

/** Sin tiendas disponibles (debe ocultarse). */
export const NoStores: Story = {
  decorators: [StoreFilterDecorator({ stores: [], isLoading: false })],
};

/** Solo una tienda disponible. */
export const SingleStore: Story = {
  decorators: [
    StoreFilterDecorator({
      stores: [StoreNamesEnum.FRAVEGA],
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};
