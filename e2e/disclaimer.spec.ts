import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  submitSearchAndWait,
} from "./helpers/setup";

test.describe("Disclaimer", () => {
  test("disclaimer is not visible on landing before any search", async ({
    page,
  }) => {
    await mockScrapeApi(page, []);
    await gotoAndWaitReady(page);

    // The disclaimer heading should not be in the DOM while in landing phase
    await expect(page.getByText("¿Cómo funciona?")).toHaveCount(0);
  });

  test("disclaimer is visible after a search is submitted", async ({
    page,
  }) => {
    await mockScrapeApi(page, buildProducts(3));
    await gotoAndWaitReady(page);

    await submitSearchAndWait(page, "celular");

    await expect(page.getByText("¿Cómo funciona?")).toBeVisible();
  });

  test("dismissing the disclaimer hides it for the rest of the session", async ({
    page,
  }) => {
    await mockScrapeApi(page, buildProducts(3));
    await gotoAndWaitReady(page);

    await submitSearchAndWait(page, "celular");
    await expect(page.getByText("¿Cómo funciona?")).toBeVisible();

    // Dismiss
    await page.getByRole("button", { name: /Cerrar aviso/i }).click();
    await expect(page.getByText("¿Cómo funciona?")).toHaveCount(0);

    // Run a second search — disclaimer must stay hidden (session close state)
    await mockScrapeApi(page, buildProducts(2));
    await submitSearchAndWait(page, "tv");
    await expect(page.getByText("¿Cómo funciona?")).toHaveCount(0);
  });
});
