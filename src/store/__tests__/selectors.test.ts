import { getAvailableCSI, countActiveFilters } from "../selectors";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { ALL } from "@/features/price-search/constants";
import type { Product } from "@/types/product";

const p = (installment: number): Product => ({
  name: "TV",
  brand: "Samsung",
  price: 100_000,
  from: StoreNamesEnum.FRAVEGA,
  image: "",
  url: "",
  installment,
});

describe("getAvailableCSI", () => {
  it("sin productos devuelve solo Cualquiera", () => {
    expect(getAvailableCSI([])).toEqual([{ label: "Cualquiera", value: null }]);
  });

  it("productos sin cuotas devuelve solo Cualquiera", () => {
    expect(getAvailableCSI([p(0), p(0)])).toEqual([{ label: "Cualquiera", value: null }]);
  });

  it("devuelve los valores únicos de cuotas ordenados ascendente", () => {
    const result = getAvailableCSI([p(12), p(6), p(18), p(6)]);
    expect(result).toEqual([
      { label: "Cualquiera", value: null },
      { label: "6", value: 6 },
      { label: "12", value: 12 },
      { label: "18", value: 18 },
    ]);
  });

  it("excluye productos con installment=0", () => {
    const result = getAvailableCSI([p(0), p(6), p(12)]);
    expect(result.map((o) => o.value)).not.toContain(0);
  });

  it("devuelve la etiqueta como string del número", () => {
    const result = getAvailableCSI([p(24)]);
    expect(result[1].label).toBe("24");
    expect(result[1].value).toBe(24);
  });
});

describe("countActiveFilters", () => {
  const base = {
    selectedStores: [] as string[],
    selectedBrand: ALL,
    priceMin: null as number | null,
    priceMax: null as number | null,
    selectedCSI: null as number | null,
  };

  it("sin filtros activos devuelve 0", () => {
    expect(countActiveFilters(base)).toBe(0);
  });

  it("una tienda seleccionada cuenta como 1", () => {
    expect(countActiveFilters({ ...base, selectedStores: [StoreNamesEnum.FRAVEGA] })).toBe(1);
  });

  it("múltiples tiendas seleccionadas cuentan como 1", () => {
    expect(countActiveFilters({ ...base, selectedStores: [StoreNamesEnum.FRAVEGA, StoreNamesEnum.CARREFOUR] })).toBe(1);
  });

  it("marca seleccionada cuenta como 1", () => {
    expect(countActiveFilters({ ...base, selectedBrand: "Samsung" })).toBe(1);
  });

  it("priceMin activo cuenta como 1", () => {
    expect(countActiveFilters({ ...base, priceMin: 50_000 })).toBe(1);
  });

  it("priceMax activo cuenta como 1", () => {
    expect(countActiveFilters({ ...base, priceMax: 200_000 })).toBe(1);
  });

  it("CSI activo cuenta como 1", () => {
    expect(countActiveFilters({ ...base, selectedCSI: 12 })).toBe(1);
  });

  it("todos los filtros activos devuelve 5", () => {
    expect(countActiveFilters({
      selectedStores: [StoreNamesEnum.FRAVEGA],
      selectedBrand: "Samsung",
      priceMin: 50_000,
      priceMax: 200_000,
      selectedCSI: 12,
    })).toBe(5);
  });
});
