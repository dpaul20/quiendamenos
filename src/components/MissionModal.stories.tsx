import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MissionModal from "./MissionModal";

/**
 * Modal "¿Quién da menos?" que describe la misión y filosofía del proyecto.
 * Se activa con el botón del encabezado. Incluye enlace al autor.
 */
const meta = {
  title: "Components/MissionModal",
  component: MissionModal,
  tags: ["autodocs"],
} satisfies Meta<typeof MissionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Botón del trigger (el modal se abre al hacer clic). */
export const Default: Story = {};
