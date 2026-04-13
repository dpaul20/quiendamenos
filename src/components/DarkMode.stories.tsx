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
