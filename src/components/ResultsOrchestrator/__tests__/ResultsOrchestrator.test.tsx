/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server";

const mockSetSelectedProduct = jest.fn();

let mockSelectedProduct: import("@/types/product.d").Product | null = null;
let mockProductSearched = "";

jest.mock("@/store/productsStore", () => ({
  useProductsStore: (selector: (s: unknown) => unknown) => {
    const state = {
      selectedProduct: mockSelectedProduct,
      setSelectedProduct: mockSetSelectedProduct,
      productSearched: mockProductSearched,
      products: [],
    };
    return selector(state);
  },
}));

jest.mock("@/components/ProductDetail/ProductDetailPanel", () => ({
  ProductDetailPanel: ({ product }: { product: { name?: string } }) => (
    <div data-testid="panel">{product.name}</div>
  ),
}));

import { ResultsOrchestrator } from "../ResultsOrchestrator";

const MOCK_PRODUCT = {
  name: "iPhone 15",
  price: 100000,
  url: "https://example.com",
  from: "Fravega",
  brand: "Apple",
  image: "",
};

describe("ResultsOrchestrator", () => {
  beforeEach(() => {
    mockSelectedProduct = null;
    mockProductSearched = "";
  });

  it("renders children when selectedProduct is null", () => {
    const html = renderToStaticMarkup(
      <ResultsOrchestrator>
        <div id="grid">grid</div>
      </ResultsOrchestrator>,
    );
    expect(html).toContain("grid");
    expect(html).not.toContain("panel");
  });

  it("renders ProductDetailPanel when selectedProduct is set", () => {
    mockSelectedProduct = MOCK_PRODUCT as import("@/types/product.d").Product;
    const html = renderToStaticMarkup(
      <ResultsOrchestrator>
        <div id="grid">grid</div>
      </ResultsOrchestrator>,
    );
    expect(html).toContain("panel");
    expect(html).toContain("iPhone 15");
    expect(html).not.toContain("grid");
  });
});
