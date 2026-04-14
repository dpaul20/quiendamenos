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

import { useEffect } from "react";

type SearchFormState = {
  isLoading?: boolean;
};

function resetStoreState(state: SearchFormState) {
  Object.keys(state).forEach((k) => {
    let safeValue = undefined;
    if (k === "isLoading") safeValue = false;
    useProductsStore.setState({ [k]: safeValue });
  });
}

function useSetStoreState(state: SearchFormState) {
  useEffect(() => {
    useProductsStore.setState(state);
    return () => {
      resetStoreState(state);
    };
  }, [state]);
}

function SearchFormDecorator(state: SearchFormState) {
  const Decorator = (Story: React.ComponentType) => {
    useSetStoreState(state);
    return <Story />;
  };
  Decorator.displayName = "SearchFormDecorator";
  return Decorator;
}

/** Estado base listo para recibir una búsqueda. */
export const Default: Story = {
  decorators: [SearchFormDecorator({ isLoading: false })],
};

/** Estado durante una búsqueda activa (spinner + texto "Buscando..."). */
export const Loading: Story = {
  decorators: [SearchFormDecorator({ isLoading: true })],
};
