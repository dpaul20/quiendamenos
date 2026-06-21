import type { PriceHistoryEntry } from "@/features/price-history/types";

interface PriceHistoryChartProps {
  data: PriceHistoryEntry[];
  fmt?: (n: number) => string;
}

const defaultFmt = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const W = 520;
const H = 160;
const PAD = { top: 20, right: 20, bottom: 30, left: 20 };

export function PriceHistoryChart({
  data,
  fmt = defaultFmt,
}: PriceHistoryChartProps) {
  if (data.length < 2) return null;

  // Convert cents to pesos for display
  const prices = data.map((e) => e.minPrice / 100);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yOf = (p: number) =>
    PAD.top + innerH - ((p - minPrice) / priceRange) * innerH;

  const points = prices.map((p, i) => `${xOf(i)},${yOf(p)}`).join(" ");

  const minIdx = prices.indexOf(minPrice);
  const lastIdx = data.length - 1;
  const lastPrice = prices[lastIdx];

  const delta =
    minPrice > 0 ? Math.round(((lastPrice - minPrice) / minPrice) * 100) : 0;
  const deltaLabel = delta >= 0 ? `+${delta}%` : `${delta}%`;

  const gridPrices = Array.from(
    { length: 4 },
    (_, i) => minPrice + (priceRange / 3) * i,
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-label="Historial de precios"
    >
      {/* Horizontal grid lines */}
      {gridPrices.map((gp, i) => {
        const y = yOf(gp);
        return (
          <line
            key={i}
            x1={PAD.left}
            y1={y}
            x2={W - PAD.right}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        );
      })}

      {/* Polyline */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Min marker */}
      <circle
        cx={xOf(minIdx)}
        cy={yOf(minPrice)}
        r={4}
        fill="hsl(var(--price-down))"
      />

      {/* Current (last) marker */}
      <circle
        cx={xOf(lastIdx)}
        cy={yOf(lastPrice)}
        r={4}
        fill="hsl(var(--primary))"
      />

      {/* X-axis dates (start and end) */}
      <text
        x={PAD.left}
        y={H - 4}
        fontSize={9}
        fill="currentColor"
        fillOpacity={0.5}
      >
        {data[0].date}
      </text>
      <text
        x={W - PAD.right}
        y={H - 4}
        fontSize={9}
        fill="currentColor"
        fillOpacity={0.5}
        textAnchor="end"
      >
        {data[lastIdx].date}
      </text>

      {/* Legend */}
      <g transform={`translate(${PAD.left}, ${PAD.top - 4})`}>
        <text fontSize={9} fill="currentColor" fillOpacity={0.7}>
          <tspan fill="hsl(var(--price-down))">Mínimo </tspan>
          {fmt(minPrice)}
          {"  "}
          <tspan fill="hsl(var(--primary))">Actual </tspan>
          {fmt(lastPrice)}
          {"  "}
          {deltaLabel}
        </text>
      </g>
    </svg>
  );
}
