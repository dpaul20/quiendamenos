/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server";
import { PriceHistoryChart } from "../PriceHistoryChart";

describe("PriceHistoryChart", () => {
  it("returns null when data is empty", () => {
    const html = renderToStaticMarkup(<PriceHistoryChart data={[]} />);
    expect(html).toBe("");
  });

  it("returns null when data has a single entry", () => {
    const html = renderToStaticMarkup(
      <PriceHistoryChart data={[{ date: "2026-01-01", minPrice: 10000 }]} />,
    );
    expect(html).toBe("");
  });

  it("renders an SVG polyline for 2+ entries", () => {
    const html = renderToStaticMarkup(
      <PriceHistoryChart
        data={[
          { date: "2026-01-01", minPrice: 10000 },
          { date: "2026-01-02", minPrice: 12000 },
        ]}
      />,
    );
    expect(html).toContain("<svg");
    expect(html).toContain("polyline");
  });

  it("passes minPrice divided by 100 to the formatter (cents → pesos)", () => {
    const seen: number[] = [];
    const fmt = (n: number) => {
      seen.push(n);
      return String(n);
    };
    renderToStaticMarkup(
      <PriceHistoryChart
        data={[
          { date: "2026-01-01", minPrice: 10000 },
          { date: "2026-01-02", minPrice: 15000 },
        ]}
        fmt={fmt}
      />,
    );
    expect(seen).toContain(100);
    expect(seen).toContain(150);
  });

  it("renders start and end dates on the x-axis", () => {
    const html = renderToStaticMarkup(
      <PriceHistoryChart
        data={[
          { date: "2026-01-01", minPrice: 10000 },
          { date: "2026-03-15", minPrice: 12000 },
        ]}
      />,
    );
    expect(html).toContain("2026-01-01");
    expect(html).toContain("2026-03-15");
  });
});
