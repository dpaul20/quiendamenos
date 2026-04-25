import type { Page } from "@playwright/test";

export function getSelectors(page: Page) {
  return {
    searchInput: page.getByPlaceholder("Nombre del producto..."),
    searchButton: page.getByRole("button", { name: /buscar/i }),
    productCards: page.getByTestId("product-card"),
    skeletonCards: page.getByTestId("skeleton-card"),
    resultsCount: page.getByTestId("results-count"),
    emptyState: page.getByText("Sin resultados"),
    errorAlert: page.getByRole("alert"),
    storeFilterButton: (store: string) =>
      page.getByRole("button", { name: store, exact: true }),
    brandFilterTrigger: page.getByLabel("Seleccionar marca"),
    brandFilterInput: page.getByPlaceholder("Buscar marca..."),
    brandFilterOption: (brand: string) =>
      page.getByRole("option", { name: brand }),
    minPriceInput: page.getByLabel("Precio mínimo"),
    maxPriceInput: page.getByLabel("Precio máximo"),
    csiFilterGroup: page.getByRole("group", { name: "Cuotas sin interés" }),
    sortTrigger: page.getByLabel("Ordenar resultados"),
    sortOption: (label: string) => page.getByRole("option", { name: label }),
    paginationPrev: page.getByRole("button", { name: /anterior|ant/i }),
    paginationNext: page.getByRole("button", { name: /siguiente|sig/i }),
    paginationPage: (n: number) =>
      page.getByRole("button", { name: String(n) }),
    filterPanelToggle: page.getByRole("button", { name: /filtros/i }),
    activeFiltersCount: page.getByTestId("active-filters-count"),
    clearFiltersButton: page.getByRole("button", { name: /limpiar/i }),
  };
}
