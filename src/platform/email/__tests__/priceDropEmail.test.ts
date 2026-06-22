/** @jest-environment node */
import { renderPriceDropEmail } from "../priceDropEmail";

const BASE_INPUT = {
  productName: "iPhone 15 Pro",
  productUrl: "https://store.com/products/iphone-15-pro",
  oldPrice: 1200000,
  newPrice: 999000,
  unsubscribeUrl:
    "https://quiendamenos.vercel.app/api/price-alerts/unsubscribe?email=u%40e.com&url=...&token=abc",
};

describe("renderPriceDropEmail — subject", () => {
  it("uses the correct subject pattern with product name", () => {
    const { subject } = renderPriceDropEmail(BASE_INPUT);
    expect(subject).toBe("El precio de iPhone 15 Pro bajó");
  });

  it("includes the product name in the subject for a different product", () => {
    const { subject } = renderPriceDropEmail({
      ...BASE_INPUT,
      productName: "Samsung Galaxy S24",
    });
    expect(subject).toBe("El precio de Samsung Galaxy S24 bajó");
  });
});

describe("renderPriceDropEmail — html body", () => {
  it("includes the old price formatted in ARS", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    // Verify oldPrice (1200000) appears somewhere in the body
    expect(html).toContain("1.200.000");
  });

  it("includes the new price formatted in ARS", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    expect(html).toContain("999.000");
  });

  it("includes the product URL as a link", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    expect(html).toContain(BASE_INPUT.productUrl);
  });

  it("includes the unsubscribe URL", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    expect(html).toContain(BASE_INPUT.unsubscribeUrl);
  });

  it("includes a Ver oferta call-to-action", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    expect(html).toContain("Ver oferta");
  });

  it("includes the product name in the body", () => {
    const { html } = renderPriceDropEmail(BASE_INPUT);
    expect(html).toContain(BASE_INPUT.productName);
  });
});
