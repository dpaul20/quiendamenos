import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import {
  gotoAndWaitReady,
  mockScrapeApiSlow,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("SPEC-8: skeletons visibles durante carga", () => {
  test("muestra 8 skeleton cards con animate-pulse durante la carga", async ({
    page,
  }) => {
    await mockScrapeApiSlow(page, buildProducts(3), 2_000);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    // Start search without waiting for response
    await sel.searchInput.fill("samsung");
    const searchPromise = Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/scrape")),
      sel.searchButton.click(),
    ]);

    // While loading, skeletons should be visible
    await expect(sel.skeletonCards).toHaveCount(8);

    await searchPromise;
  });
});

test.describe("SPEC-9: mensaje rotatorio loadingMessages visible", () => {
  test("muestra texto de carga durante más de 1.5s de delay", async ({
    page,
  }) => {
    await mockScrapeApiSlow(page, buildProducts(3), 2_000);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await sel.searchInput.fill("samsung");
    const searchPromise = Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/scrape")),
      sel.searchButton.click(),
    ]);

    // Wait a bit for the first loading message to appear (>1.5s delay)
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1_600);
    const loadingText = page.locator("p.text-xs.text-muted-foreground");
    await expect(loadingText).toBeVisible();

    await searchPromise;
  });
});

test.describe("SPEC-10: segunda búsqueda resetea paginación a página 1", () => {
  test("navegar a pág 2 y hacer nueva búsqueda vuelve a pág 1", async ({
    page,
  }) => {
    // First search: 15 products (2 pages)
    await mockScrapeApi(page, buildProducts(15));
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "iphone");

    // Navigate to page 2
    await sel.paginationPage(2).click();
    await expect(sel.paginationPage(2)).toHaveClass(/bg-primary/);

    // Second search: 15 more products
    await mockScrapeApi(page, buildProducts(15));
    await submitSearchAndWait(page, "samsung");

    // Should be back to page 1
    await expect(sel.paginationPage(1)).toHaveClass(/bg-primary/);
  });
});
