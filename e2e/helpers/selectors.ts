import type { Page } from "@playwright/test";

export function getSelectors(page: Page) {
  return {
    searchInput: page.getByPlaceholder("Nombre del producto..."),
    searchButton: page.getByRole("button", { name: /buscar/i }),
    productCards: page.getByTestId("product-card"),
    skeletonCards: page.getByTestId("skeleton-card"),
    resultsCount: page.getByTestId("results-count"),
    emptyState: page.getByText("Sin resultados"),
    errorAlert: page.locator(
      '[role="alert"]:not([id="__next-route-announcer__"])',
    ),
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
      page.getByRole("button", { name: String(n), exact: true }),
    filterPanelToggle: page.getByRole("button", { name: /filtros/i }),
    activeFiltersCount: page.getByTestId("active-filters-count"),
    clearFiltersButton: page.getByRole("button", { name: /limpiar/i }),

    // ProductDetailPanel selectors
    backButton: page.getByRole("button", { name: /Volver a resultados/i }),
    detailPanel: page.getByText("Volver a resultados").first(),
    goToStoreLink: page.getByRole("link", { name: /Ir a/i }).first(),
    followButton: page.getByRole("button", {
      name: /Seguir precio|Siguiendo/i,
    }),

    // CategoryChips selectors
    categoryChip: (label: string) =>
      page.getByRole("button", { name: label, exact: true }),
    categoryChips: page.getByRole("button", {
      name: /Celulares|Tablets|TVs|Auriculares|Notebooks|Consolas|Heladeras|Lavadoras/i,
    }),

    // Disclaimer selectors
    disclaimerHeading: page.getByText("¿Cómo funciona?"),
    disclaimerDismiss: page.getByRole("button", { name: /Cerrar aviso/i }),
  };
}
