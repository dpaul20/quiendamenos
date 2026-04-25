import { test, expect } from "@playwright/test";
import { buildProducts } from "./fixtures/products";
import {
  gotoAndWaitReady,
  mockScrapeApi,
  mockScrapeApiError,
  submitSearchAndWait,
} from "./helpers/setup";
import { getSelectors } from "./helpers/selectors";

test.describe("SPEC-1: búsqueda exitosa → resultados visibles, no ErrorAlert", () => {
  test("muestra 3 resultados y no muestra alerta de error", async ({
    page,
  }) => {
    const products = buildProducts(3);
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "samsung");

    await expect(sel.productCards).toHaveCount(3);
    await expect(sel.errorAlert).toBeHidden();
  });
});

test.describe("SPEC-2: búsqueda sin resultados → EmptyState visible", () => {
  test("muestra 'Sin resultados' cuando la API devuelve array vacío", async ({
    page,
  }) => {
    await mockScrapeApi(page, []);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "productoquenoexiste");

    await expect(sel.emptyState).toBeVisible();
  });
});

test.describe("SPEC-3: submit vacío → no dispara request", () => {
  test("el campo es required y no dispara la búsqueda vacío", async ({
    page,
  }) => {
    let requestFired = false;
    await page.route("**/api/scrape**", (route) => {
      requestFired = true;
      route.fulfill({ status: 200, body: JSON.stringify({ products: [] }) });
    });

    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await sel.searchButton.click();
    // HTML5 required prevents form submission — no request should have fired
    expect(requestFired).toBe(false);
  });
});

test.describe("SPEC-4: query con chars inválidos → 400 → ErrorAlert", () => {
  test("muestra ErrorAlert con mensaje de error", async ({ page }) => {
    await mockScrapeApiError(page, 400, "Error al cargar resultados");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "<script>alert(1)</script>");

    await expect(sel.errorAlert).toBeVisible();
    await expect(sel.errorAlert).toContainText("Error al cargar resultados");
  });
});

test.describe("SPEC-5: chars especiales válidos (comillas) → resultados, no error", () => {
  test("buscar con comillas devuelve productos sin error", async ({ page }) => {
    const products = buildProducts(2);
    await mockScrapeApi(page, products);
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, '"iphone 15"');

    await expect(sel.productCards).toHaveCount(2);
    await expect(sel.errorAlert).toBeHidden();
  });
});

test.describe("SPEC-6: query >100 chars → 400 → ErrorAlert", () => {
  test("query muy largo dispara error de validación", async ({ page }) => {
    await mockScrapeApiError(page, 400, "Error al cargar resultados");
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    const longQuery = "a".repeat(101);
    await submitSearchAndWait(page, longQuery);

    await expect(sel.errorAlert).toBeVisible();
    await expect(sel.errorAlert).toContainText("Error al cargar resultados");
  });
});

test.describe("SPEC-7: botón Buscar disabled durante carga", () => {
  test("muestra 'Buscando...' y está disabled mientras se carga", async ({
    page,
  }) => {
    // Use slow mock so we can observe the loading state
    await page.route("**/api/scrape**", async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 1_500));
      route.fulfill({
        status: 200,
        body: JSON.stringify({ products: buildProducts(1) }),
      });
    });

    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await sel.searchInput.fill("samsung");

    // Start the search, then immediately check button state before response arrives
    const clickPromise = sel.searchButton.click();

    // Button should be disabled and show loading text
    await expect(
      page.getByRole("button", { name: /buscando/i }),
    ).toBeDisabled();

    await clickPromise;
  });
});
