import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./Header";

/**
 * Encabezado principal de la aplicación.
 * Incluye logo, nombre del sitio, modal de misión y toggle de tema.
 * Responsive: versión móvil (< sm) y escritorio (≥ sm).
 */
const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vista por defecto del encabezado. */
export const Default: Story = {};

/** Modo oscuro */
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
};
