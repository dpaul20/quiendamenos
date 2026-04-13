export function EmptyState() {
  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col gap-4 items-center justify-center h-[300px] w-full max-w-[520px] mx-auto">
      <div className="bg-muted rounded-[32px] size-16 overflow-hidden relative shrink-0">
        <div className="bg-muted-foreground/40 rounded-[14px] size-7 absolute left-[18px] top-4" />
      </div>
      <div className="flex flex-col gap-2 items-center text-center px-6">
        <p className="text-lg font-medium text-foreground">Sin resultados</p>
        <p className="text-sm text-muted-foreground">
          Probá con otro término de búsqueda o revisá los filtros.
        </p>
      </div>
    </div>
  );
}
