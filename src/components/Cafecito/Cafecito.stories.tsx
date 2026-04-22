import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Cafecito from "./Cafecito";

/**
 * Componente de donación de Cafecito.
 * Muestra un mensaje motivacional y un enlace al perfil del proyecto en cafecito.app.
 */
const meta = {
  title: "Components/Cafecito",
  component: Cafecito,
  tags: ["autodocs"],
} satisfies Meta<typeof Cafecito>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
