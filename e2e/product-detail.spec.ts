import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import { StoreNamesEnum } from "@/enums/stores.enum";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("ProductDetail inline panel", () => {
  test.beforeEach(async ({ page }) => {
    const products = buildProducts(3, { from: StoreNamesEnum.FRAVEGA });
    await mockScrapeApi(page, products);

    // Avoid real network calls for price history
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

  test("card click opens inline panel without a dialog and without URL change", async ({
    page,
  }) => {
    const sel = getSelectors(page);
    const initialUrl = page.url();

    await expect(sel.productCards).toHaveCount(3);

    await sel.productCards.first().click();

    // Panel is inline — "Volver a resultados" button is the landmark
    await expect(sel.backButton).toBeVisible();

    // No Sheet/dialog overlay should be open
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // URL must not change
    expect(page.url()).toBe(initialUrl);
  });

  test('"Volver a resultados" closes the panel and restores the product grid', async ({
    page,
  }) => {
    const sel = getSelectors(page);

    await sel.productCards.first().click();
    await expect(sel.backButton).toBeVisible();

    await sel.backButton.click();

    // Product cards should reappear
    await expect(sel.productCards).toHaveCount(3);

    // Back button must be gone
    await expect(sel.backButton).toHaveCount(0);
  });

  test("panel renders expected section headings", async ({ page }) => {
    const sel = getSelectors(page);

    await sel.productCards.first().click();
    await expect(sel.backButton).toBeVisible();

    await expect(page.getByText("Comparar entre tiendas")).toBeVisible();
    await expect(page.getByText("Historial de precios")).toBeVisible();

    // Product name from the fixture ("Product 0")
    await expect(page.getByText(/Product \d/)).toBeVisible();
  });

  test('"Ir a [store]" opens a new tab', async ({ page, context }) => {
    const sel = getSelectors(page);

    await sel.productCards.first().click();
    await expect(sel.backButton).toBeVisible();

    // "Ir a FRAVEGA" is an <a target="_blank"> (Button asChild)
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      sel.goToStoreLink.click(),
    ]);

    await newPage.waitForLoadState("domcontentloaded");
    expect(newPage.url()).toContain("example.com");
  });

  test('"Seguir precio" toggle switches label between followed and unfollowed states', async ({
    page,
  }) => {
    // Pre-seed stored email so follow doesn't open the PriceAlertDialog
    // (Radix Dialog marks background aria-hidden, hiding the toggled button)
    await page.evaluate(() => {
      localStorage.setItem("qdm:alert-email", "test@example.com");
    });
    await page.route("**/api/price-alerts**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });

    const sel = getSelectors(page);

    await sel.productCards.first().click();
    await expect(sel.backButton).toBeVisible();

    // Initial state: not following
    await expect(
      page.getByRole("button", { name: "♡ Seguir precio" }),
    ).toBeVisible();

    // Follow
    await sel.followButton.click();
    await expect(
      page.getByRole("button", { name: "✓ Siguiendo" }),
    ).toBeVisible();

    // Unfollow
    await page.getByRole("button", { name: "✓ Siguiendo" }).click();
    await expect(
      page.getByRole("button", { name: "♡ Seguir precio" }),
    ).toBeVisible();
  });
});
