import { useProductsStore } from "../productsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";

jest.mock("@/features/price-search/api", () => ({
  getProduct: jest.fn(),
}));

import { getProduct } from "@/features/price-search/api";
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
    selectedStores: [],
    stores: [],
    isLoading: false,
    error: null,
  });
  jest.clearAllMocks();
});

describe("useProductsStore", () => {
  it("getProducts carga los productos ordenados por precio ascendente", async () => {
    mockGetProduct.mockResolvedValue([
      product("TV LG", "LG", 200, StoreNamesEnum.CARREFOUR),
      product("TV Samsung", "Samsung", 100, StoreNamesEnum.FRAVEGA),
    ]);

    await useProductsStore.getState().getProducts("tv");

    const { products } = useProductsStore.getState();
    expect(products[0].price).toBe(100);
    expect(products[1].price).toBe(200);
  });

  it("getProducts incluye ALL como primer elemento de marcas", async () => {
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

  it("setSelectedBrand actualiza selectedBrand", () => {
    useProductsStore.getState().setSelectedBrand("Samsung");
    expect(useProductsStore.getState().selectedBrand).toBe("Samsung");
  });

  it("toggleStore agrega una tienda a selectedStores", () => {
    useProductsStore.getState().toggleStore(StoreNamesEnum.FRAVEGA);
    expect(useProductsStore.getState().selectedStores).toContain(StoreNamesEnum.FRAVEGA);
  });

  it("toggleStore quita una tienda ya seleccionada", () => {
    useProductsStore.setState({ selectedStores: [StoreNamesEnum.FRAVEGA] });
    useProductsStore.getState().toggleStore(StoreNamesEnum.FRAVEGA);
    expect(useProductsStore.getState().selectedStores).not.toContain(StoreNamesEnum.FRAVEGA);
  });

  it("toggleStore puede seleccionar múltiples tiendas", () => {
    useProductsStore.getState().toggleStore(StoreNamesEnum.FRAVEGA);
    useProductsStore.getState().toggleStore(StoreNamesEnum.CARREFOUR);
    const { selectedStores } = useProductsStore.getState();
    expect(selectedStores).toContain(StoreNamesEnum.FRAVEGA);
    expect(selectedStores).toContain(StoreNamesEnum.CARREFOUR);
  });

  it("setStores filtra tiendas por la marca seleccionada", () => {
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

  it("isLoading es false después de que getProducts resuelve", async () => {
    mockGetProduct.mockResolvedValue([]);

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().isLoading).toBe(false);
  });
});

describe("useProductsStore — estado de error", () => {
  it("error es null por defecto", () => {
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("setError guarda el mensaje de error", () => {
    useProductsStore.getState().setError("algo salió mal");
    expect(useProductsStore.getState().error).toBe("algo salió mal");
  });

  it("setError(null) limpia el error", () => {
    useProductsStore.setState({ error: "previo" });
    useProductsStore.getState().setError(null);
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("clearFilters resetea el error a null", () => {
    useProductsStore.setState({ error: "previo" });
    useProductsStore.getState().clearFilters();
    expect(useProductsStore.getState().error).toBeNull();
  });

  it("getProducts limpia el error al resolver con éxito", async () => {
    mockGetProduct.mockResolvedValue([]);
    useProductsStore.setState({ error: "error previo" });

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).toBeNull();
  });

  it("getProducts guarda el error cuando la API falla", async () => {
    mockGetProduct.mockRejectedValue(new Error("Network error"));

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).toBe("No se pudo conectar. Verificá tu conexión e intentá de nuevo.");
    expect(useProductsStore.getState().isLoading).toBe(false);
  });

  it("getProducts guarda el error cuando la API devuelve respuesta no exitosa", async () => {
    mockGetProduct.mockRejectedValue(new Error("500"));

    await useProductsStore.getState().getProducts("tv");

    expect(useProductsStore.getState().error).not.toBeNull();
    expect(useProductsStore.getState().isLoading).toBe(false);
  });
});
