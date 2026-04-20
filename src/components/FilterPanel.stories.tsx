import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterPanel } from "./FilterPanel";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { useEffect } from "react";

const meta = {
  title: "Components/FilterPanel",
  component: FilterPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE_STATE = {
  products: [
    { name: "TV Samsung 55", brand: "Samsung", price: 150_000, from: StoreNamesEnum.FRAVEGA, image: "", url: "#", installment: 12 },
    { name: "TV LG 50", brand: "LG", price: 120_000, from: StoreNamesEnum.CARREFOUR, image: "", url: "#", installment: 6 },
  ],
  stores: [StoreNamesEnum.FRAVEGA, StoreNamesEnum.CARREFOUR],
  brands: ["Todas", "Samsung", "LG"],
  selectedBrand: "Todas",
  selectedStore: "Todas",
  priceMin: null as number | null,
  priceMax: null as number | null,
  selectedCSI: null as number | null,
  sortBy: "price_asc" as const,
};

function WithProductsWrapper({ stateOverrides, Story }: Readonly<{
  stateOverrides?: Partial<typeof BASE_STATE>;
  Story: React.ComponentType;
}>) {
  useEffect(() => {
    useProductsStore.setState({ ...BASE_STATE, ...stateOverrides });
  }, [stateOverrides]);
  return <div className="p-4"><Story /></div>;
}

function withProducts(stateOverrides?: Partial<typeof BASE_STATE>) {
  const Decorator = (Story: React.ComponentType) => (
    <WithProductsWrapper stateOverrides={stateOverrides} Story={Story} />
  );
  Decorator.displayName = "WithProducts";
  return Decorator;
}

export const Desktop: Story = {
  decorators: [withProducts()],
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const WithActiveFilters: Story = {
  decorators: [withProducts({ priceMin: 100_000, priceMax: 200_000, selectedCSI: 12 })],
};
