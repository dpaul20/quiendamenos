import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";
import { toLogSafeError } from "@/platform/errors";
import { getMeliAccessToken, invalidateMeliToken } from "@/platform/meli/token";

interface MeliAttribute {
  id: string;
  value_name?: string;
}

interface MeliResult {
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  attributes: MeliAttribute[];
}

interface MeliSearchResponse {
  results: MeliResult[];
}

/** 401/403 son las respuestas de la API cuando el token falta o venció. */
function isAuthFailure(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 401 || status === 403;
}

/**
 * Consulta la API firmando con el token de aplicación.
 *
 * Ante un fallo de autenticación descarta el token y reintenta una sola vez:
 * el token dura 6h y puede vencer entre que se cachea y se usa. Un segundo
 * fallo se propaga — reintentar más sería enmascarar credenciales inválidas.
 */
async function fetchMeliResults(url: string): Promise<MeliSearchResponse> {
  const requestWith = async (token: string) => {
    const { data } = await httpClient.get<MeliSearchResponse>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  };

  const token = await getMeliAccessToken();
  try {
    return await requestWith(token);
  } catch (error) {
    if (!isAuthFailure(error)) throw error;

    invalidateMeliToken();
    return requestWith(await getMeliAccessToken());
  }
}

export async function scrapeMercadoLibre(query: string): Promise<Product[]> {
  const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=50`;
  try {
    const data = await fetchMeliResults(url);
    return data.results.map((item) => {
      const brandAttr = item.attributes.find((a) => a.id === "BRAND");
      const brand = capitalize(brandAttr?.value_name ?? "Unknown");
      const image = item.thumbnail.replace(/-I\.jpg$/, "-O.jpg");
      return {
        name: item.title,
        price: item.price,
        from: StoreNamesEnum.MERCADOLIBRE,
        image,
        url: item.permalink,
        brand,
      };
    });
  } catch (error) {
    console.error(
      "Error fetching products from MercadoLibre:",
      toLogSafeError(error),
    );
    // Se relanza para que backoff pueda reintentar y el router caiga al caché
    // por tienda. Devolver [] hacía pasar el fallo por "sin resultados".
    throw error;
  }
}
