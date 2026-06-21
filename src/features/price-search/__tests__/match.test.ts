import { matchOffers } from "../match";
import { StoreNamesEnum } from "@/enums/stores.enum";
import type { Product } from "@/types/product.d";

const makeProduct = (
  overrides: Partial<Product> & { from: StoreNamesEnum },
): Product => ({
  name: undefined,
  price: undefined,
  image: "",
  url: undefined,
  brand: "",
  ...overrides,
});

const clicked: Product = {
  from: StoreNamesEnum.FRAVEGA,
  name: "Samsung Galaxy S24 256GB Negro",
  price: 100000,
  image: "",
  url: "https://fravega.com/s24",
  brand: "Samsung",
  installment: 12,
};

describe("matchOffers", () => {
  it("always includes the clicked product (same url)", () => {
    const result = matchOffers(clicked, [clicked]);
    expect(result.some((o) => o.url === clicked.url)).toBe(true);
  });

  it("excludes candidates from the same store (same from)", () => {
    const sameStore: Product = {
      ...clicked,
      url: "https://fravega.com/s24-variant",
      price: 90000,
    };
    const result = matchOffers(clicked, [clicked, sameStore]);
    expect(
      result.filter((o) => o.store === StoreNamesEnum.FRAVEGA),
    ).toHaveLength(1);
  });

  it("matches if all numeric tokens from clicked are in candidate and >=2 text tokens overlap", () => {
    const candidate: Product = {
      from: StoreNamesEnum.NALDO,
      name: "Samsung Galaxy S24 256GB Blanco",
      price: 95000,
      image: "",
      url: "https://naldo.com/s24",
      brand: "Samsung",
    };
    const result = matchOffers(clicked, [clicked, candidate]);
    expect(result.some((o) => o.url === candidate.url)).toBe(true);
  });

  it("does NOT match if numeric tokens differ (e.g. 256GB vs 512GB)", () => {
    const candidate512: Product = {
      from: StoreNamesEnum.CETROGAR,
      name: "Samsung Galaxy S24 512GB Negro",
      price: 120000,
      image: "",
      url: "https://cetrogar.com/s24-512",
      brand: "Samsung",
    };
    const result = matchOffers(clicked, [clicked, candidate512]);
    expect(result.some((o) => o.url === candidate512.url)).toBe(false);
  });

  it("does NOT match if fewer than 2 text tokens overlap", () => {
    const unrelated: Product = {
      from: StoreNamesEnum.CARREFOUR,
      name: "Samsung TV 55 pulgadas",
      price: 80000,
      image: "",
      url: "https://carrefour.com/tv",
      brand: "Samsung",
    };
    const result = matchOffers(clicked, [clicked, unrelated]);
    expect(result.some((o) => o.url === unrelated.url)).toBe(false);
  });

  it("returns results sorted by price asc", () => {
    const cheap: Product = {
      from: StoreNamesEnum.NALDO,
      name: "Samsung Galaxy S24 256GB Azul",
      price: 85000,
      image: "",
      url: "https://naldo.com/s24",
      brand: "Samsung",
    };
    const expensive: Product = {
      from: StoreNamesEnum.CETROGAR,
      name: "Samsung Galaxy S24 256GB Rojo",
      price: 110000,
      image: "",
      url: "https://cetrogar.com/s24",
      brand: "Samsung",
    };
    const result = matchOffers(clicked, [clicked, expensive, cheap]);
    const prices = result.map((o) => o.price);
    expect(prices[0]).toBeLessThanOrEqual(prices[1]!);
    expect(prices[1]).toBeLessThanOrEqual(prices[2]!);
  });

  it("does not crash when name is undefined", () => {
    const noName: Product = makeProduct({
      from: StoreNamesEnum.NALDO,
      price: 80000,
      url: "https://naldo.com/x",
    });
    expect(() => matchOffers(clicked, [clicked, noName])).not.toThrow();
  });

  it("does not crash when price is undefined; undefined price sorts last", () => {
    const noPrice: Product = {
      from: StoreNamesEnum.NALDO,
      name: "Samsung Galaxy S24 256GB Verde",
      price: undefined,
      image: "",
      url: "https://naldo.com/s24-noprice",
      brand: "Samsung",
    };
    const result = matchOffers(clicked, [clicked, noPrice]);
    if (result.some((o) => o.url === noPrice.url)) {
      const idx = result.findIndex((o) => o.url === noPrice.url);
      const lastIdx = result.length - 1;
      expect(idx).toBe(lastIdx);
    }
    expect(() => matchOffers(clicked, [clicked, noPrice])).not.toThrow();
  });
});
