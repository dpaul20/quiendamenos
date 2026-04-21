import { userEvent, screen } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ModeToggle } from "./DarkMode";

/**
 * Botón de alternancia entre modo claro y oscuro.
 * Usa `next-themes` a través del ThemeProvider global del preview.
 */
const meta = {
  title: "Components/DarkMode/ModeToggle",
  component: ModeToggle,
  tags: ["autodocs"],
} satisfies Meta<typeof ModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Interacción: el usuario alterna el modo claro/oscuro */
export const ToggleInteraction: Story = {
  play: async () => {
    // Busca y hace click en el botón de toggle (usa aria-label o sr-only)
    const toggleButton = await screen.findByRole("button", {
      name: /toggle theme/i,
    });
    await userEvent.click(toggleButton);
    // Opcional: podrías verificar el cambio de clase en el body/document
  },
};
