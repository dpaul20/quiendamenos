/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server";
import { PriceTrend } from "../PriceTrend";

describe("PriceTrend", () => {
  it("down badge uses --price-down and --price-down-bg CSS vars", () => {
    const html = renderToStaticMarkup(
      PriceTrend({ direction: "down", delta: 5 }),
    );
    expect(html).toContain("--price-down-bg");
    expect(html).toContain("--price-down");
  });

  it("up badge uses --price-up and --price-up-bg CSS vars", () => {
    const html = renderToStaticMarkup(
      PriceTrend({ direction: "up", delta: 3 }),
    );
    expect(html).toContain("--price-up-bg");
    expect(html).toContain("--price-up");
  });

  it('renders "0%" when delta=0', () => {
    const html = renderToStaticMarkup(
      PriceTrend({ direction: "down", delta: 0 }),
    );
    expect(html).toContain("0%");
  });

  it("renders label adjacent when provided", () => {
    const html = renderToStaticMarkup(
      PriceTrend({ direction: "down", delta: 5, label: "vs mín" }),
    );
    expect(html).toContain("vs mín");
  });
});
