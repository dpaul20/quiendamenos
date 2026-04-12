---
title: "FEAT-1: Playwright + Exponential Backoff"
status: verified             # not-started | in-progress | implemented | verified
stories: [US-101, US-102, US-103, EN-101]
blocks: [FEAT-2]
complexity: medium
risk: low                    # código ya existe, tests pendientes de verificar
---

## Problem

El scraper Cheerio falla silenciosamente en tiendas con contenido renderizado por JavaScript.
No hay lógica de reintento ni clasificación de errores — cualquier fallo descarta la petición.

> El código de FEAT-1 está implementado. Las tiendas actuales no usan Playwright directamente,
> pero los módulos son la base para que FEAT-2 pueda hacer retry inteligente.

## Context / Estado actual del codebase

| Archivo | Estado |
|---------|--------|
| `src/lib/adapters/playwright-adapter.ts` | ✅ implementado |
| `src/lib/strategies/backoff-strategy.ts` | ✅ implementado |
| `src/lib/strategies/error-categorizer.ts` | ✅ implementado |
| `src/lib/adapters/index.ts` | ✅ existe (exports) |
| `src/lib/strategies/index.ts` | ✅ existe (exports) |
| `src/lib/__tests__/playwright-adapter.test.ts` | ⚠️ verificar cobertura |
| `src/lib/__tests__/backoff-strategy.test.ts` | ⚠️ verificar cobertura |
| `src/lib/__tests__/error-categorizer.test.ts` | ⚠️ verificar cobertura |
| `src/lib/scraper.ts` | ❌ no integra aún (responsabilidad de FEAT-2) |

### Interfaces clave (ya definidas)

```typescript
// playwright-adapter.ts
PlaywrightAdapterConfig { url, selector?, timeout?, maxRetries?, userAgent?, waitUntil? }
PlaywrightResult { html, success, attempts, duration, statusCode? }

// backoff-strategy.ts
BackoffConfig { baseDelay, maxDelay, maxAttempts, multiplier }
RetryResult<T> { success, data?, error?, attempts, totalTime }
calculateDelay(attempt, config?): number
exponentialBackoff<T>(fn, config?): Promise<RetryResult<T>>

// error-categorizer.ts
ErrorType (enum): JAVASCRIPT_REQUIRED | RATE_LIMITED | BLOCKING | NETWORK_ERROR | NOT_FOUND | SERVER_ERROR | TIMEOUT | UNKNOWN
CategorizedError { type, statusCode?, message, retriable, retryDelay?, details? }
categorizeHttpError(statusCode, retryAfter?): CategorizedError
categorizeError(error): CategorizedError
```

## Acceptance Criteria

1. `PlaywrightAdapter` lanza y cierra Chromium sin dejar procesos huérfanos.
2. `calculateDelay(attempt)` produce la secuencia ≈ 2s → 4s → 8s → 16s (± 1s jitter).
3. `exponentialBackoff` reintenta máximo 4 veces y retorna `success: false` si todos fallan.
4. `categorizeHttpError(429)` retorna `retriable: true` y `type: RATE_LIMITED`.
5. `categorizeHttpError(403)` retorna `retriable: true` y `type: BLOCKING`.
6. El header `Retry-After: 60` se parsea como `retryDelay: 60`.
7. Cobertura de tests ≥ 85% en los 3 módulos nuevos.
8. Todos los tests del proyecto siguen pasando sin cambios.

## Tasks

> Estado: código implementado. Las tasks son de verificación y cierre.

### T1 — Verificar tests existentes pasan
```bash
npx jest src/lib/__tests__ --coverage --forceExit
```
- Criterio: 0 failures, cobertura ≥ 85% en los 3 archivos.
- Si faltan casos: completar en los `.test.ts` existentes (no crear nuevos archivos).

### T2 — Verificar que no hay procesos browser huérfanos
- En `playwright-adapter.ts` confirmar que `closeBrowser()` se llama en bloque `finally`.
- Si falta: agregar `try/finally` en la función principal de scraping.

### T3 — Verificar compilación sin errores
```bash
npx tsc --noEmit
```

### T4 — Marcar feature como verificada
- Actualizar `status` en este frontmatter a `verified`.

## Constraints

- NO modificar `src/lib/scraper.ts` — responsabilidad de FEAT-2.
- NO instalar dependencias adicionales — Playwright ya está en `package.json`.
- NO cambiar las interfaces públicas exportadas — FEAT-2 depende de ellas.
- El browser debe ser singleton (patrón ya implementado con `let browser: Browser | null`).
- Jitter máximo: 1000ms. No aumentar.
