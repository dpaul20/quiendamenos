/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const mockGetProducts = jest.fn();

jest.mock("@/store/productsStore", () => ({
  useProductsStore: jest.fn(),
  selectPhase: jest.fn(),
}));

jest.mock("zustand/react/shallow", () => ({
  useShallow: (fn: (s: unknown) => unknown) => fn,
}));

import { useProductsStore, selectPhase } from "@/store/productsStore";
const mockUseStore = useProductsStore as unknown as jest.Mock;
const mockSelectPhase = selectPhase as unknown as jest.Mock;

import CategoryChips from "../CategoryChips";

const EXPECTED_CATEGORIES = [
  "Celulares",
  "Tablets",
  "TVs",
  "Auriculares",
  "Notebooks",
  "Consolas",
  "Heladeras",
  "Lavadoras",
];

describe("CategoryChips — landing phase", () => {
  beforeEach(() => {
    mockSelectPhase.mockImplementation(() => "landing");
    mockUseStore.mockImplementation(
      (
        selector: (s: {
          productSearched: string;
          products: unknown[];
          isLoading: boolean;
          getProducts: typeof mockGetProducts;
        }) => unknown,
      ) => {
        const state = {
          productSearched: "",
          products: [],
          isLoading: false,
          getProducts: mockGetProducts,
        };
        return selector(state);
      },
    );
  });

  it("renders all 8 category chips when in landing phase", () => {
    const html = renderToStaticMarkup(React.createElement(CategoryChips));
    EXPECTED_CATEGORIES.forEach((cat) => {
      expect(html).toContain(cat);
    });
  });

  it("renders exactly 8 buttons", () => {
    const html = renderToStaticMarkup(React.createElement(CategoryChips));
    const matches = html.match(/<button/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(8);
  });
});

describe("CategoryChips — results phase", () => {
  beforeEach(() => {
    mockSelectPhase.mockImplementation(() => "results");
    mockUseStore.mockImplementation(
      (
        selector: (s: {
          productSearched: string;
          products: unknown[];
          isLoading: boolean;
          getProducts: typeof mockGetProducts;
        }) => unknown,
      ) => {
        const state = {
          productSearched: "celular",
          products: [{}],
          isLoading: false,
          getProducts: mockGetProducts,
        };
        return selector(state);
      },
    );
  });

  it("returns empty string when in results phase", () => {
    const html = renderToStaticMarkup(React.createElement(CategoryChips));
    expect(html).toBe("");
  });
});
