/**
 * Token de aplicación de MercadoLibre (OAuth client_credentials).
 *
 * La API de búsqueda dejó de aceptar requests anónimos: `/sites/MLA/search`
 * responde 403 `{"error":"forbidden"}` sin `Authorization`. El grant
 * `client_credentials` alcanza para datos públicos — no requiere autorización
 * de un usuario ni refresh_token.
 *
 * El token dura 6h. Se cachea en dos niveles:
 * - memoria del proceso, para no pegarle a Redis en cada request de la misma
 *   instancia;
 * - Redis, para que las instancias que arrancan en frío reusen el token vigente
 *   en lugar de pedir uno nuevo cada una.
 */

import redis from "@/platform/redis";
import { httpClient } from "@/platform/http";

export const MELI_TOKEN_CACHE_KEY = "meli:token";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

/**
 * Margen de seguridad: se renueva antes del vencimiento real para que un token
 * no expire en medio de una búsqueda ya en curso.
 */
const EXPIRY_SAFETY_MARGIN_SECONDS = 600;

/** Error de configuración o de obtención del token. Nunca incluye el secret. */
export class MeliAuthError extends Error {
  /**
   * `false` corta los reintentos del backoff. Falta de credenciales es un error
   * de configuración: reintentarlo cuatro veces por búsqueda no lo arregla.
   */
  readonly retriable: boolean;

  constructor(message: string, retriable = true) {
    super(message);
    this.name = "MeliAuthError";
    this.retriable = retriable;
  }
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let memoryToken: { value: string; expiresAt: number } | null = null;

/**
 * Request de refresh en curso. Sin esto, las 6 tiendas que arrancan en paralelo
 * pedirían 6 tokens distintos en el primer cache miss.
 */
let inFlight: Promise<string> | null = null;

function readCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.MELI_CLIENT_ID;
  const clientSecret = process.env.MELI_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new MeliAuthError(
      "MELI_CLIENT_ID y MELI_CLIENT_SECRET son requeridos para consultar MercadoLibre",
      false,
    );
  }

  return { clientId, clientSecret };
}

async function readFromRedis(): Promise<string | null> {
  try {
    const cached = await redis.get<string>(MELI_TOKEN_CACHE_KEY);
    return typeof cached === "string" && cached.length > 0 ? cached : null;
  } catch {
    // Redis caído no debe impedir obtener un token nuevo.
    return null;
  }
}

async function writeToRedis(token: string, ttlSeconds: number): Promise<void> {
  if (ttlSeconds <= 0) return;
  try {
    await redis.set(MELI_TOKEN_CACHE_KEY, token, { ex: ttlSeconds });
  } catch {
    // El token sigue siendo válido en memoria aunque no se pueda compartir.
  }
}

async function requestNewToken(): Promise<{ token: string; ttl: number }> {
  const { clientId, clientSecret } = readCredentials();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  try {
    const { data } = await httpClient.post<TokenResponse>(TOKEN_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });

    if (!data?.access_token) {
      throw new MeliAuthError("La respuesta de OAuth no incluyó access_token");
    }

    const ttl = Math.max(
      0,
      (data.expires_in ?? 0) - EXPIRY_SAFETY_MARGIN_SECONDS,
    );
    return { token: data.access_token, ttl };
  } catch (error) {
    if (error instanceof MeliAuthError) throw error;
    // Se descarta el error original a propósito: su `config.data` contiene el
    // client_secret del body del request.
    throw new MeliAuthError("No se pudo obtener el token de MercadoLibre");
  }
}

async function resolveToken(): Promise<string> {
  const cached = await readFromRedis();
  if (cached) {
    memoryToken = {
      value: cached,
      expiresAt: Date.now() + EXPIRY_SAFETY_MARGIN_SECONDS * 1000,
    };
    return cached;
  }

  const { token, ttl } = await requestNewToken();
  memoryToken = { value: token, expiresAt: Date.now() + ttl * 1000 };
  await writeToRedis(token, ttl);
  return token;
}

/** Devuelve un token válido, reusando el cacheado mientras no haya vencido. */
export async function getMeliAccessToken(): Promise<string> {
  if (memoryToken && Date.now() < memoryToken.expiresAt) {
    return memoryToken.value;
  }

  if (inFlight !== null) return inFlight;

  inFlight = resolveToken().finally(() => {
    // Se libera siempre: cachear una promesa rechazada dejaría la app sin
    // token hasta el próximo deploy.
    inFlight = null;
  });

  return inFlight;
}

/** Descarta el token cacheado. Se llama ante un 401/403 para forzar refresh. */
export function invalidateMeliToken(): void {
  memoryToken = null;
  inFlight = null;
  Promise.resolve(redis.del(MELI_TOKEN_CACHE_KEY)).catch(() => {
    // Best-effort: si Redis no responde, el caché en memoria ya quedó limpio.
  });
}
