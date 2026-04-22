import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "./Footer";

/**
 * Pie de página de la aplicación.
 * Contiene el botón de donación de Cafecito y fondo verde suave.
 */
const meta = {
  title: "Components/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

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
