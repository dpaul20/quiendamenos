import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import { gotoAndWaitReady, mockScrapeApi } from "./helpers/setup";

const CHIP_LABELS = [
  "Celulares",
  "Tablets",
  "TVs",
  "Auriculares",
  "Notebooks",
  "Consolas",
  "Heladeras",
  "Lavadoras",
];

test.describe("CategoryChips", () => {
  test("chips are visible on landing before any search", async ({ page }) => {
    await mockScrapeApi(page, []);
    await gotoAndWaitReady(page);

    for (const label of CHIP_LABELS) {
      await expect(
        page.getByRole("button", { name: label, exact: true }),
      ).toBeVisible();
    }
  });

  test("chips are hidden after a search is submitted", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(3));
    await gotoAndWaitReady(page);

    // Confirm chips visible before search
    await expect(
      page.getByRole("button", { name: "Celulares", exact: true }),
    ).toBeVisible();

    // Submit a search via the form
    const searchInput = page.getByPlaceholder("Nombre del producto...");
    const searchButton = page.getByRole("button", { name: /buscar/i });
    await searchInput.fill("celular");
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/scrape")),
      searchButton.click(),
    ]);

    // Chips must be gone after search
    await expect(
      page.getByRole("button", { name: "Celulares", exact: true }),
    ).toHaveCount(0);
  });

  test("clicking a chip triggers a product search", async ({ page }) => {
    await mockScrapeApi(page, buildProducts(3));
    await gotoAndWaitReady(page);

    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/scrape")),
      page.getByRole("button", { name: "Celulares", exact: true }).click(),
    ]);

    expect(response.status()).toBe(200);

    // Product cards should appear
    await expect(page.getByTestId("product-card")).toHaveCount(3);
  });
});
