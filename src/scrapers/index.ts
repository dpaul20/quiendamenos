import { Product } from "@/types/product";
import { scrapeNaldo } from "./naldo";
import { scrapeCetrogar } from "./cetrogar";
import { scrapeFravega } from "./fravega";
import { scrapeCarrefour } from "./carrefour";
import { scrapeOnCity } from "./oncity";

type Scraper = (query: string) => Promise<Product[]>;

/**
 * Tiendas cuyo scraper existe pero no se ejecuta.
 *
 * Al quedar fuera de `scrapers` no corren, no fallan y no disparan las alertas
 * de /api/health. El código del scraper se conserva para reactivarlas sin
 * reescribirlas: alcanza con volver a agregarlas al registro de abajo.
 *
 * - mercadolibre: sus dos vías de acceso están cerradas. La API oficial responde
 *   403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES incluso con un token OAuth válido
 *   (ver src/platform/meli/token.ts), y el listado HTML está detrás de un
 *   challenge de proof-of-work. Traerlo requiere los proxies premium de
 *   ScraperAPI, que el plan actual no incluye.
 */
export const DISABLED_STORES = ["mercadolibre"] as const;

export const scrapers: Record<string, Scraper> = {
  naldo: scrapeNaldo,
  cetrogar: scrapeCetrogar,
  fravega: scrapeFravega,
  carrefour: scrapeCarrefour,
  oncity: scrapeOnCity,
  default: async () => [],
};
