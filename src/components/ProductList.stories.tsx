import { userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ProductList from "./ProductList";
import { useProductsStore } from "@/features/price-search/hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";
import type { Product } from "@/types/product";

const MOCK_PRODUCTS: Product[] = [
  {
    from: StoreNamesEnum.FRAVEGA,
    name: "Samsung Galaxy S24 128GB Negro",
    price: 850000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=Samsung",
    url: "https://fravega.com/p/123",
    brand: "samsung",
    installment: 12,
  },
  {
    from: StoreNamesEnum.CETROGAR,
    name: 'LG Smart TV 55" 4K UHD',
    price: 1200000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=LG",
    url: "https://cetrogar.com.ar/p/456",
    brand: "lg",
    installment: 6,
  },
  {
    from: StoreNamesEnum.NALDO,
    name: "Motorola Edge 40 Neo 256GB",
    price: 320000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=Motorola",
    url: "https://naldo.com.ar/p/789",
    brand: "motorola",
  },
  {
    from: StoreNamesEnum.MERCADOLIBRE,
    name: "Apple AirPods Pro 2da Generación",
    price: 450000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=Apple",
    url: "https://mercadolibre.com.ar/MLA-123",
    brand: "apple",
    installment: 18,
  },
  {
    from: StoreNamesEnum.CARREFOUR,
    name: "Sony WH-1000XM5 Auriculares Bluetooth",
    price: 280000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=Sony",
    url: "https://carrefour.com.ar/p/321",
    brand: "sony",
  },
  {
    from: StoreNamesEnum.ONCITY,
    name: "Xiaomi Redmi Note 13 Pro 256GB",
    price: 195000,
    image: "https://placehold.co/400x320/e2e8f0/475569?text=Xiaomi",
    url: "https://oncity.com.ar/p/654",
    brand: "xiaomi",
    installment: 3,
  },
];

/**
 * Lista paginada de productos con soporte de filtros por marca y tienda.
 * Incluye skeleton cards con mensajes dinámicos durante la carga
 * y el componente EmptyState cuando no hay resultados.
 */
const meta = {
  title: "Components/ProductList",
  component: ProductList,
  tags: ["autodocs"],
} satisfies Meta<typeof ProductList>;

export default meta;
type Story = StoryObj<typeof meta>;

import { useEffect } from "react";

type ProductListState = {
  products?: Product[];
  selectedBrand?: string;
  selectedStore?: string;
  isLoading?: boolean;
};

type ProductListDecoratorComponentProps = Readonly<{
  state: ProductListState;
  Story: React.ComponentType;
}>;

function ProductListDecorator(state: ProductListState) {
  const Decorator = (Story: React.ComponentType) => (
    <ProductListDecoratorComponent state={state} Story={Story} />
  );
  Decorator.displayName = "ProductListDecorator";
  return Decorator;
}

function ProductListDecoratorComponent({
  state,
  Story,
}: ProductListDecoratorComponentProps) {
  useEffect(() => {
    useProductsStore.setState(state);
    return () => {
      Object.keys(state).forEach((k) => {
        let safeValue = undefined;
        if (k === "products") safeValue = [];
        else if (k === "isLoading") safeValue = false;
        else if (k === "selectedBrand") safeValue = undefined;
        else if (k === "selectedStore") safeValue = undefined;
        useProductsStore.setState({ [k]: safeValue });
      });
    };
  }, [state]);
  return <Story />;
}

/** Lista con productos cargados y sin filtros activos. */
export const WithProducts: Story = {
  decorators: [
    ProductListDecorator({
      products: MOCK_PRODUCTS,
      selectedBrand: ALL,
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};

/** Skeleton cards con animación de carga. */
export const Loading: Story = {
  decorators: [
    ProductListDecorator({
      products: [],
      isLoading: true,
      selectedBrand: ALL,
      selectedStore: ALL,
    }),
  ],
};

/** Sin resultados para el filtro activo (muestra EmptyState). */
export const Empty: Story = {
  decorators: [
    ProductListDecorator({
      products: [],
      isLoading: false,
      selectedBrand: ALL,
      selectedStore: ALL,
    }),
  ],
};

/** Filtrado a una sola tienda. */
export const FilteredByStore: Story = {
  decorators: [
    ProductListDecorator({
      products: MOCK_PRODUCTS,
      selectedBrand: ALL,
      selectedStore: StoreNamesEnum.FRAVEGA,
      isLoading: false,
    }),
  ],
};

/** Interacción: paginación (cambiar de página) */
export const PaginationInteraction: Story = {
  decorators: [
    ProductListDecorator({
      products: Array.from({ length: 30 }, (_, i) => ({
        from: StoreNamesEnum.FRAVEGA,
        name: `Producto ${i + 1}`,
        price: 1000 * (i + 1),
        image: "https://placehold.co/400x320/e2e8f0/475569?text=Prod",
        url: `https://fravega.com/p/${i + 1}`,
        brand: "samsung",
      })),
      selectedBrand: ALL,
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click en botón siguiente para cambiar de página
    await userEvent.click(
      canvas.getByRole("button", { name: /siguiente|sig\./i }),
    );
    // Click en botón anterior para volver
    await userEvent.click(
      canvas.getByRole("button", { name: /anterior|ant\./i }),
    );
  },
};

/** Producto sin imagen, precio, url o nombre (no debe renderizar nada) */
export const ProductMissingFields: Story = {
  decorators: [
    ProductListDecorator({
      products: [
        {
          from: StoreNamesEnum.FRAVEGA,
          name: "",
          price: 1000,
          image: "",
          url: "",
          brand: "samsung",
        },
        {
          from: StoreNamesEnum.FRAVEGA,
          name: "Sin precio",
          price: undefined,
          image: "https://placehold.co/400x320",
          url: "https://fravega.com/p/999",
          brand: "samsung",
        },
        {
          from: StoreNamesEnum.FRAVEGA,
          name: "Sin imagen",
          price: 1000,
          image: "",
          url: "https://fravega.com/p/998",
          brand: "samsung",
        },
        {
          from: StoreNamesEnum.FRAVEGA,
          name: "Sin url",
          price: 1000,
          image: "https://placehold.co/400x320",
          url: undefined,
          brand: "samsung",
        },
      ],
      selectedBrand: ALL,
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};

/** Producto con cuotas (installment) */
export const ProductWithInstallment: Story = {
  decorators: [
    ProductListDecorator({
      products: [
        {
          from: StoreNamesEnum.FRAVEGA,
          name: "Producto con cuotas",
          price: 50000,
          image: "https://placehold.co/400x320",
          url: "https://fravega.com/p/inst",
          brand: "samsung",
          installment: 24,
        },
      ],
      selectedBrand: ALL,
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};

/** Paginación con muchas páginas (verifica aparición de ellipsis y cambio de página por número) */
export const PaginationEllipsis: Story = {
  decorators: [
    ProductListDecorator({
      products: Array.from({ length: 100 }, (_, i) => ({
        from: StoreNamesEnum.FRAVEGA,
        name: `Producto ${i + 1}`,
        price: 1000 * (i + 1),
        image: 'https://placehold.co/400x320',
        url: `https://fravega.com/p/${i + 1}`,
        brand: 'samsung',
      })),
      selectedBrand: ALL,
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Avanza hasta que el botón "5" esté visible
    for (let i = 0; i < 4; i++) {
      await userEvent.click(canvas.getByRole("button", { name: /siguiente|sig\./i }));
    }
    await userEvent.click(canvas.getByRole("button", { name: "5" }));
    // Opcional: podrías verificar que el primer producto visible sea "Producto 49" (índice 48)
  },
};

/** Filtro activo sin resultados (EmptyState) */
export const FilteredNoResults: Story = {
  decorators: [
    ProductListDecorator({
      products: MOCK_PRODUCTS,
      selectedBrand: "no-existe",
      selectedStore: ALL,
      isLoading: false,
    }),
  ],
};
