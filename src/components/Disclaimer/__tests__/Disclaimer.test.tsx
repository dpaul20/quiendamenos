/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

jest.mock("@/store/productsStore", () => ({
  useProductsStore: jest.fn(),
}));

import { useProductsStore } from "@/store/productsStore";
const mockUseStore = useProductsStore as jest.Mock;

import Disclaimer from "../Disclaimer";

describe("Disclaimer — phase gate", () => {
  it("returns empty string when productSearched is empty (landing phase)", () => {
    mockUseStore.mockImplementation(
      (selector: (s: { productSearched: string }) => unknown) =>
        selector({ productSearched: "" }),
    );
    const html = renderToStaticMarkup(React.createElement(Disclaimer));
    expect(html).toBe("");
  });

  it("renders the disclaimer content when productSearched is non-empty (results phase)", () => {
    mockUseStore.mockImplementation(
      (selector: (s: { productSearched: string }) => unknown) =>
        selector({ productSearched: "celular" }),
    );
    const html = renderToStaticMarkup(React.createElement(Disclaimer));
    expect(html).toContain("¿Cómo funciona?");
  });

  it("renders the disclaimer for any non-empty productSearched value", () => {
    mockUseStore.mockImplementation(
      (selector: (s: { productSearched: string }) => unknown) =>
        selector({ productSearched: "notebook" }),
    );
    const html = renderToStaticMarkup(React.createElement(Disclaimer));
    expect(html).toContain("¿Cómo funciona?");
  });
});
