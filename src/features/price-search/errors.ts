/**
 * Error raised when /api/scrape answers with a non-OK status.
 *
 * Its `message` is a user-facing string already resolved from the HTTP status,
 * so the UI can show it verbatim. A rejection that is NOT a ScrapeApiError
 * means the request never got an answer (offline, DNS, aborted connection),
 * which is the only case where blaming the connection is accurate.
 */
export class ScrapeApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ScrapeApiError";
    this.status = status;
  }
}

export const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar. Verificá tu conexión e intentá de nuevo.";

export function userMessageForStatus(status: number): string {
  if (status === 400) {
    return "La búsqueda no es válida. Revisá los términos e intentá de nuevo.";
  }
  if (status === 429) {
    return "Demasiadas búsquedas seguidas. Esperá un momento e intentá de nuevo.";
  }
  if (status >= 500) {
    return "El servicio no está disponible en este momento. Intentá de nuevo en unos minutos.";
  }
  return "No pudimos completar la búsqueda. Intentá de nuevo.";
}
