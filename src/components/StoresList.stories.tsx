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

import { useEffect } from "react";

type StoresListState = {
  stores?: StoreNamesEnum[];
  isLoading?: boolean;
};

type StoresListDecoratorComponentProps = {
  state: StoresListState;
  Story: React.ComponentType;
};

function StoresListDecorator(state: StoresListState) {
  const Decorator = (Story: React.ComponentType) => (
    <StoresListDecoratorComponent state={state} Story={Story} />
  );
  Decorator.displayName = "StoresListDecorator";
  return Decorator;
}

function StoresListDecoratorComponent({ state, Story }: Readonly<StoresListDecoratorComponentProps>) {
  useEffect(() => {
    useProductsStore.setState(state);
    return () => {
      Object.keys(state).forEach((k) => {
        let safeValue = undefined;
        if (k === "stores") safeValue = [];
        else if (k === "isLoading") safeValue = false;
        useProductsStore.setState({ [k]: safeValue });
      });
    };
  }, [state]);
  return <Story />;
}

/** Resultados encontrados en múltiples tiendas. */
export const MultipleStores: Story = {
  decorators: [StoresListDecorator({
    stores: [
      StoreNamesEnum.FRAVEGA,
      StoreNamesEnum.CETROGAR,
      StoreNamesEnum.NALDO,
      StoreNamesEnum.CARREFOUR,
    ],
    isLoading: false,
  })],
};

/** Resultado encontrado en una sola tienda. */
export const SingleStore: Story = {
  decorators: [StoresListDecorator({
    stores: [StoreNamesEnum.MERCADOLIBRE],
    isLoading: false,
  })],
};
