/**
 * Categorizador de Errores
 * 
 * Categoriza automáticamente errores para determinar la estrategia de reintentos.
 * Tipos: JAVASCRIPT_REQUIRED, RATE_LIMITED, BLOCKING, NETWORK_ERROR, UNKNOWN
 */

/**
 * Enumeración de tipos de error
 */
export enum ErrorType {
  JAVASCRIPT_REQUIRED = 'javascript_required',
  RATE_LIMITED = 'rate_limited',
  BLOCKING = 'blocking',
  NETWORK_ERROR = 'network_error',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * Error categorizado con metadatos
 */
export interface CategorizedError {
  type: ErrorType;
  statusCode?: number;
  message: string;
  retriable: boolean;
  retryDelay?: number; // Segundos (del header Retry-After)
  details?: Record<string, unknown>;
}

/**
 * Categoriza error HTTP por código de estado
 * 
 * @param statusCode Código de estado HTTP
 * @param retryAfter Valor opcional del header Retry-After (en segundos)
 * @returns Error categorizado
 */
export function categorizeHttpError(
  statusCode: number,
  retryAfter?: string
): CategorizedError {
  const retryDelay = retryAfter ? Number.parseInt(retryAfter, 10) : undefined;

  switch (statusCode) {
    // 429: Demasiadas solicitudes - Rate limited
    case 429:
      return {
        type: ErrorType.RATE_LIMITED,
        statusCode,
        message: 'Demasiadas solicitudes (429) - Rate limited',
        retriable: true,
        retryDelay,
      };

    // 403: Prohibido - Generalmente bloqueo IP temporal
    case 403:
      return {
        type: ErrorType.BLOCKING,
        statusCode,
        message: 'Prohibido (403) - La IP podría estar bloqueada',
        retriable: true,
        retryDelay,
      };

    // 404: No encontrado - No reintentar
    case 404:
      return {
        type: ErrorType.NOT_FOUND,
        statusCode,
        message: 'No encontrado (404) - El recurso no existe',
        retriable: false,
      };

    // 5xx: Errores del servidor - Reintentar
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: ErrorType.SERVER_ERROR,
        statusCode,
        message: `Error del servidor (${statusCode}) - El servidor podría estar temporalmente unavailable`,
        retriable: true,
        retryDelay: retryDelay || 10, // Default 10s para errores del servidor
      };

    default:
      return {
        type: ErrorType.UNKNOWN,
        statusCode,
        message: `Error HTTP (${statusCode})`,
        retriable: false,
      };
  }
}

/**
 * Categoriza error genérico
 * 
 * Detecta patrones de error comunes:
 * - Errores de red (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
 * - Errores de timeout
 * - Renderización de JavaScript requerida (contenido HTML pequeño)
 * 
 * @param error Objeto de error
 * @param htmlContent Contenido HTML opcional para verificar tamaño
 * @returns Error categorizado
 */
export function categorizeError(
  error: unknown,
  htmlContent?: string
): CategorizedError {
  if (!error) return categorizarNulo();
  if (error instanceof Error) return categorizarInstanciaError(error);
  if (typeof error === 'string') return categorizarErrorString(error);
  if (htmlContent) return categorizarHtml(htmlContent);

  return {
    type: ErrorType.UNKNOWN,
    message: `Error desconocido: ${String(error)}`,
    retriable: false,
    details: { originalError: String(error) },
  };
}

function categorizarNulo(): CategorizedError {
  return {
    type: ErrorType.UNKNOWN,
    message: 'Error desconocido (null/undefined)',
    retriable: false,
  };
}

function categorizarInstanciaError(error: Error): CategorizedError {
  const message = error.message.toLowerCase();

  if (message.includes('econnrefused') || message.includes('connect econnrefused')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Conexión rechazada - El servidor podría estar caído',
      retriable: true,
      details: { originalError: error.message },
    };
  }

  if (message.includes('etimedout') || message.includes('timeout') || message.includes('timed out')) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Timeout de solicitud - El servidor no está respondiendo',
      retriable: true,
      details: { originalError: error.message },
    };
  }

  if (message.includes('enotfound') || message.includes('getaddrinfo')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Error de búsqueda DNS - Dominio no encontrado',
      retriable: true,
      details: { originalError: error.message },
    };
  }

  if (message.includes('econnreset')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Conexión reiniciada - El servidor cerró la conexión',
      retriable: true,
      details: { originalError: error.message },
    };
  }

  if (message.includes('javascript') || message.includes('content too small')) {
    return {
      type: ErrorType.JAVASCRIPT_REQUIRED,
      message: 'El contenido requiere renderización de JavaScript',
      retriable: true,
      details: { originalError: error.message },
    };
  }

  // Default: asumir recuperable para errores genéricos
  return {
    type: ErrorType.UNKNOWN,
    message: error.message,
    retriable: true,
    details: { originalError: error.message },
  };
}

function categorizarErrorString(error: string): CategorizedError {
  const lower = error.toLowerCase();

  if (lower.includes('timeout')) {
    return { type: ErrorType.TIMEOUT, message: error, retriable: true };
  }
  if (lower.includes('connection') || lower.includes('network')) {
    return { type: ErrorType.NETWORK_ERROR, message: error, retriable: true };
  }
  return { type: ErrorType.UNKNOWN, message: error, retriable: false };
}

function categorizarHtml(htmlContent: string): CategorizedError {
  const esJsRequerido =
    htmlContent.length < 1000 &&
    (htmlContent.includes('javascript') ||
      htmlContent.includes('enable javascript') ||
      htmlContent.includes('script is required'));

  if (esJsRequerido) {
    return {
      type: ErrorType.JAVASCRIPT_REQUIRED,
      message: 'Contenido requiere JavaScript - HTML muy pequeño',
      retriable: true,
      details: { contentLength: htmlContent.length },
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: 'Error desconocido en contenido HTML',
    retriable: false,
  };
}

/**
 * Verifica si un error es recuperable basado en el tipo
 * 
 * @param errorType Tipo de error
 * @returns Si el error debería reintentarse
 */
export function isRetriable(errorType: ErrorType): boolean {
  return [
    ErrorType.RATE_LIMITED,
    ErrorType.BLOCKING,
    ErrorType.NETWORK_ERROR,
    ErrorType.SERVER_ERROR,
    ErrorType.TIMEOUT,
    ErrorType.JAVASCRIPT_REQUIRED,
  ].includes(errorType);
}

/**
 * Obtiene el delay de reintentos para el tipo de error
 * 
 * Algunos errores tienen delays recomendados de servidores (header Retry-After).
 * Esta función proporciona defaults sensatos.
 * 
 * @param error Error categorizado
 * @returns Delay en milisegundos (o undefined si no hay delay especificado por servidor)
 */
export function getRetryDelay(error: CategorizedError): number | undefined {
  if (error.retryDelay) {
    return error.retryDelay * 1000; // Convertir segundos a milisegundos
  }

  // Delays por defecto según el tipo de error
  switch (error.type) {
    case ErrorType.RATE_LIMITED:
      return 5000; // 5 segundos
    case ErrorType.BLOCKING:
      return 10000; // 10 segundos
    case ErrorType.SERVER_ERROR:
      return 15000; // 15 segundos
    case ErrorType.TIMEOUT:
      return 3000; // 3 segundos
    case ErrorType.NETWORK_ERROR:
      return 2000; // 2 segundos
    default:
      return undefined; // Sin delay
  }
}

/**
 * Exportar tipos y enums
 */
