import { userEvent, screen } from "storybook/test";
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

/** Interacción: el usuario cierra el aviso */
export const CloseInteraction: Story = {
  play: async () => {
    // Busca y hace click en el botón de cerrar (aria-label)
    const closeButton = await screen.findByRole("button", {
      name: /cerrar aviso/i,
    });
    await userEvent.click(closeButton);
    // Opcional: verificar que el aviso ya no esté en el DOM
    // expect(screen.queryByText(/aviso importante/i)).toBeNull();
  },
};
