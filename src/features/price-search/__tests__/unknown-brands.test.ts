import { updateUnknownBrands } from "../unknown-brands";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

const base: Omit<Product, "brand" | "name"> = {
  price: 100,
  from: StoreNamesEnum.Carrefour,
  image: "",
  url: "",
  installment: 0,
};

describe("updateUnknownBrands", () => {
  it("returns empty array for empty input", () => {
    expect(updateUnknownBrands([])).toEqual([]);
  });

  it("resolves unknown brand when product name contains a known brand", () => {
    const products: Product[] = [
      { ...base, name: "Samsung TV 55", brand: "unknown" },
      { ...base, name: "Samsung Galaxy", brand: "Samsung" },
    ];
    const result = updateUnknownBrands(products);
    expect(result[0].brand).toBe("SAMSUNG");
  });

  it("leaves brand unchanged when no known brand matches product name", () => {
    const products: Product[] = [
      { ...base, name: "Generic TV", brand: "unknown" },
      { ...base, name: "LG Oled", brand: "LG" },
    ];
    const result = updateUnknownBrands(products);
    expect(result[0].brand).toBe("unknown");
  });

  it("does not modify products with known brands", () => {
    const products: Product[] = [
      { ...base, name: "Samsung TV", brand: "Samsung" },
    ];
    const result = updateUnknownBrands(products);
    expect(result[0].brand).toBe("Samsung");
  });

  it("matching is case-insensitive", () => {
    const products: Product[] = [
      { ...base, name: "samsung galaxy s24", brand: "unknown" },
      { ...base, name: "flagship", brand: "SAMSUNG" },
    ];
    const result = updateUnknownBrands(products);
    expect(result[0].brand).toBe("SAMSUNG");
  });
});
