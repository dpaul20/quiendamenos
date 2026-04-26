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

test.describe("SPEC-39: Dialog de filtros abre en 375px", () => {
  test("el botón Filtros abre el Dialog en viewport mobile", async ({
    page,
  }) => {
    const products: Product[] = [
      ...buildProducts(2, { from: StoreNamesEnum.FRAVEGA }),
      ...buildProducts(2, { from: StoreNamesEnum.CETROGAR }),
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await sel.filterPanelToggle.click();

    // Dialog should be open
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("SPEC-40: filtros dentro del Dialog funcionan", () => {
  test("aplicar filtro de tienda desde el Dialog funciona correctamente", async ({
    page,
  }) => {
    const products: Product[] = [
      ...buildProducts(2, { from: StoreNamesEnum.FRAVEGA }),
      ...buildProducts(2, { from: StoreNamesEnum.CETROGAR }),
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await sel.filterPanelToggle.click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: StoreNamesEnum.FRAVEGA, exact: true })
      .click();
    await page.keyboard.press("Escape");

    await expect(sel.productCards).toHaveCount(2);
  });
});

test.describe("SPEC-41: texto largo truncado con line-clamp-2", () => {
  test("el nombre del producto está truncado con line-clamp-2", async ({
    page,
  }) => {
    const products: Product[] = [
      buildProducts(1, {
        name: "Celular Samsung Galaxy S25 Ultra 512GB 12GB RAM Titanium Black con todos los accesorios incluidos y garantía oficial extendida de 2 años",
      })[0],
    ];
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    // The product name should have line-clamp-2 class
    const productName = page.locator("h3.line-clamp-2").first();
    await expect(productName).toBeVisible();
    await expect(productName).toHaveClass(/line-clamp-2/);
  });
});
