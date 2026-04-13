import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Disclaimer from "./Disclaimer";

/**
 * Aviso importante sobre el carácter referencial de los precios.
 * Puede cerrarse con el botón × (estado interno con useState).
 */
const meta = {
  title: "Components/Disclaimer",
  component: Disclaimer,
  tags: ["autodocs"],
} satisfies Meta<typeof Disclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Aviso visible al iniciar (estado inicial por defecto). */
export const Visible: Story = {};
