import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PriceAlertDialog } from "./PriceAlertDialog";

/**
 * Dialog controlled para capturar el email del usuario y suscribirlo
 * a alertas de bajada de precio de un producto determinado.
 */
const meta = {
  title: "Components/PriceAlertDialog",
  component: PriceAlertDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: async () => {},
  },
} satisfies Meta<typeof PriceAlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado por defecto con el diálogo abierto. */
export const Default: Story = {
  args: {
    productName: "iPhone 15 Pro 256GB",
  },
};

/** Con un email pre-cargado del localStorage. */
export const WithDefaultEmail: Story = {
  args: {
    productName: "Samsung Galaxy S24",
    defaultEmail: "usuario@ejemplo.com",
  },
};

/** Mientras se procesa el envío. */
export const Loading: Story = {
  args: {
    productName: "MacBook Air M3",
    loading: true,
  },
};

/** Cuando el servidor devuelve un error. */
export const WithError: Story = {
  args: {
    productName: "Sony WH-1000XM5",
    error: "No pudimos registrar tu email. Intentá de nuevo.",
  },
};

/** Diálogo cerrado — no renderiza nada. */
export const Closed: Story = {
  args: {
    open: false,
    productName: "Nintendo Switch OLED",
  },
};
