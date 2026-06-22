import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriceTrendProps {
  direction: "up" | "down";
  delta: number;
  label?: string;
}

export function PriceTrend({ direction, delta, label }: PriceTrendProps) {
  const isDown = direction === "down";

  return (
    <span className="inline-flex items-center gap-1">
      <Badge
        variant="outline"
        className={cn(
          "border-transparent px-2 py-[3px] text-xs font-medium",
          isDown
            ? "bg-[var(--price-down-bg)] text-[var(--price-down)]"
            : "bg-[var(--price-up-bg)] text-[var(--price-up)]",
        )}
      >
        {isDown ? "↓" : "↑"} {delta}%
      </Badge>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
