---
title: "FEAT-2: Retry + Cache Fallback Router"
status: not-started
stories: [US-201, US-202]
depends-on: [FEAT-1]
blocks: [FEAT-3]
complexity: medium
risk: medium     # requiere refactor de scrapeWebsite()
---

## Problem

`scrapeWebsite()` en `scraper.ts` tiene 6 scrapers independientes, cada uno con su propio
`try/catch` que devuelve `[]` silenciosamente. No hay reintento, ni fallback a caché, ni
propagación de errores diferenciada. Si una tienda falla, el usuario ve cero resultados sin saber por qué.

## Context / Estado del codebase

### Archivos relevantes

| Archivo | Descripción | FEAT-2 lo modifica |
|---------|-------------|-------------------|
| `src/lib/scraper.ts` | `scrapers` record + `scrapeWebsite()` | ✅ sí — refactor `scrapeWebsite()` |
| `src/lib/cache.ts` | `getCachedData(key)` / `setCachedData(key, data)` | ❌ solo consume |
| `src/lib/strategies/backoff-strategy.ts` | `exponentialBackoff<T>(fn, config?)` | ❌ solo consume |
| `src/lib/strategies/error-categorizer.ts` | `categorizeError(error)` → `CategorizedError` | ❌ solo consume |
| `src/lib/router-strategy.ts` | **no existe** | ✅ crear |
| `src/lib/__tests__/router-strategy.test.ts` | **no existe** | ✅ crear |

### Arquitectura actual de `scraper.ts`

```typescript
const scrapers: Record<string, Scraper> = {
  cetrogar:     async (query) => { /* axios + cheerio, try/catch → [] */ },
  fravega:      async (query) => { /* axios + cheerio, try/catch → [] */ },
  musimundo:    async (query) => { /* axios a API braindw,  try/catch → [] */ },
  naldo:        async (query) => { /* VTEX API,             try/catch → [] */ },
  carrefour:    async (query) => { /* VTEX API,             try/catch → [] */ },
  mercadolibre: async (query) => { /* axios + cheerio,     try/catch → [] */ },
  default:      async () => [],
};

export async function scrapeWebsite(query: string): Promise<Product[]> {
  // urls.map(url => url.split(".")[1])  ← frágil, reemplazar
  // Promise.all(promises) sin retry ni fallback a caché
}
```

### Cache API

```typescript
getCachedData(key: string): Promise<unknown | null>
setCachedData(key: string, data: unknown): Promise<void>  // TTL: 3600s
```

## Acceptance Criteria

1. `scrapeWebsite(query)` sigue siendo la única función pública exportada y su firma no cambia.
2. Si `scrapers[store](query)` falla con error retryable, se reintenta con `exponentialBackoff` (máx 4 intentos).
3. Si todos los intentos fallan, se devuelve el resultado de `getCachedData(store)` (puede ser `null` → `[]`).
4. Antes de devolver un resultado exitoso, se llama a `setCachedData` con ese resultado.
5. Cada decisión se loggea: `[Router] store=X attempt=Z outcome=success|retry|cache_hit|cache_miss`.
6. `scrapeWebsite()` sigue lanzando todas las tiendas en paralelo (`Promise.all`).
7. `urls.split(".")[1]` reemplazado por array explícito de store keys.
8. Tests con mocks cubren: éxito directo, retry exitoso, fallback a caché (hit), caché miss → `[]`.

## Nuevo archivo: `src/lib/router-strategy.ts`

### API pública

```typescript
export async function scrapeWithFallback(
  store: string,
  query: string,
  primaryScraper: (q: string) => Promise<Product[]>
): Promise<Product[]>
```

### Lógica interna

```
1. Intentar primaryScraper(query) envuelto en exponentialBackoff (máx 4 intentos)
   → Si success: setCachedData(store, result) → return result
   → Si todos fallan: continuar al paso 2

2. Intentar getCachedData(store)
   → Si hit: log cache_hit → return cached
   → Si miss: log cache_miss → return []

Log en cada paso: [Router] store, intento N, outcome
```

### Cambio en `scrapeWebsite()` (en `scraper.ts`)

```typescript
// ANTES (frágil)
const promises = urls.map((url) => {
  const store = url.split(".")[1];
  const scraper = scrapers[store] || scrapers.default;
  return scraper(query);
});

// DESPUÉS
const storeKeys = ['naldo', 'musimundo', 'cetrogar', 'fravega', 'carrefour', 'mercadolibre'];
const promises = storeKeys.map((store) => {
  const scraper = scrapers[store] ?? scrapers.default;
  return scrapeWithFallback(store, query, scraper);
});
```

## Tasks

### T1 — Crear `src/lib/router-strategy.ts`

Implementar `scrapeWithFallback(store, query, primaryScraper)`:
- Importar: `exponentialBackoff` de `strategies/backoff-strategy`, `getCachedData`/`setCachedData` de `cache`
- Loggear cada decisión con prefijo `[Router]`

### T2 — Crear `src/lib/__tests__/router-strategy.test.ts`

Casos mínimos (con `jest.mock`):
```
✓ devuelve productos si primaryScraper tiene éxito en primer intento
✓ reintenta y tiene éxito en el segundo intento (backoff)
✓ devuelve caché cuando todos los intentos fallan (cache hit)
✓ devuelve [] cuando todos los intentos fallan y caché es null (cache miss)
✓ llama setCachedData con resultado exitoso
✓ NO llama setCachedData si se devuelve resultado de caché
```

### T3 — Refactorizar `scrapeWebsite()` en `scraper.ts`

- Reemplazar `urls.map(url => url.split(".")[1])` por array explícito de store keys
- Envolver cada `scraper(query)` en `scrapeWithFallback(store, query, scraper)`
- Los `try/catch` dentro de cada función del objeto `scrapers` pueden permanecer como primer nivel de error

### T4 — Verificar compilación y tests

```bash
npx jest --passWithNoTests
npx tsc --noEmit
```

## Constraints

- `scrapeWebsite(query): Promise<Product[]>` — firma pública invariante.
- NO modificar `getCachedData`/`setCachedData` en `cache.ts`.
- NO modificar las funciones `formatProduct*` ni `buildUrl*` en `scraper.ts`.
- NO crear un `CheerioAdapter` class — `scrapers[store]` ya es el adapter.
- NO agregar Playwright al router — ninguna tienda actual lo necesita. Disponible para futuras tiendas via FEAT-3.

## Definition of Done

```bash
npx jest src/lib/__tests__/router-strategy.test.ts --coverage
npx tsc --noEmit
npx jest --passWithNoTests
```
