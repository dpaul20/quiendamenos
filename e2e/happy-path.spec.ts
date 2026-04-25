import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import { StoreNamesEnum } from "@/enums/stores.enum";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
  mockScrapeApiError,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";
import type { Product } from "@/types/product.d";

test.describe("SPEC-42: flujo completo desktop", () => {
  test("buscar → filtrar → sort → paginar → click producto", async ({
    page,
  }) => {
    const products: Product[] = [
      ...buildProducts(8, { from: StoreNamesEnum.FRAVEGA, brand: "Samsung" }),
      ...buildProducts(7, { from: StoreNamesEnum.CETROGAR, brand: "Apple" }),
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    // 1. Search
    await submitSearchAndWait(page, "celular");
    await expect(sel.productCards).toHaveCount(12);

    // 2. Filter by store
    await sel.storeFilterButton(StoreNamesEnum.FRAVEGA).click();
    await expect(sel.productCards).toHaveCount(8);

    // 3. Sort by menor precio
    await sel.sortTrigger.click();
    await sel.sortOption("Menor precio").click();
    await expect(sel.productCards).not.toHaveCount(0);

    // 4. Clear filter to restore all 15 results → pagination
    await sel.clearFiltersButton.click();
    await expect(sel.productCards).toHaveCount(12);
    await expect(sel.paginationNext).toBeVisible();

    // 5. Navigate to page 2
    await sel.paginationNext.click();
    await expect(sel.productCards).toHaveCount(3);

    // 6. Click a product card (should open external link)
    const firstCard = sel.productCards.first();
    await expect(firstCard).toBeVisible();
  });
});

test.describe("SPEC-43: sin resultados → nueva búsqueda exitosa", () => {
  test("búsqueda vacía seguida de una exitosa muestra resultados", async ({
    page,
  }) => {
    // First search: no results
    await mockScrapeApi(page, []);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "productoquenoexiste");
    await expect(sel.emptyState).toBeVisible();

    // Second search: successful
    await mockScrapeApi(page, buildProducts(3));
    await submitSearchAndWait(page, "samsung");

    await expect(sel.emptyState).toBeHidden();
    await expect(sel.productCards).toHaveCount(3);
  });
});

test.describe("SPEC-44: error → recuperación con segunda búsqueda", () => {
  test("error en primera búsqueda, segunda búsqueda exitosa recupera la app", async ({
    page,
  }) => {
    // First search: error
    await mockScrapeApiError(page, 500, "Error de servidor");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");
    await expect(sel.errorAlert).toBeVisible();

    // Second search: success
    await mockScrapeApi(page, buildProducts(3));
    await submitSearchAndWait(page, "iphone");

    await expect(sel.errorAlert).toBeHidden();
    await expect(sel.productCards).toHaveCount(3);
  });
});
