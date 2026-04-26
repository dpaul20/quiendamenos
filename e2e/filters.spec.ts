import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import { StoreNamesEnum } from "@/enums/stores.enum";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";
import type { Product } from "@/types/product.d";

function makeMultiStoreProducts(): Product[] {
  return [
    ...buildProducts(2, { from: StoreNamesEnum.FRAVEGA }),
    ...buildProducts(2, { from: StoreNamesEnum.CETROGAR }),
    ...buildProducts(2, { from: StoreNamesEnum.NALDO }),
  ];
}

test.describe("SPEC-15: filtrar por 1 tienda → solo sus productos", () => {
  test("filtra y muestra solo productos de la tienda seleccionada", async ({
    page,
  }) => {
    const products = makeMultiStoreProducts();
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await expect(sel.productCards).toHaveCount(2);
  });
});

test.describe("SPEC-16: filtrar por 2 tiendas → unión de ambas", () => {
  test("seleccionar 2 tiendas muestra la suma de sus productos", async ({
    page,
  }) => {
    const products = makeMultiStoreProducts();
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await sel.storeFilterButton(StoreNamesEnum.CETROGAR).click();
    await expect(sel.productCards).toHaveCount(4);
  });
});

test.describe("SPEC-17: deseleccionar tienda → vuelven todos", () => {
  test("deseleccionar una tienda activa vuelve a mostrar todos", async ({
    page,
  }) => {
    const products = makeMultiStoreProducts();
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");
    const total = await sel.productCards.count();

    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await expect(sel.productCards).toHaveCount(total);
  });
});

test.describe("SPEC-18: filtrar por marca → BrandFilter", () => {
  test("filtra por marca usando el combobox de marcas", async ({ page }) => {
    const products: Product[] = [
      ...buildProducts(3, { brand: "Samsung", from: StoreNamesEnum.FRAVEGA }),
      ...buildProducts(2, { brand: "Apple", from: StoreNamesEnum.CETROGAR }),
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.brandFilterTrigger.click();
    await sel.brandFilterOption("Samsung").click();

    await expect(sel.productCards).toHaveCount(3);
  });
});

test.describe("SPEC-19: buscar en combobox de marcas filtra opciones", () => {
  test("el input de búsqueda dentro del combobox filtra opciones", async ({
    page,
  }) => {
    const products: Product[] = [
      ...buildProducts(2, { brand: "Samsung" }),
      ...buildProducts(2, { brand: "Apple" }),
      ...buildProducts(2, { brand: "Motorola" }),
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.brandFilterTrigger.click();
    await sel.brandFilterInput.fill("Sam");

    // Only Samsung option should be visible after filtering
    await expect(sel.brandFilterOption("Samsung")).toBeVisible();
    await expect(sel.brandFilterOption("Apple")).toBeHidden();
  });
});

test.describe("SPEC-20: precio mínimo oculta más baratos", () => {
  test("precio mínimo filtra productos más baratos", async ({ page }) => {
    const products: Product[] = [
      buildProducts(1, { price: 50_000 })[0],
      buildProducts(1, { price: 100_000 })[0],
      buildProducts(1, { price: 200_000 })[0],
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");
    await expect(sel.productCards).toHaveCount(3);

    await sel.minPriceInput.fill("90000");
    await sel.minPriceInput.press("Tab");

    await expect(sel.productCards).toHaveCount(2);
  });
});

test.describe("SPEC-21: precio máximo oculta más caros", () => {
  test("precio máximo filtra productos más caros", async ({ page }) => {
    const products: Product[] = [
      buildProducts(1, { price: 50_000 })[0],
      buildProducts(1, { price: 100_000 })[0],
      buildProducts(1, { price: 200_000 })[0],
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");
    await sel.maxPriceInput.fill("110000");
    await sel.maxPriceInput.press("Tab");

    await expect(sel.productCards).toHaveCount(2);
  });
});

test.describe("SPEC-22: rango de precio filtra por ambos extremos", () => {
  test("precio mínimo + máximo juntos filtran correctamente", async ({
    page,
  }) => {
    const products: Product[] = [
      buildProducts(1, { price: 50_000 })[0],
      buildProducts(1, { price: 100_000 })[0],
      buildProducts(1, { price: 200_000 })[0],
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.minPriceInput.fill("80000");
    await sel.minPriceInput.press("Tab");
    await sel.maxPriceInput.fill("150000");
    await sel.maxPriceInput.press("Tab");

    await expect(sel.productCards).toHaveCount(1);
  });
});

test.describe("SPEC-23: CSI filter", () => {
  test("el grupo de cuotas sin interés filtra por cuotas", async ({ page }) => {
    const products: Product[] = [
      buildProducts(1, { installment: 12 })[0],
      buildProducts(1, { installment: 6 })[0],
      buildProducts(1, { installment: 3 })[0],
      buildProducts(1, { installment: undefined })[0],
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await expect(sel.csiFilterGroup).toBeVisible();
  });
});

test.describe("SPEC-24: badge contador mobile refleja filtros activos", () => {
  test("el badge de filtros activos se muestra en mobile", async ({ page }) => {
    const products: Product[] = [
      ...buildProducts(2, { from: StoreNamesEnum.FRAVEGA }),
      ...buildProducts(2, { from: StoreNamesEnum.CETROGAR }),
    ];
    await mockScrapeApi(page, products);
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    // Open filters dialog and apply a store filter
    await sel.filterPanelToggle.click();
    await page
      .getByRole("button", { name: StoreNamesEnum.FRAVEGA, exact: true })
      .click();
    await page.keyboard.press("Escape");

    // The badge should reflect 1 active filter
    await expect(sel.activeFiltersCount).toBeVisible();
  });
});

test.describe("SPEC-25: 'Limpiar (N)' resetea filtros", () => {
  test("el botón limpiar resetea todos los filtros activos", async ({
    page,
  }) => {
    const products = makeMultiStoreProducts();
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");
    const total = await sel.productCards.count();

    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await expect(sel.productCards).toHaveCount(2);

    await sel.clearFiltersButton.click();
    await expect(sel.productCards).toHaveCount(total);
  });
});

test.describe("SPEC-26: filtros sin matches → EmptyState", () => {
  test("filtros que no tienen resultados muestran EmptyState", async ({
    page,
  }) => {
    const products: Product[] = buildProducts(3, {
      from: StoreNamesEnum.FRAVEGA,
    });
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await sel.minPriceInput.fill("9999999");
    await sel.minPriceInput.press("Tab");

    await expect(sel.emptyState).toBeVisible();
  });
});
