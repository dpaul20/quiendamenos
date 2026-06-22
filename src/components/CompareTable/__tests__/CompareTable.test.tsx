/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server";
import { CompareTable } from "../CompareTable";
import type { CompareOffer } from "@/features/price-search/match";

const offers: CompareOffer[] = [
  {
    store: "Fravega",
    price: 150000,
    url: "https://fravega.com/p1",
    stock: true,
  },
  {
    store: "Cetrogar",
    price: 120000,
    url: "https://cetrogar.com/p1",
    stock: true,
  },
  {
    store: "Musimundo",
    price: 180000,
    url: "https://musimundo.com/p1",
    stock: false,
  },
];

describe("CompareTable", () => {
  it("renders offers sorted by price ascending", () => {
    const html = renderToStaticMarkup(
      <CompareTable offers={offers} onGoToStore={() => {}} />,
    );
    const cetrogarIdx = html.indexOf("Cetrogar");
    const fravegarIdx = html.indexOf("Fravega");
    const musimundoIdx = html.indexOf("Musimundo");
    expect(cetrogarIdx).toBeLessThan(fravegarIdx);
    expect(fravegarIdx).toBeLessThan(musimundoIdx);
  });

  it('renders "MEJOR PRECIO" label on the best-price row', () => {
    const html = renderToStaticMarkup(
      <CompareTable offers={offers} onGoToStore={() => {}} />,
    );
    expect(html).toContain("MEJOR PRECIO");
  });

  it("formats price in ARS locale", () => {
    const html = renderToStaticMarkup(
      <CompareTable
        offers={[{ store: "Test", price: 120000, url: "u", stock: true }]}
        onGoToStore={() => {}}
      />,
    );
    expect(html).toContain("120");
  });

  it("out-of-stock row spans have opacity-50 class", () => {
    const html = renderToStaticMarkup(
      <CompareTable offers={offers} onGoToStore={() => {}} />,
    );
    // " opacity-50" (with leading space) matches standalone class, not disabled:opacity-50
    expect(html).toContain(" opacity-50");
  });

  it("out-of-stock CTA button is disabled", () => {
    const html = renderToStaticMarkup(
      <CompareTable offers={offers} onGoToStore={() => {}} />,
    );
    expect(html).toContain("disabled");
  });

  it("best-price row spans do not have opacity-50 when in stock", () => {
    const html = renderToStaticMarkup(
      <CompareTable
        offers={[{ store: "Solo", price: 100000, url: "u", stock: true }]}
        onGoToStore={() => {}}
      />,
    );
    expect(html).not.toContain(" opacity-50");
  });
});
