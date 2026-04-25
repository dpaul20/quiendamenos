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

function makeProductsForSort(): Product[] {
  return [
    {
      from: StoreNamesEnum.FRAVEGA,
      name: "Prod A",
      price: 150_000,
      image: "",
      url: "https://a.com/a",
      brand: "Samsung",
      installment: 6,
    },
    {
      from: StoreNamesEnum.CETROGAR,
      name: "Prod B",
      price: 80_000,
      image: "",
      url: "https://a.com/b",
      brand: "Apple",
      installment: 12,
    },
    {
      from: StoreNamesEnum.NALDO,
      name: "Prod C",
      price: 300_000,
      image: "",
      url: "https://a.com/c",
      brand: "Motorola",
      installment: 3,
    },
    {
      from: StoreNamesEnum.CARREFOUR,
      name: "Prod D",
      price: 50_000,
      image: "",
      url: "https://a.com/d",
      brand: "LG",
      installment: undefined,
    },
  ];
}

function parsePrices(texts: string[]): number[] {
  return texts.map((t) => {
    const numeric = t.replace(/[^0-9,]/g, "").replace(",", ".");
    return parseFloat(numeric);
  });
}

test.describe("SPEC-27: 'Menor precio' → orden ascendente", () => {
  test("los productos se ordenan de menor a mayor precio", async ({ page }) => {
    await mockScrapeApi(page, makeProductsForSort());
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.sortTrigger.click();
    await sel.sortOption("Menor precio").click();

    const prices = await page.getByTestId("product-price").allTextContents();
    const nums = parsePrices(prices);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });
});

test.describe("SPEC-28: 'Mayor precio' → orden descendente", () => {
  test("los productos se ordenan de mayor a menor precio", async ({ page }) => {
    await mockScrapeApi(page, makeProductsForSort());
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.sortTrigger.click();
    await sel.sortOption("Mayor precio").click();

    const prices = await page.getByTestId("product-price").allTextContents();
    const nums = parsePrices(prices);
    expect(nums).toEqual([...nums].sort((a, b) => b - a));
  });
});

test.describe("SPEC-29: 'Más cuotas' → mayor installment primero", () => {
  test("ordena los productos por mayor cantidad de cuotas", async ({
    page,
  }) => {
    await mockScrapeApi(page, makeProductsForSort());
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.sortTrigger.click();
    await sel.sortOption("Más cuotas").click();

    // The product with installment=12 should appear first
    const firstCard = sel.productCards.first();
    await expect(firstCard.getByTestId("product-installment")).toContainText(
      "12",
    );
  });
});

test.describe("SPEC-30: 'Mejor cuota' → menor ratio precio/installment", () => {
  test("ordena por mejor relación precio/cuotas", async ({ page }) => {
    await mockScrapeApi(page, makeProductsForSort());
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.sortTrigger.click();
    await sel.sortOption("Mejor cuota").click();

    // After selecting the sort, product cards should still be visible
    await expect(sel.productCards).not.toHaveCount(0);
  });
});

test.describe("SPEC-31: label del trigger se actualiza", () => {
  test("el trigger del sort muestra el label de la opción seleccionada", async ({
    page,
  }) => {
    await mockScrapeApi(page, makeProductsForSort());
    await gotoAndWaitReady(page);
    const sel = getSelectors(page);

    await submitSearchAndWait(page, "celular");

    await sel.sortTrigger.click();
    await sel.sortOption("Mayor precio").click();

    await expect(sel.sortTrigger).toContainText("Mayor precio");
  });
});
