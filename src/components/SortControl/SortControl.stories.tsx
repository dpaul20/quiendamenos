import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SortControl } from "./SortControl";
import { useProductsStore } from "@/store/productsStore";
import { useEffect } from "react";

const meta = {
  title: "Components/SortControl",
  component: SortControl,
  tags: ["autodocs"],
} satisfies Meta<typeof SortControl>;

export default meta;
type Story = StoryObj<typeof meta>;

type SortBy = "price_asc" | "price_desc" | "installments_desc" | "best_installment";

function SortWrapper({ sortBy, Story }: Readonly<{ sortBy: SortBy; Story: React.ComponentType }>) {
  useEffect(() => {
    useProductsStore.setState({ sortBy });
  }, [sortBy]);
  return <Story />;
}

function withSort(sortBy: SortBy) {
  const Decorator = (Story: React.ComponentType) => (
    <SortWrapper sortBy={sortBy} Story={Story} />
  );
  Decorator.displayName = `WithSort(${sortBy})`;
  return Decorator;
}

export const PriceAsc: Story = {
  decorators: [withSort("price_asc")],
};

export const PriceDesc: Story = {
  decorators: [withSort("price_desc")],
};

export const InstallmentsDesc: Story = {
  decorators: [withSort("installments_desc")],
};

export const BestInstallment: Story = {
  decorators: [withSort("best_installment")],
};
