import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CSIFilter } from "./CSIFilter";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { useEffect } from "react";

const meta = {
  title: "Components/CSIFilter",
  component: CSIFilter,
  tags: ["autodocs"],
} satisfies Meta<typeof CSIFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

function CSIWrapper({ selectedCSI, Story }: Readonly<{ selectedCSI: number | null; Story: React.ComponentType }>) {
  useEffect(() => {
    useProductsStore.setState({ selectedCSI });
  }, [selectedCSI]);
  return <Story />;
}

function withCSI(selectedCSI: number | null) {
  const Decorator = (Story: React.ComponentType) => (
    <CSIWrapper selectedCSI={selectedCSI} Story={Story} />
  );
  Decorator.displayName = `WithCSI(${selectedCSI})`;
  return Decorator;
}

export const Default: Story = {
  decorators: [withCSI(null)],
};

export const Six: Story = {
  decorators: [withCSI(6)],
};

export const Twelve: Story = {
  decorators: [withCSI(12)],
};

export const EighteenPlus: Story = {
  decorators: [withCSI(18)],
};
