---
title: "FEAT-3: Config-driven para tiendas nuevas"
status: not-started
stories: [US-301, US-302]
depends-on: [FEAT-2]
blocks: [FEAT-4]
complexity: medium
risk: low     # las 6 tiendas existentes NO se tocan
---

## Problem

Agregar una nueva tienda requiere tocar código en `scraper.ts` (nueva función + formateo),
`stores.enum.ts` (nuevo valor), y posiblemente `StoresList.tsx`. Con 6 tiendas es manejable;
con 10+ se vuelve tedioso y propenso a errores.

> **Scope acotado**: FEAT-3 habilita agregar tiendas **nuevas** tipo Cheerio/HTML sin tocar código.
> Las 6 tiendas existentes permanecen en `scraper.ts` intactas — no hay migración.
> Tiendas con APIs complejas (VTEX, braindw) siguen requiriendo código custom.

## Context / Estado del codebase

### Archivos relevantes

| Archivo | Estado | Acción FEAT-3 |
|---------|--------|---------------|
| `src/lib/scraper.ts` | 6 funciones + `scrapeWebsite()` | Extender `scrapeWebsite()` con stores del registry |
| `src/enums/stores.enum.ts` | 6 valores estáticos | **No tocar** |
| `src/app/api/scrape/route.ts` | Llama `scrapeWebsite(query)` | **No tocar** |
| `src/stores/` | ❌ no existe | ✅ crear |

### Estructura objetivo

```
src/
  stores/
    config/
      stores.config.json       ← fuente de verdad para tiendas nuevas
    parsers/
      cheerio.parser.ts        ← parser genérico para tiendas HTML simples
    registry.ts                ← registro de stores cargados desde config
    loader.ts                  ← lee config, valida schema, instancia scrapers
    __tests__/
      loader.test.ts
      cheerio.parser.test.ts
```

### Schema de `stores.config.json`

```jsonc
{
  "stores": [
    {
      "key": "nuevatienda",
      "displayName": "Nueva Tienda",
      "parser": "cheerio",
      "url": "https://www.nuevatienda.com.ar/search?q={query}",
      "selectors": {
        "container": ".product-item",
        "name": ".product-name",
        "price": ".price",
        "image": "img",
        "url": "a",
        "installment": ".cuotas"   // opcional
      }
    }
  ]
}
```

> `{query}` en la URL es el placeholder — se reemplaza en runtime con el término de búsqueda.
> VTEX y braindw NO son candidatos a config-driven — tienen lógica demasiado específica.

### Integración con `scrapeWebsite()`

```typescript
// Al final de scrapeWebsite(), después de los 6 scrapers existentes:
const configStores = registry.getAllStores();
const configPromises = configStores.map(({ key, scraper }) =>
  scrapeWithFallback(key, query, scraper)
);

return (await Promise.all([...existingPromises, ...configPromises])).flat();
```

Las 6 tiendas hardcodeadas corren igual que antes. Las del config se suman.

## Acceptance Criteria

1. `scrapeWebsite(query)` en `route.ts` sigue funcionando sin cambios de firma.
2. Las 6 tiendas actuales retornan los mismos productos antes y después de FEAT-3 (test de regresión).
3. Agregar una 7ª tienda HTML-simple requiere únicamente añadir una entrada en `stores.config.json` — cero cambios de código.
4. Config inválida (JSON malformado o campos requeridos faltantes) lanza error descriptivo en startup, no en runtime.
5. `registry.getAllStores()` retorna `[]` si el archivo config no existe — sin romper el sistema.
6. El `displayName` de la tienda nueva llega correctamente al campo `from` del `Product`.
7. `stores.enum.ts` permanece estático — no se genera dinámicamente.

## Tasks

### T1 — Crear `src/stores/config/stores.config.json`

```json
{ "stores": [] }
```

### T2 — Crear `src/stores/parsers/cheerio.parser.ts`

```typescript
export function createCheerioScraper(config: StoreConfig): (query: string) => Promise<Product[]>
```

- Usa `config.selectors` para extraer `{ name, price, image, url, installment? }`
- `from` = `config.displayName`
- `brand` = `"Unknown"` (sin lógica custom)
- Manejo de precio: string → número (limpiar caracteres no numéricos)
- `image`: intentar `src` primero, fallback a `"https://placehold.co/300x200"`

### T3 — Crear `src/stores/loader.ts`

```typescript
export function loadStores(): StoreConfig[]  // lee y valida stores.config.json
```

- Si el archivo no existe → retorna `[]` (no lanzar error)
- Si el JSON es inválido o falta campo requerido → lanzar `Error` descriptivo
- Campos requeridos: `key`, `displayName`, `parser`, `url`, `selectors.container`, `selectors.name`, `selectors.price`

### T4 — Crear `src/stores/registry.ts`

```typescript
export function register(key: string, scraper: Scraper): void
export function getAllStores(): Array<{ key: string; scraper: Scraper }>
export function getStore(key: string): Scraper | null
```

- Inicializar registry en startup llamando `loadStores()` → `createCheerioScraper()` → `register()`

### T5 — Extender `scrapeWebsite()` en `scraper.ts`

Agregar los stores del registry como se muestra en la sección de integración. No modificar la lógica de los 6 scrapers existentes.

### T6 — Demo con 7ª tienda real

Agregar una tienda real en `stores.config.json` y verificar manualmente que devuelve productos. Documentar el resultado en este spec (ac. 3 verificado).

### T7 — Tests

```
✓ registry retorna [] si config vacío o archivo inexistente
✓ loader parsea config válido y retorna array de StoreConfig
✓ loader lanza Error con mensaje descriptivo si falta campo requerido
✓ cheerio.parser extrae productos correctamente con selectores de config
✓ scrapeWebsite() incluye productos de tiendas del registry
```

## Constraints

- Las 6 tiendas en `scraper.ts` **nunca se tocan** — FEAT-3 solo agrega, no migra.
- `stores.enum.ts` permanece estático — no se genera desde config.
- **No implementar hot-reload** — reiniciar el servidor es suficiente.
- Solo tiendas `parser: "cheerio"` en esta versión — `api` y `playwright` para futuras iteraciones.
- El registry no reemplaza `scrapers` en `scraper.ts`, lo complementa.

## Definition of Done

```bash
# 7ª tienda en config devuelve productos (demo manual)
# Tests pasan
npx jest src/stores/__tests__ --coverage
npx tsc --noEmit
```
