import { Badge } from "@/components/ui/badge";

interface InstallmentBadgeProps {
  installment: number;
}

export function InstallmentBadge({ installment }: InstallmentBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-[hsl(var(--installment))] px-2 py-[3px] font-display text-xs font-medium text-white"
    >
      {installment} CSI
    </Badge>
  );
}
