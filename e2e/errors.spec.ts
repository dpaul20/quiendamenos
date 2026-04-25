import { test, expect } from "@playwright/test";
import {
  gotoAndWaitReady,
  mockScrapeApiError,
  mockScrapeApiNetworkError,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("SPEC-11: network abort → ErrorAlert", () => {
  test("muestra mensaje de conexión al abortar la red", async ({ page }) => {
    await mockScrapeApiNetworkError(page);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await sel.searchInput.fill("samsung");
    // Network error — no response to wait for, just click
    await sel.searchButton.click();

    await expect(sel.errorAlert).toBeVisible();
    await expect(sel.errorAlert).toContainText(
      "No se pudo conectar. Verificá tu conexión e intentá de nuevo.",
    );
  });
});

test.describe("SPEC-12: 500 → ErrorAlert", () => {
  test("muestra ErrorAlert ante error de servidor 500", async ({ page }) => {
    await mockScrapeApiError(page, 500, "Internal Server Error");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.errorAlert).toBeVisible();
  });
});

test.describe("SPEC-13: 429 → ErrorAlert", () => {
  test("muestra ErrorAlert ante rate limiting 429", async ({ page }) => {
    await mockScrapeApiError(page, 429, "Too Many Requests");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.errorAlert).toBeVisible();
  });
});

test.describe("SPEC-14: 400 → ErrorAlert", () => {
  test("muestra ErrorAlert ante bad request 400", async ({ page }) => {
    await mockScrapeApiError(page, 400, "Bad Request");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.errorAlert).toBeVisible();
  });
});
