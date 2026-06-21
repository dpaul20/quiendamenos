import { Button } from "@/components/ui/button";
import type { CompareOffer } from "@/features/price-search/match";

interface CompareTableProps {
  offers: CompareOffer[];
  onGoToStore: (url: string) => void;
}

const fmtARS = (n: number) =>
  n === Infinity
    ? "—"
    : n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export function CompareTable({ offers, onGoToStore }: CompareTableProps) {
  const sorted = [...offers].sort((a, b) => a.price - b.price);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr auto",
      }}
    >
      {/* Header */}
      <span className="px-3 py-2 text-[11px] uppercase tracking-[.04em] text-muted-foreground">
        Tienda
      </span>
      <span className="px-3 py-2 text-[11px] uppercase tracking-[.04em] text-muted-foreground">
        Precio
      </span>
      <span className="px-3 py-2 text-[11px] uppercase tracking-[.04em] text-muted-foreground">
        Cuotas
      </span>
      <span className="px-3 py-2 text-[11px] uppercase tracking-[.04em] text-muted-foreground">
        —
      </span>

      {sorted.map((offer, i) => {
        const isBest = i === 0;
        const rowStyle = isBest
          ? { background: "hsl(var(--price-down-bg))" }
          : undefined;

        return (
          <div key={offer.url} className="contents">
            <span
              className={`flex items-center gap-1 px-3 py-2 text-sm${offer.stock === false ? "opacity-50" : ""}`}
              style={rowStyle}
            >
              {offer.store}
            </span>
            <span
              className={`flex items-center px-3 py-2 text-sm font-medium${offer.stock === false ? "opacity-50" : ""}`}
              style={rowStyle}
            >
              {isBest && (
                <span className="mr-1 text-[10px] font-semibold uppercase text-[hsl(var(--price-down))]">
                  MEJOR PRECIO
                </span>
              )}
              {fmtARS(offer.price)}
            </span>
            <span
              className={`flex items-center px-3 py-2 text-sm${offer.stock === false ? "opacity-50" : ""}`}
              style={rowStyle}
            >
              {offer.installment != null ? `${offer.installment} CSI` : "—"}
            </span>
            <span
              className={`flex items-center px-3 py-2${offer.stock === false ? "opacity-50" : ""}`}
              style={rowStyle}
            >
              <Button
                size="sm"
                variant={isBest ? "default" : "outline"}
                onClick={() => onGoToStore(offer.url)}
                disabled={offer.stock === false}
                className="rounded-lg text-xs"
              >
                Ver
              </Button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
