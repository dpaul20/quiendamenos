import { scrapers, DISABLED_STORES } from "@/scrapers";

describe("registro de scrapers", () => {
  it("no expone las tiendas deshabilitadas", () => {
    for (const store of DISABLED_STORES) {
      expect(scrapers).not.toHaveProperty(store);
    }
  });

  it("mantiene mercadolibre deshabilitado", () => {
    expect(DISABLED_STORES).toContain("mercadolibre");
  });

  it("sigue exponiendo las tiendas activas", () => {
    const activas = Object.keys(scrapers).filter((k) => k !== "default");

    expect(activas).toEqual(
      expect.arrayContaining([
        "naldo",
        "cetrogar",
        "fravega",
        "carrefour",
        "oncity",
      ]),
    );
  });

  it("conserva el scraper por defecto que devuelve vacío", async () => {
    await expect(scrapers.default("cualquier cosa")).resolves.toEqual([]);
  });
});
