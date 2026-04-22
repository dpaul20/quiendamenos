import { useProductsStore } from "../productsStore";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";

jest.mock("@/features/price-search/api", () => ({ getProduct: jest.fn() }));

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
    selectedStores: [],
    stores: [],
    isLoading: false,
    priceMin: null,
    priceMax: null,
    selectedCSI: null,
    sortBy: "price_asc",
  });
});

describe("filteredProducts", () => {
  it("sin filtros → devuelve todos los productos ordenados por precio asc", () => {
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([90_000, 120_000, 150_000, 300_000]);
  });

  it("priceMin excluye productos por debajo del umbral", () => {
    useProductsStore.setState({ priceMin: 130_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([150_000, 300_000]);
  });

  it("priceMax excluye productos por encima del umbral", () => {
    useProductsStore.setState({ priceMax: 140_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([90_000, 120_000]);
  });

  it("priceMin + priceMax aplica rango de precio", () => {
    useProductsStore.setState({ priceMin: 100_000, priceMax: 200_000 });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([120_000, 150_000]);
  });

  it("selectedCSI=6 muestra solo productos con exactamente 6 cuotas", () => {
    useProductsStore.setState({ selectedCSI: 6 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("TV LG 50");
  });

  it("selectedCSI=18 muestra solo productos con exactamente 18 cuotas", () => {
    useProductsStore.setState({ selectedCSI: 18 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("TV Sony 65");
  });

  it("selectedCSI=null (Cualquiera) muestra todos los productos", () => {
    useProductsStore.setState({ selectedCSI: null });
    const { filteredProducts } = useProductsStore.getState();
    expect(filteredProducts()).toHaveLength(4);
  });

  it("sortBy=price_desc ordena de mayor a menor precio", () => {
    useProductsStore.setState({ sortBy: "price_desc" });
    const { filteredProducts } = useProductsStore.getState();
    const prices = filteredProducts().map((p) => p.price);
    expect(prices).toEqual([300_000, 150_000, 120_000, 90_000]);
  });

  it("sortBy=installments_desc ordena por cantidad de cuotas descendente", () => {
    useProductsStore.setState({ sortBy: "installments_desc" });
    const { filteredProducts } = useProductsStore.getState();
    const installments = filteredProducts().map((p) => p.installment);
    expect(installments[0]).toBe(18);
    expect(installments[1]).toBe(12);
  });

  it("sortBy=best_installment ordena por precio/cuota ascendente (ignora sin cuotas)", () => {
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

  it("filtro de marca funciona combinado con filtros de precio", () => {
    useProductsStore.setState({ selectedBrand: "Samsung", priceMax: 160_000 });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results.every((p) => p.brand === "Samsung")).toBe(true);
    expect(results.every((p) => (p.price ?? 0) <= 160_000)).toBe(true);
  });

  it("selectedStores vacío muestra productos de todas las tiendas", () => {
    useProductsStore.setState({ selectedStores: [] });
    const { filteredProducts } = useProductsStore.getState();
    expect(filteredProducts()).toHaveLength(4);
  });

  it("selectedStores con una tienda muestra solo sus productos", () => {
    useProductsStore.setState({ selectedStores: [StoreNamesEnum.FRAVEGA] });
    const { filteredProducts } = useProductsStore.getState();
    const results = filteredProducts();
    expect(results).toHaveLength(2);
    expect(results.every((p) => p.from === StoreNamesEnum.FRAVEGA)).toBe(true);
  });

  it("selectedStores con múltiples tiendas muestra productos de todas ellas", () => {
    useProductsStore.setState({ selectedStores: [StoreNamesEnum.FRAVEGA, StoreNamesEnum.CARREFOUR] });
    const { filteredProducts } = useProductsStore.getState();
    expect(filteredProducts()).toHaveLength(4);
  });
});

describe("setPriceMin / setPriceMax / setSelectedCSI / setSortBy", () => {
  it("setPriceMin actualiza priceMin", () => {
    useProductsStore.getState().setPriceMin(50_000);
    expect(useProductsStore.getState().priceMin).toBe(50_000);
  });

  it("setPriceMax actualiza priceMax", () => {
    useProductsStore.getState().setPriceMax(200_000);
    expect(useProductsStore.getState().priceMax).toBe(200_000);
  });

  it("setSelectedCSI actualiza selectedCSI", () => {
    useProductsStore.getState().setSelectedCSI(12);
    expect(useProductsStore.getState().selectedCSI).toBe(12);
  });

  it("setSortBy actualiza sortBy", () => {
    useProductsStore.getState().setSortBy("price_desc");
    expect(useProductsStore.getState().sortBy).toBe("price_desc");
  });
});

describe("clearFilters", () => {
  it("resetea todos los filtros a sus valores por defecto", () => {
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
