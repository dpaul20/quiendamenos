/**
 * Estrategia de Exponential Backoff
 * 
 * Implementa exponential backoff con jitter para lógica de reintentos.
 * Estándar de la industria para manejar rate limiting y fallos transitorios.
 * 
 * Secuencia: 2s → 4s → 8s → 16s (con jitter aleatorio de 0-1s)
 */

import { categorizeError, categorizeHttpError } from '@/platform/errors';
/**
 * Configuración para exponential backoff
 */
export interface BackoffConfig {
  baseDelay: number; // Delay inicial en milisegundos (default: 2000ms = 2s)
  maxDelay: number; // Tope máximo de delay (default: 64000ms = 64s)
  maxAttempts: number; // Número máximo de reintentos (default: 4)
  multiplier: number; // Multiplicador exponencial (default: 2x)
}

/**
 * Resultado del reintentos con exponential backoff
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Calcula el delay para el siguiente intento con exponential backoff y jitter
 * 
 * Fórmula: min(baseDelay * (multiplier ^ attempt), maxDelay) + jitter
 * 
 * @param attempt Número de intento actual (indexado desde 0)
 * @param config Configuración de backoff
 * @returns Delay en milisegundos
 */
function calculateDelay(
  attempt: number,
  config: Partial<BackoffConfig> = {}
): number {
  const {
    baseDelay = 2000,
    maxDelay = 64000,
    multiplier = 2,
  } = config;

  // Cálculo exponencial: baseDelay * (multiplier ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);

  // Limitar a maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Añadir jitter aleatorio (0-1000ms) para evitar thundering herd
  const jitter = Math.random() * 1000;

  return Math.round(cappedDelay + jitter);
}

/** Determina la categoría del error según su tipo (HTTP o genérico). */
function categorizarError(error: unknown): ReturnType<typeof categorizeError> {
  const axiosLike = error as {
    response?: { status?: number; headers?: Record<string, string> };
  };
  if (axiosLike?.response?.status) {
    return categorizeHttpError(
      axiosLike.response.status,
      axiosLike.response.headers?.['retry-after'],
    );
  }
  return categorizeError(error);
}

/** Calcula el delay del siguiente reintento respetando Retry-After si está presente. */
function resolverDelay(
  categorized: ReturnType<typeof categorizeError>,
  attempt: number,
  config: { baseDelay: number; maxDelay: number; multiplier: number },
): number {
  if (categorized.retryDelay !== undefined) {
    return categorized.retryDelay * 1000;
  }
  return calculateDelay(attempt, config);
}

/**
 * Ejecuta una función con reintentos usando exponential backoff
 * 
 * Automáticamente reintenta en caso de fallo con delays incrementales.
 * Devuelve información detallada sobre intentos y tiempos.
 * 
 * @param fn Función a ejecutar (debe lanzar excepción en caso de fallo)
 * @param config Configuración de backoff (opcional)
 * @returns RetryResult con estado de éxito y datos
 */
export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<BackoffConfig> = {}
): Promise<RetryResult<T>> {
  const {
    baseDelay = 2000,
    maxDelay = 64000,
    maxAttempts = 4,
    multiplier = 2,
  } = config;

  let lastError: Error | undefined;
  const startTime = Date.now();

  // Intentar hasta maxAttempts + 1 veces (0, 1, 2, 3, 4 para maxAttempts=4)
  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    try {
      // Ejecutar función
      const data = await fn();

      const totalTime = Date.now() - startTime;
      console.log(
        `[Backoff] ✅ Éxito en intento ${attempt + 1}/${maxAttempts + 1} (${totalTime}ms)`
      );

      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const categorized = categorizarError(error);

      if (categorized.retriable) {
        // Si tenemos reintentos restantes, esperar y reintentar
        if (attempt < maxAttempts) {
          const delay = resolverDelay(categorized, attempt, { baseDelay, maxDelay, multiplier });
          console.log(
            `[Backoff] ⚠️  Intento ${attempt + 1}/${maxAttempts + 1} falló (${categorized.type}). ` +
              `Esperando ${delay}ms antes de reintentar... (Error: ${lastError.message})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // No más reintentos
          const totalTime = Date.now() - startTime;
          console.log(
            `[Backoff] ❌ Los ${maxAttempts + 1} intentos se agotaron después de ${totalTime}ms`,
          );
        }
      } else {
        // Errores no recuperables (404, 4xx desconocido, etc.) — salir inmediatamente.
        const totalTime = Date.now() - startTime;
        console.log(
          `[Backoff] 🚫 Error no recuperable (${categorized.type}): ${lastError.message} — sin reintentos`,
        );
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
          totalTime,
        };
      }
    }
  }

  // Todos los intentos fallaron
  const totalTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError,
    attempts: maxAttempts + 1,
    totalTime,
  };
}

/**
 * Envoltorio para exponential backoff que lanza excepción en caso de fallo
 * 
 * Sintaxis más limpia cuando se quieren excepciones en caso de fallo.
 * 
 * @param fn Función a ejecutar
 * @param maxAttempts Máximo de reintentos (default: 4)
 * @returns Datos en caso de éxito
 * @throws Error en caso de fallo después de agotar todos los reintentos
 */
