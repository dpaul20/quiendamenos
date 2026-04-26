import { expect, type Page } from "@playwright/test";
import type { Product } from "@/types/product.d";

export const API_PATH = "**/api/scrape**";

/**
 * Mock the /api/scrape endpoint to return a successful response with the given products.
 */
export async function mockScrapeApi(
  page: Page,
  products: Product[],
): Promise<void> {
  await page.route(API_PATH, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ products }),
    });
  });
}

/**
 * Mock the /api/scrape endpoint to return an error response.
 */
export async function mockScrapeApiError(
  page: Page,
  status: number,
  message?: string,
): Promise<void> {
  await page.route(API_PATH, (route) => {
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: message ?? `Error ${status}` }),
    });
  });
}

/**
 * Mock the /api/scrape endpoint to abort the network request.
 */
export async function mockScrapeApiNetworkError(page: Page): Promise<void> {
  await page.route(API_PATH, (route) => {
    route.abort("failed");
  });
}

/**
 * Mock the /api/scrape endpoint with a delay before responding.
 * Uses setTimeout — zero waitForTimeout in specs.
 */
export async function mockScrapeApiSlow(
  page: Page,
  products: Product[],
  delayMs: number,
): Promise<void> {
  await page.route(API_PATH, async (route) => {
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ products }),
    });
  });
}

/**
 * Navigate to the home page and wait for it to be ready (search input visible).
 */
export async function gotoAndWaitReady(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByPlaceholder("Nombre del producto...")).toBeVisible();
}

/**
 * Type a query into the search input and submit, waiting for the API response.
 * Uses Promise.all to avoid race conditions — never waitForTimeout.
 */
export async function submitSearchAndWait(
  page: Page,
  query: string,
): Promise<void> {
  const searchInput = page.getByPlaceholder("Nombre del producto...");
  const searchButton = page.getByRole("button", { name: /buscar/i });

  await searchInput.fill(query);

  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes("/api/scrape")),
    searchButton.click(),
  ]);
}
