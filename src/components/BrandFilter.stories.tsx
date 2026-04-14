import { userEvent, within, screen } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BrandFilter from "./BrandFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { ALL } from "@/features/price-search/constants";
import { useEffect } from "react";

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

type BrandFilterState = {
  brands?: string[];
  selectedBrand?: string;
  isLoading?: boolean;
};

type BrandFilterDecoratorComponentProps = {
  state: BrandFilterState;
  Story: React.ComponentType;
};

function BrandFilterDecorator(state: BrandFilterState) {
  const Decorator = (Story: React.ComponentType) => (
    <BrandFilterDecoratorComponent state={state} Story={Story} />
  );
  Decorator.displayName = "BrandFilterDecorator";
  return Decorator;
}

function BrandFilterDecoratorComponent({
  state,
  Story,
}: Readonly<BrandFilterDecoratorComponentProps>) {
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

/** Sin marcas disponibles (debe ocultarse). */
export const NoBrands: Story = {
  decorators: [BrandFilterDecorator({ brands: [], isLoading: false })],
};

/** Solo una marca disponible. */
export const SingleBrand: Story = {
  decorators: [
    BrandFilterDecorator({
      brands: [ALL, "Samsung"],
      selectedBrand: ALL,
      isLoading: false,
    }),
  ],
};

/** Combobox con múltiples marcas disponibles, sin ninguna seleccionada. */
export const WithBrands: Story = {
  decorators: [
    BrandFilterDecorator({
      brands: [ALL, "Samsung", "LG", "Motorola", "Apple"],
      selectedBrand: ALL,
      isLoading: false,
    }),
  ],
};

/** Marca activamente seleccionada. */
export const BrandSelected: Story = {
  decorators: [
    BrandFilterDecorator({
      brands: [ALL, "Samsung", "LG", "Motorola"],
      selectedBrand: "Samsung",
      isLoading: false,
    }),
  ],
};

/** Skeleton durante la carga de productos. */
export const Loading: Story = {
  decorators: [BrandFilterDecorator({ brands: [ALL], isLoading: true })],
};

/** Interacción: el usuario selecciona una marca diferente */
export const SelectBrandInteraction: Story = {
  decorators: [
    BrandFilterDecorator({
      brands: [ALL, "Samsung", "LG", "Motorola", "Apple"],
      selectedBrand: ALL,
      isLoading: false,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Abre el combobox (en realidad es un botón con label "Marca")
    await userEvent.click(canvas.getByRole("button", { name: /marca/i }));
    // Espera y selecciona la marca "LG" (soporta portal)
    const lgOption = await screen.findByText("LG");
    await userEvent.click(lgOption);
  },
};
