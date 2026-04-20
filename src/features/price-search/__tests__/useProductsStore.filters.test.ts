import { useProductsStore } from "../hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "../constants";

jest.mock("../api", () => ({ getProduct: jest.fn() }));

const p = (
  name: string,
  brand: string,
  price: number,
  from: StoreNamesEnum,
  installment = 0
) => ({ name, brand, price, from, image: "", url: "", installment });

const BASE_PRODUCTS = [
  p("TV Samsung 55", "Samsung", 150_000, StoreNamesEnum.FRAVEGA, 12),
  p("TV LG 50", "LG", 120_000, StoreNamesEnum.CARREFOUR, 6),
  p("TV Sony 65", "Sony", 300_000, StoreNamesEnum.FRAVEGA, 18),
  p("TV Samsung 43", "Samsung", 90_000, StoreNamesEnum.CARREFOUR, 0),
];

beforeEach(() => {
  useProductsStore.setState({
    products: BASE_PRODUCTS,
    productSearched: "tv",
    brands: [ALL, "Samsung", "Lg", "Sony"],
    selectedBrand: ALL,
    selectedStore: ALL,
    stores: [],
    isLoading: false,
    priceMin: null,
    priceMax: null,
    selectedCSI: null,
    sortBy: "price_asc",
  });
});

describe("filteredProducts", () => {
  it("no filters → returns all products sorted by price_asc", () => {
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([90_000, 120_000, 150_000, 300_000]);
  });

  it("priceMin filters out products below threshold", () => {
    useProductsStore.setState({ priceMin: 130_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([150_000, 300_000]);
  });

  it("priceMax filters out products above threshold", () => {
    useProductsStore.setState({ priceMax: 140_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([90_000, 120_000]);
  });

  it("priceMin + priceMax applies range", () => {
    useProductsStore.setState({ priceMin: 100_000, priceMax: 200_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([120_000, 150_000]);
  });

  it("selectedCSI=6 shows only products with installment >= 6", () => {
    useProductsStore.setState({ selectedCSI: 6 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results.every((p) => (p.installment ?? 0) >= 6)).toBe(true);
    expect(results.map((p) => p.name)).not.toContain("TV Samsung 43");
  });

  it("selectedCSI=18 shows only products with installment >= 18", () => {
    useProductsStore.setState({ selectedCSI: 18 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("TV Sony 65");
  });

  it("selectedCSI=null (Cualquiera) shows all products", () => {
    useProductsStore.setState({ selectedCSI: null });
    const { filteredProducts } = useProductsStore.getState();
    expect(filteredProducts()).toHaveLength(4);
  });

  it("sortBy=price_desc sorts descending", () => {
    useProductsStore.setState({ sortBy: "price_desc" });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([300_000, 150_000, 120_000, 90_000]);
  });

  it("sortBy=installments_desc sorts by installment count descending", () => {
    useProductsStore.setState({ sortBy: "installments_desc" });
    const { filteredProducts } = useProductsStore.getState();
    const installments = filteredProducts().map((p) => p.installment);
    expect(installments[0]).toBe(18);
    expect(installments[1]).toBe(12);
  });

  it("sortBy=best_installment sorts by price/installment ascending (skips 0)", () => {
    useProductsStore.setState({ sortBy: "best_installment" });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    const withCSI = results.filter((p) => (p.installment ?? 0) > 0);
    for (let i = 1; i < withCSI.length; i++) {
      const prev = withCSI[i - 1].price! / withCSI[i - 1].installment!;
      const curr = withCSI[i].price! / withCSI[i].installment!;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it("selectedBrand filter still works alongside new filters", () => {
    useProductsStore.setState({ selectedBrand: "Samsung", priceMax: 160_000 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results.every((p) => p.brand === "Samsung")).toBe(true);
    expect(results.every((p) => (p.price ?? 0) <= 160_000)).toBe(true);
  });
});

describe("setPriceMin / setPriceMax / setSelectedCSI / setSortBy", () => {
  it("setPriceMin updates priceMin", () => {
    useProductsStore.getState().setPriceMin(50_000);
    expect(useProductsStore.getState().priceMin).toBe(50_000);
  });

  it("setPriceMax updates priceMax", () => {
    useProductsStore.getState().setPriceMax(200_000);
    expect(useProductsStore.getState().priceMax).toBe(200_000);
  });

  it("setSelectedCSI updates selectedCSI", () => {
    useProductsStore.getState().setSelectedCSI(12);
    expect(useProductsStore.getState().selectedCSI).toBe(12);
  });

  it("setSortBy updates sortBy", () => {
    useProductsStore.getState().setSortBy("price_desc");
    expect(useProductsStore.getState().sortBy).toBe("price_desc");
  });
});

describe("clearFilters", () => {
  it("resets all new filters to defaults", () => {
    useProductsStore.setState({
      priceMin: 100_000,
      priceMax: 200_000,
      selectedCSI: 12,
      sortBy: "price_desc",
    });

    useProductsStore.getState().clearFilters();

    const state = useProductsStore.getState();
    expect(state.priceMin).toBeNull();
    expect(state.priceMax).toBeNull();
    expect(state.selectedCSI).toBeNull();
    expect(state.sortBy).toBe("price_asc");
  });
});
