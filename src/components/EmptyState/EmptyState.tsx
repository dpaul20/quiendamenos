import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = "Sin resultados",
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <Search className="h-10 w-10 text-muted-foreground" />
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">
        {children ?? "Probá con otro término de búsqueda o revisá los filtros."}
      </p>
    </div>
  );
}
