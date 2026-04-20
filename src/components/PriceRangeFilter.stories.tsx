import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { useEffect } from "react";

const meta = {
  title: "Components/PriceRangeFilter",
  component: PriceRangeFilter,
  tags: ["autodocs"],
} satisfies Meta<typeof PriceRangeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

type PriceState = { priceMin?: number | null; priceMax?: number | null };

function PriceStateWrapper({ state, Story }: Readonly<{ state: PriceState; Story: React.ComponentType }>) {
  useEffect(() => {
    useProductsStore.setState({ priceMin: state.priceMin ?? null, priceMax: state.priceMax ?? null });
  }, [state]);
  return <Story />;
}

function withPriceState(state: PriceState) {
  const Decorator = (Story: React.ComponentType) => (
    <PriceStateWrapper state={state} Story={Story} />
  );
  Decorator.displayName = `WithPriceState`;
  return Decorator;
}

export const Default: Story = {
  decorators: [withPriceState({})],
};

export const WithMinSet: Story = {
  decorators: [withPriceState({ priceMin: 100_000 })],
};

export const WithRange: Story = {
  decorators: [withPriceState({ priceMin: 100_000, priceMax: 300_000 })],
};
