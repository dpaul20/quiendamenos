import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import { StoreNamesEnum } from "@/enums/stores.enum";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("ProductDetail Sheet", () => {
  test.beforeEach(async ({ page }) => {
    const products = buildProducts(3, { from: StoreNamesEnum.FRAVEGA });
    await mockScrapeApi(page, products);

    // Mock price history API to return empty (avoid network calls in tests)
    await page.route("**/api/prices/history**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await gotoAndWaitReady(page);
    await submitSearchAndWait(page, "celular");
  });

  test("card click opens Sheet without URL change", async ({ page }) => {
    const sel = getSelectors(page);
    const initialUrl = page.url();

    await expect(sel.productCards).toHaveCount(3);

    // Click first product card
    await sel.productCards.first().click();

    // Sheet should be open (SheetContent renders in a portal with role="dialog")
    await expect(page.getByRole("dialog")).toBeVisible();

    // URL should not have changed
    expect(page.url()).toBe(initialUrl);
  });

  test('"Ir a tienda" button opens a new tab', async ({ page, context }) => {
    const sel = getSelectors(page);

    await sel.productCards.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // "Ir a [store]" opens a new tab via window.open(_blank)
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: /Ir a/i }).first().click(),
    ]);

    await newPage.waitForLoadState("domcontentloaded");
    expect(newPage.url()).toContain("example.com");
  });

  test("close button closes the Sheet", async ({ page }) => {
    const sel = getSelectors(page);

    await sel.productCards.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click the close button (Cross2Icon button with sr-only "Close" text)
    await page.getByRole("button", { name: /close/i }).click();

    await expect(dialog).toBeHidden();
  });
});
