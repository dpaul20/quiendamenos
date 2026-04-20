import { useProductsStore } from "../hooks/useProductsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "../constants";

jest.mock("../api", () => ({
  getProduct: jest.fn(),
}));

import { getProduct } from "../api";
const mockGetProduct = getProduct as jest.Mock;

const product = (name: string, brand: string, price: number, from: StoreNamesEnum) => ({
  name, brand, price, from, image: "", url: "", installment: 0,
});

beforeEach(() => {
  useProductsStore.setState({
    products: [],
    productSearched: "",
    brands: [],
    selectedBrand: ALL,
    selectedStore: ALL,
    stores: [],
    isLoading: false,
    error: null,
  });
  jest.clearAllMocks();
});

describe("useProductsStore", () => {
  it("getProducts populates products sorted by price ascending", async () => {
    mockGetProduct.mockResolvedValue([
      product("TV LG", "LG", 200, StoreNamesEnum.CARREFOUR),
      product("TV Samsung", "Samsung", 100, StoreNamesEnum.FRAVEGA),
    ]);

    await useProductsStore.getState().getProducts("tv");

    const { products } = useProductsStore.getState();
    expect(products[0].price).toBe(100);
    expect(products[1].price).toBe(200);
  });

  it("getProducts sets brands with ALL at index 0", async () => {
    mockGetProduct.mockResolvedValue([
      product("TV LG", "LG", 100, StoreNamesEnum.CARREFOUR),
      product("TV Samsung", "Samsung", 200, StoreNamesEnum.FRAVEGA),
    ]);

    await useProductsStore.getState().getProducts("tv");

    const { brands } = useProductsStore.getState();
    expect(brands[0]).toBe(ALL);
    expect(brands).toContain("Lg");
    expect(brands).toContain("Samsung");
  });

  it("setSelectedBrand updates selectedBrand", () => {
    useProductsStore.getState().setSelectedBrand("Samsung");
    expect(useProductsStore.getState().selectedBrand).toBe("Samsung");
  });

  it("setSelectedStore updates selectedStore", () => {
    useProductsStore.getState().setSelectedStore(StoreNamesEnum.FRAVEGA);
    expect(useProductsStore.getState().selectedStore).toBe(StoreNamesEnum.FRAVEGA);
  });

  it("setStores filters stores by selectedBrand", () => {
    useProductsStore.setState({
      products: [
        product("TV Samsung", "Samsung", 100, StoreNamesEnum.CARREFOUR),
        product("TV LG", "Lg", 200, StoreNamesEnum.FRAVEGA),
      ],
      selectedBrand: "Samsung",
    });

    useProductsStore.getState().setStores();

    const { stores } = useProductsStore.getState();
    expect(stores).toContain(StoreNamesEnum.CARREFOUR);
    expect(stores).not.toContain(StoreNamesEnum.FRAVEGA);
  });

  it("isLoading is false after getProducts resolves", async () => {
    mockGetProduct.mockResolvedValue([]);

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().isLoading).toBe(false);
  });
});

describe("useProductsStore — error state", () => {
  it("error is null by default", () => {
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("setError sets the error message", () => {
    useProductsStore.getState().setError("algo salió mal");
    expect(useProductsStore.getState().error).toBe("algo salió mal");
  });

  it("setError(null) clears the error", () => {
    useProductsStore.setState({ error: "previo" });
    useProductsStore.getState().setError(null);
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("clearFilters resets error to null", () => {
    useProductsStore.setState({ error: "previo" });
    useProductsStore.getState().clearFilters();
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("getProducts clears error on success", async () => {
    mockGetProduct.mockResolvedValue([]);
    useProductsStore.setState({ error: "error previo" });

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).toBeNull();
  });

  it("getProducts sets error when API throws", async () => {
    mockGetProduct.mockRejectedValue(new Error("Network error"));

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).toBe("No se pudo conectar. Verificá tu conexión e intentá de nuevo.");
    expect(useProductsStore.getState().isLoading).toBe(false);
  });

  it("getProducts sets error when API returns non-ok response", async () => {
    mockGetProduct.mockRejectedValue(new Error("500"));

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).not.toBeNull();
    expect(useProductsStore.getState().isLoading).toBe(false);
  });
});
