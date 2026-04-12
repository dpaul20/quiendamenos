# Scraping Architecture

Guía para entender, mantener y extender el sistema de scraping.

---

## Flujo de requests

```
GET /api/scrape?query=TV
        │
        ▼
src/app/api/scrape/route.ts
        │  recibe query, llama scrapeWebsite()
        ▼
src/features/price-search/service.ts   ← orquestador principal
        │  combina HARDCODED_STORES + getAllStores() (registry config-driven)
        │  ejecuta todos en paralelo con Promise.all
        ▼
src/features/price-search/router.ts    ← capa de resiliencia
        │  exponentialBackoff() → si falla → cache fallback
        ▼
src/stores/<tienda>/index.ts           ← scraper de cada tienda
        │  retorna Product[]
        ▼
service.ts: batch-write Redis NX (fire-and-forget)
        │
        ▼
Response: Product[] (todas las tiendas aplanadas)
```

---

## Tiendas actuales

| Tienda | Tipo | URL base | Notas |
|---|---|---|---|
| Naldo | VTEX IS REST | `naldo.com.ar/_v/api/intelligent-search/product_search/v3` | — |
| OnCity | VTEX IS REST | `oncity.com/_v/api/intelligent-search/product_search/v3` | Filtro non-electronics |
| Carrefour | VTEX IS REST + fallback HTML | `carrefour.com.ar/_v/api/intelligent-search/product_search/v3` | Apollo cache como fallback |
| Cetrogar | Cheerio HTML | `cetrogar.com.ar/catalogsearch/result/?q={q}` | Magento selectors |
| Fravega | Cheerio HTML | `fravega.com/l/?keyword={q}` | `data-test-id` estables |
| MercadoLibre | Cheerio HTML | `listado.mercadolibre.com.ar/{q}` | `.poly-card` grid |
| Musimundo | API Braindw Elastic | `u.braindw.com/els/musimundoapi?ft={q}` | Sitio en mantenimiento frecuente |

---

## Tipos de scraper

### 1. VTEX Intelligent Search REST (Naldo, OnCity)

El más simple y estable. Llama directamente al endpoint de IS:

```
GET /{STORE-DOMAIN}/_v/api/intelligent-search/product_search/v3
  ?query=TV&count=20&from=0&to=19&locale=es-AR&hideUnavailableItems=true&workspace=master
```

Response: `{ products: vtexProduct[], recordsFiltered: number }`

El tipo `vtexProduct` está definido en `src/types/vtex-product.d.ts`.  
Los campos clave son:
- `product.productName` → nombre
- `product.priceRange.sellingPrice.lowPrice` → precio
- `product.items[0].images[0].imageUrl` → imagen
- `product.items[0].sellers[0].commertialOffer.Installments` → cuotas sin interés
- `product.brand` → marca
- `product.link` → path relativo del producto
- `product.categories[]` → jerarquía de categorías (útil para filtrar)

**Archivos relevantes:**
- `src/stores/naldo/index.ts` — implementación de referencia limpia
- `src/stores/oncity/index.ts` — igual a Naldo + `isElectronicsProduct()` filter

### 2. VTEX GraphQL (Carrefour)

Carrefour usa VTEX IO con GraphQL persistido. Tiene dos estrategias:
1. **Primaria**: API REST IS igual que Naldo pero en `carrefour.com.ar`
2. **Fallback**: Scraping del HTML de la página de categoría y extracción del Apollo cache embebido en `<script>` sin `src` que contiene `"productName":`

El helper `src/platform/vtex/carrefour.ts` construye la query GraphQL encodeada en base64 para el endpoint alternativo.

### 3. Cheerio HTML (Cetrogar, Fravega, MercadoLibre)

Axios + Cheerio. Fetch del HTML de la página de resultados de búsqueda, selección con CSS selectors.

Los tres stores hardcoded tienen su propio `index.ts`. Cualquier tienda nueva de este tipo **puede agregarse sin código** usando el sistema config-driven (ver sección siguiente).

**Limitación actual**: `brand` queda como `"Unknown"` porque los sitios HTML no exponen la marca de forma uniforme.

### 4. API Custom (Musimundo)

Braindw Elastic API. Response diferente al resto:

```json
{ "hits": { "hits": [ { "_source": { "Descripcion": ..., "Precio": ..., "UrlImagen": ... } } ] } }
```

Tipo definido en `src/types/musimundo.d.ts`.

---

## Cómo agregar una tienda nueva

### Opción A — VTEX IS (tienda nueva más simple)

1. Copiar `src/stores/naldo/index.ts` → `src/stores/<nombre>/index.ts`
2. Cambiar `BASE_URL`, el `StoreNamesEnum.*` y el dominio en `formatProduct*`
3. Agregar a enum: `src/enums/stores.enum.ts`
4. Exportar desde: `src/stores/index.ts` y agregar a `HARDCODED_STORES` en `src/features/price-search/service.ts`
5. Agregar logo: `public/stores/<nombre>.png`
6. Si la tienda tiene catálogo mixto (no sólo electro), agregar filtro `isElectronicsProduct()` como en OnCity

**Tiempo estimado: ~30 min**

### Opción B — Cheerio HTML (zero-code con config)

Editar `src/stores/config/stores.config.json` y agregar una entrada:

```json
{
  "stores": [
    {
      "key": "garbarino",
      "displayName": "Garbarino",
      "parser": "cheerio",
      "url": "https://www.garbarino.com/search?q={query}",
      "selectors": {
        "container": ".product-card",
        "name": ".product-name",
        "price": ".price-value",
        "image": "img.product-image",
        "url": "a.product-link",
        "installment": ".installment-info"
      }
    }
  ]
}
```

El `loader.ts` valida el JSON y el `cheerio.parser.ts` crea el scraper automáticamente. El store queda disponible en el endpoint sin ningún cambio de código.

**Tiempo estimado: ~15 min** (requiere inspeccionar el HTML del sitio para los selectores)

**Limitaciones del parser Cheerio genérico:**
- `brand` siempre queda como `"Unknown"` (sin lógica de extracción personalizada)
- No filtra categorías no-electrónicas
- Imágenes lazy-loaded (`data-src`) se resuelven, pero iframes/canvas no

### Opción C — API Custom (tienda con API propia)

1. Crear `src/stores/<nombre>/index.ts` con la función `scrape<Nombre>(query: string): Promise<Product[]>`
2. Mapear la response al tipo `Product` (ver `src/types/product.d.ts`)
3. Agregar al enum, `index.ts` y `service.ts` igual que Opción A

---

## Sistema de resiliencia

Cada scraper pasa por `scrapeWithFallback()` en `src/features/price-search/router.ts`:

```
scraper(query)
    │ éxito
    └─── retorna Product[]
    │ error (rate-limit, timeout, block)
    ▼
exponentialBackoff() — 2s → 4s → 8s → 16s → 32s → 64s (con jitter)
    │ aún falla
    ▼
getCachedData(cacheKey.store(store, query)) — Redis fallback 24h
    │ sin cache
    ▼
retorna []
```

Implementación: `src/platform/backoff/index.ts`  
Error types: `src/platform/errors/` (definidos pero no conectados al backoff todavía — ver Deuda técnica)

---

## Cache

`src/platform/cache/index.ts` — Redis vía `ioredis`

```
cacheKey.store("naldo", "tv")  →  "store:naldo:tv"
cacheKey.query("tv")           →  "query:tv"       ← cache full-response (1h)
```

- **Cache de query completa**: 1h TTL en `/api/scrape/route.ts` antes de arrancar scrapers
- **Cache por tienda** (`SET NX`): 24h TTL, se escribe sólo si no existe. Sirve de fallback cuando el scraper falla

---

## Estructura de directorios

```
src/
  stores/                     ← scrapers de tienda
    <nombre>/
      index.ts                ← función scrape<Nombre>()
    config/
      stores.config.json      ← config-driven (Cheerio)
    parsers/
      cheerio.parser.ts       ← factory para stores config-driven
    loader.ts                 ← lee y valida stores.config.json
    registry.ts               ← Map<key, Scraper> para stores config-driven
    index.ts                  ← exporta scrapers hardcoded
  platform/                   ← infraestructura reutilizable
    vtex/
      helpers.ts              ← encode helpers para VTEX GraphQL
      carrefour.ts            ← query builder específico de Carrefour
    backoff/                  ← exponential backoff + jitter
    cache/                    ← Redis get/set/pipeline
    browser/                  ← Playwright singleton (no usado en prod aún)
    errors/                   ← ErrorType enum + categorizer
    queue/                    ← Bull queue
    redis/                    ← cliente ioredis
  features/
    price-search/
      service.ts              ← orquestador: combina stores, llama router, escribe cache
      router.ts               ← backoff + cache fallback wrapper
  types/
    product.d.ts              ← Product (shape de salida)
    vtex-product.d.ts         ← vtexProduct (shape de VTEX IS)
    musimundo.d.ts            ← shape de Braindw Elastic
```

---

## Deuda técnica y roadmap

### Deuda existente (prioridad alta)

| Problema | Impacto | Fix sugerido |
|---|---|---|
| `formatProduct*` + `buildUrl*` duplicados en Naldo/OnCity/Carrefour | Mantener 3 copies del mismo código | Extraer `formatVtexProduct(store, domain)` + `buildVtexUrl(domain)` a `src/platform/vtex/index.ts` |
| `ErrorType` enum definido pero no usado en backoff | Errores de rate-limit y errores de red se tratan igual | Conectar `error-categorizer.ts` al backoff: si es `RATE_LIMITED` esperar más, si es `NOT_FOUND` no reintentar |
| Solo OnCity filtra no-electrónica | Naldo y Carrefour pueden devolver artículos de supermercado | Agregar `isElectronicsProduct()` a todos los scrapers VTEX o hacer el filtro configurable en `StoreConfig` |
| `brand: "Unknown"` en todos los Cheerio scraper | Filtro de marcas no funciona para esas tiendas | Agregar selector `brand` opcional en `StoreSelectors` |

### Roadmap (prioridad baja / futura)

- **Browser pooling**: `src/platform/browser/` existe pero Playwright no se usa en producción. Útil para sitios JS-heavy como posibles tiendas futuras (Frávega mobile, Apple Store, etc.)
- **Unificar los dos sistemas**: `scrapers` (hardcoded) + `registry` (config) podrían coexistir, pero idealmente todos los Cheerio stores migran a config y los VTEX tienen un factory genérico
- **Métricas**: agregar contador de intentos/fallas por tienda para detectar tiendas caídas automáticamente
- **Tests de integración**: los tests actuales son unitarios; agregar un test de humo por tienda con fixture de response

---

## Variables de entorno (scraping)

```env
REDIS_URL=127.0.0.1          # host Redis
REDIS_PORT=6379              # puerto Redis
REDIS_PASSWORD=              # vacío en local, requerido en prod
```

Ver `README.md` para setup local completo con Docker.
