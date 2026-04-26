import { StoreNamesEnum } from "@/enums/stores.enum";
import type { Product } from "@/types/product.d";

let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

const STORES: StoreNamesEnum[] = [
  StoreNamesEnum.FRAVEGA,
  StoreNamesEnum.CETROGAR,
  StoreNamesEnum.NALDO,
  StoreNamesEnum.CARREFOUR,
  StoreNamesEnum.MERCADOLIBRE,
  StoreNamesEnum.ONCITY,
];

const BRANDS = ["Samsung", "Apple", "Motorola", "LG", "Sony"];

export function buildProduct(overrides?: Partial<Product>): Product {
  const i = idCounter++;
  const installmentOptions: (number | undefined)[] = [12, 6, undefined];
  return {
    from: STORES[i % STORES.length],
    name: `Product ${i}`,
    price: 50_000 + i * 7_500,
    image: `https://example.com/product-${i}.jpg`,
    url: `https://example.com/product-${i}`,
    brand: BRANDS[i % BRANDS.length],
    installment: installmentOptions[i % 3] as number | undefined,
    ...overrides,
  };
}

export function buildProducts(
  count: number,
  overrides?: Partial<Product>,
): Product[] {
  return Array.from({ length: count }, () => buildProduct(overrides));
}

// Named fixtures
export const FIXTURES = {
  empty: [] as Product[],

  single: (() => {
    resetIdCounter();
    return buildProducts(1);
  })(),

  multiStore: (() => {
    resetIdCounter();
    return buildProducts(6);
  })(),

  /** 15 products → 2 pages (12 + 3) */
  paginated: (() => {
    resetIdCounter();
    return buildProducts(15);
  })(),

  /** 50 products → 5 pages — triggers ellipsis */
  multiplePages: (() => {
    resetIdCounter();
    return buildProducts(50);
  })(),

  withInstallments: (() => {
    resetIdCounter();
    return [
      buildProduct({ installment: 6 }),
      buildProduct({ installment: 12 }),
      buildProduct({ installment: 3 }),
      buildProduct({ installment: 6 }),
      buildProduct({ installment: 18 }),
    ];
  })(),

  /** 6 products all from FRAVEGA */
  singleStore: (() => {
    resetIdCounter();
    return buildProducts(6, { from: StoreNamesEnum.FRAVEGA });
  })(),
} as const;
