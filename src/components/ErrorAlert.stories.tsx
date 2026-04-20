import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { ErrorAlert } from "./ErrorAlert";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";

function withError(error: string | null) {
  const Decorator = (Story: React.ComponentType) => {
    useEffect(() => {
      useProductsStore.setState({ error });
      return () => useProductsStore.setState({ error: null });
    }, []);
    return <Story />;
  };
  Decorator.displayName = "ErrorDecorator";
  return Decorator;
}

/**
 * Alerta de error que se muestra cuando el store tiene un mensaje de error.
 * Se oculta completamente cuando no hay error.
 */
const meta = {
  title: "Components/ErrorAlert",
  component: ErrorAlert,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Con mensaje de error de conexión */
export const ConnectionError: Story = {
  decorators: [
    withError("No se pudo conectar. Verificá tu conexión e intentá de nuevo."),
  ],
};

/** Sin error: no renderiza nada */
export const NoError: Story = {
  decorators: [withError(null)],
};

/** Modo oscuro con error */
export const Dark: Story = {
  decorators: [
    withError("No se pudo conectar. Verificá tu conexión e intentá de nuevo."),
    (Story) => (
      <div className="dark bg-background p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
};
