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

/** Lista con productos cargados y sin filtros activos. */
export const WithProducts: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        products: MOCK_PRODUCTS,
        selectedBrand: ALL,
        selectedStore: ALL,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

/** Skeleton cards con animación de carga. */
export const Loading: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        products: [],
        isLoading: true,
        selectedBrand: ALL,
        selectedStore: ALL,
      });
      return <Story />;
    },
  ],
};

/** Sin resultados para el filtro activo (muestra EmptyState). */
export const Empty: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        products: [],
        isLoading: false,
        selectedBrand: ALL,
        selectedStore: ALL,
      });
      return <Story />;
    },
  ],
};

/** Filtrado a una sola tienda. */
export const FilteredByStore: Story = {
  decorators: [
    (Story) => {
      useProductsStore.setState({
        products: MOCK_PRODUCTS,
        selectedBrand: ALL,
        selectedStore: StoreNamesEnum.FRAVEGA,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};
