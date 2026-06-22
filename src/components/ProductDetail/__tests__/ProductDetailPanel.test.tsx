/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { StoreNamesEnum } from "@/enums/stores.enum";
import type { Product } from "@/types/product";

jest.mock("@/store/productsStore", () => ({
  useProductsStore: jest.fn(),
}));

jest.mock("@/features/price-follow/useFollowedProduct", () => ({
  useFollowedProduct: () => ({ isFollowed: false, toggle: jest.fn() }),
}));

jest.mock("@/features/price-history/history", () => ({
  fetchPriceHistory: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/components/CompareTable", () => ({
  CompareTable: ({ offers }: { offers: unknown[] }) =>
    React.createElement(
      "div",
      { "data-testid": "compare-table" },
      `${offers.length} offers`,
    ),
}));

jest.mock("@/components/PriceHistory", () => ({
  PriceHistoryChart: () =>
    React.createElement("div", { "data-testid": "price-history-chart" }),
}));

jest.mock("@/components/PriceTrend", () => ({
  PriceTrend: () =>
    React.createElement("div", { "data-testid": "price-trend" }),
}));

jest.mock("@/components/InstallmentBadge", () => ({
  InstallmentBadge: () =>
    React.createElement("div", { "data-testid": "installment-badge" }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    asChild,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    className?: string;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string }>,
        { className },
      );
    }
    return React.createElement("button", { onClick, className }, children);
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

jest.mock("@/features/price-search/image-loader", () => ({
  imageLoader: ({ src }: { src: string }) => src,
}));

jest.mock("@/features/price-search/match", () => ({
  matchOffers: jest.fn().mockReturnValue([]),
}));

import { useProductsStore } from "@/store/productsStore";
const mockUseStore = useProductsStore as jest.Mock;

import { ProductDetailPanel } from "../ProductDetailPanel";

const mockProduct: Product = {
  name: "Samsung Galaxy S24",
  brand: "Samsung",
  price: 1500000,
  from: StoreNamesEnum.FRAVEGA,
  image: "https://example.com/image.jpg",
  url: "https://fravega.com/product/1",
  installment: 12,
};

beforeEach(() => {
  mockUseStore.mockImplementation(
    (selector: (s: { products: Product[] }) => unknown) =>
      selector({ products: [mockProduct] }),
  );
});

describe("ProductDetailPanel", () => {
  it("renders the product name", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProductDetailPanel, {
        product: mockProduct,
        onBack: jest.fn(),
        currentQuery: "samsung",
      }),
    );
    expect(html).toContain("Samsung Galaxy S24");
  });

  it("renders the formatted price", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProductDetailPanel, {
        product: mockProduct,
        onBack: jest.fn(),
        currentQuery: "samsung",
      }),
    );
    // Price 1500000 formatted as ARS
    expect(html).toContain("1.500.000");
  });

  it("contains 'Volver a resultados' back button", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProductDetailPanel, {
        product: mockProduct,
        onBack: jest.fn(),
        currentQuery: "samsung",
      }),
    );
    expect(html).toContain("Volver a resultados");
  });

  it("contains 'Comparar entre tiendas' heading", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProductDetailPanel, {
        product: mockProduct,
        onBack: jest.fn(),
        currentQuery: "samsung",
      }),
    );
    expect(html).toContain("Comparar entre tiendas");
  });

  it("contains 'Historial de precios' heading", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProductDetailPanel, {
        product: mockProduct,
        onBack: jest.fn(),
        currentQuery: "samsung",
      }),
    );
    expect(html).toContain("Historial de precios");
  });
});
