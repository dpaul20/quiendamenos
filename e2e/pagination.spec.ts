import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("SPEC-32: ≤12 resultados → sin paginación", () => {
  test("no muestra paginación cuando hay 12 o menos resultados", async ({
    page,
  }) => {
    await mockScrapeApi(page, buildProducts(12));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.paginationPrev).toBeHidden();
    await expect(sel.paginationNext).toBeHidden();
  });
});

test.describe("SPEC-33: 13 resultados → paginación visible, 12 en pág 1", () => {
  test("muestra paginación y solo 12 cards en la primera página", async ({
    page,
  }) => {
    await mockScrapeApi(page, buildProducts(13));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.productCards).toHaveCount(12);
    await expect(sel.paginationNext).toBeVisible();
  });
});

test.describe("SPEC-34: navegar a página 2 → cards correctos, Sig disabled", () => {
  test("página 2 con 1 card y botón Siguiente deshabilitado", async ({
    page,
  }) => {
    await mockScrapeApi(page, buildProducts(13));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");
    await sel.paginationNext.click();

    await expect(sel.productCards).toHaveCount(1);
    await expect(sel.paginationNext).toBeDisabled();
  });
});

test.describe("SPEC-35: botón Anterior disabled en página 1", () => {
  test("Anterior está deshabilitado en la primera página", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(13));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.paginationPrev).toBeDisabled();
  });
});

test.describe("SPEC-36: botón Siguiente disabled en última página", () => {
  test("Siguiente está deshabilitado en la última página", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(13));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");
    await sel.paginationPage(2).click();

    await expect(sel.paginationNext).toBeDisabled();
  });
});

test.describe("SPEC-37: nueva búsqueda resetea a página 1", () => {
  test("ir a pág 2 y hacer nueva búsqueda vuelve a pág 1", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(15));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "iphone");
    await sel.paginationPage(2).click();
    await expect(sel.productCards).toHaveCount(3);

    // New search
    await mockScrapeApi(page, buildProducts(15));
    await submitSearchAndWait(page, "samsung");

    // Should reset to page 1 with 12 cards
    await expect(sel.productCards).toHaveCount(12);
    await expect(sel.paginationPrev).toBeDisabled();
  });
});

test.describe("SPEC-38: ellipsis '•••' con 60 resultados (5 páginas)", () => {
  test("muestra ellipsis en paginación con 5 páginas", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(60));
    await gotoAndWaitReady(page);

    await submitSearchAndWait(page, "samsung");

    // Should show ellipsis for non-adjacent pages
    const ellipsis = page.locator("span").filter({ hasText: "•••" });
    await expect(ellipsis.first()).toBeVisible();
  });
});
