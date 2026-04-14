import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

/**
 * Estado vacío que se muestra cuando la búsqueda no arroja resultados.
 * Incluye un ícono ilustrativo y texto descriptivo.
 */
const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
