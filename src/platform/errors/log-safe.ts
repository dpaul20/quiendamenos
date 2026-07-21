/**
 * Redacción de secretos para logs.
 *
 * Distinto de `redactError`, que arma el body de una respuesta HTTP y en
 * producción devuelve un mensaje genérico. Acá el objetivo es el opuesto:
 * conservar el diagnóstico (nombre, mensaje, código, status, URL) y tapar
 * únicamente los secretos.
 *
 * Motivo: ScraperAPI exige la API key como query param, así que viaja dentro
 * de `config.url` de axios. Loguear el error crudo la publicaba en texto plano
 * en los logs de runtime.
 */

export const REDACTED = "***REDACTED***";

/** Nombres de query params cuyo valor nunca debe aparecer en un log. */
const SENSITIVE_PARAM =
  /(api[-_]?key|access[-_]?token|refresh[-_]?token|client[-_]?secret|authorization|password|passwd|signature|secret|token|auth|sig|pwd|key)/i;

/** Env vars cuyo nombre sugiere que el valor es un secreto. */
const SECRET_ENV_NAME = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL)/i;

/**
 * Valores más cortos que esto se ignoran: enmascarar cadenas de 3 o 4
 * caracteres arruinaría el log entero por coincidencias accidentales.
 */
const MIN_SECRET_LENGTH = 8;

const MAX_MESSAGE_LENGTH = 300;
const MAX_URL_LENGTH = 200;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function secretEnvValues(): string[] {
  return Object.entries(process.env)
    .filter(
      ([name, value]) =>
        SECRET_ENV_NAME.test(name) &&
        typeof value === "string" &&
        value.length >= MIN_SECRET_LENGTH,
    )
    .map(([, value]) => value as string);
}

/**
 * Enmascara secretos en un texto arbitrario: valores de query params sensibles
 * y valores de env vars que parezcan secretas, aparezcan donde aparezcan.
 */
export function redactSecrets(input: string): string {
  let output = input.replace(
    /([?&#][^?&#=\s]*?)=([^&\s"']*)/g,
    (match, rawName: string, value: string) => {
      const name = rawName.slice(1);
      if (!value || !SENSITIVE_PARAM.test(name)) return match;
      return `${rawName}=${REDACTED}`;
    },
  );

  for (const secret of secretEnvValues()) {
    output = output.split(secret).join(REDACTED);
  }

  return output;
}

interface HttpErrorShape {
  code?: unknown;
  config?: { url?: unknown; method?: unknown };
  response?: { status?: unknown };
}

function asHttpErrorShape(error: unknown): HttpErrorShape {
  return typeof error === "object" && error !== null
    ? (error as HttpErrorShape)
    : {};
}

/**
 * Devuelve un resumen de una línea, sin secretos y sin el volcado completo del
 * objeto de axios (que llegaba a ocupar cientos de líneas por error).
 */
export function toLogSafeError(error: unknown): string {
  const parts: string[] = [];

  if (error instanceof Error) {
    parts.push(`${error.name}: ${truncate(error.message, MAX_MESSAGE_LENGTH)}`);
  } else {
    parts.push(truncate(String(error ?? "Unknown error"), MAX_MESSAGE_LENGTH));
  }

  const { code, config, response } = asHttpErrorShape(error);

  if (typeof code === "string" && code) parts.push(`code=${code}`);
  if (typeof response?.status === "number")
    parts.push(`status=${response.status}`);

  if (typeof config?.url === "string" && config.url) {
    const method =
      typeof config.method === "string" ? config.method.toUpperCase() : "GET";
    parts.push(`${method} ${truncate(config.url, MAX_URL_LENGTH)}`);
  }

  return redactSecrets(parts.join(" | ").replace(/\s*\n\s*/g, " "));
}
