# quiendamenos

Comparador de precios de electrónica para tiendas argentinas. Scrapea en paralelo Frávega, Cetrogar, Naldo, Carrefour, OnCity y MercadoLibre, cachea en Redis y sirve los resultados vía Next.js.

## Tiendas soportadas

| Tienda | Método |
|--------|--------|
| Frávega | VTEX IS |
| Cetrogar | VTEX IS |
| Naldo | VTEX IS |
| OnCity | VTEX IS |
| Carrefour | VTEX IS |
| MercadoLibre | API propia |

---

## Setup local

### Requisitos

- Node.js 20.x (ver `.nvmrc`)
- Docker (para Redis local)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

`.env.local` mínimo para desarrollo:

```env
REDIS_URL=127.0.0.1
REDIS_PORT=6379
```

### 3. Levantar Redis

```bash
# Primera vez
docker run -d --name redis-local -p 6379:6379 redis:alpine

# Sesiones siguientes
docker start redis-local
```

### 4. Correr el servidor

```bash
npm run dev   # http://localhost:3000
```

---

## Comandos

```bash
npm run dev           # Dev server
npm run build         # Build de producción
npm run lint          # ESLint
npm test              # Tests unitarios (Jest)
npm run test:coverage # Tests de componentes con coverage (Vitest + Storybook)
npm run storybook     # Storybook en :6006
```

Correr un test específico:

```bash
npm test -- src/platform/backoff/__tests__/backoff.test.ts
```

### Inspección de cache Redis

```bash
docker exec redis-local redis-cli KEYS "*"           # todas las keys
docker exec redis-local redis-cli TTL "q:televisor"  # segundos restantes
docker exec redis-local redis-cli DEL "q:televisor"  # forzar re-scrape
docker exec redis-local redis-cli FLUSHALL           # borrar todo el cache
```

---

## Arquitectura

```
GET /api/scrape?query=iphone
  → proxy.ts (rate limiting + API key auth)
  → /api/scrape/route.ts (cache lookup → SWR dispatch)
  → price-search/service.ts (scrapers en paralelo)
    → price-search/router.ts (backoff → store cache → [])
      → scrapers/{store}/index.ts
```

### Capas principales

| Capa | Ruta | Responsabilidad |
|------|------|-----------------|
| Middleware | `src/proxy.ts` | Rate limiting (10 req/min/IP), API key auth, security headers |
| Infraestructura | `src/platform/` | Cache Redis, backoff exponencial, clasificación de errores, queue |
| Dominio | `src/features/price-search/` | Orquestación de scrapers, estado cliente (Zustand) |
| Scrapers | `src/scrapers/` | Un folder por tienda |
| UI | `src/components/` | React + shadcn/ui + Storybook |

### Caché Redis (dos niveles)

- **`q:{hash}`** — resultado combinado de todas las tiendas, TTL 1h
- **`s:{store}:{hash}`** — resultado por tienda individual, TTL 24h

**SWR al 75% del TTL (45 min):** devuelve datos stale inmediatamente y revalida en background via `src/platform/queue/`.

### Agregar una tienda nueva

1. Crear `src/scrapers/{nombre}/index.ts` exportando `scrape{Nombre}(query: string): Promise<Product[]>`
2. Registrarla en `src/scrapers/index.ts`
3. Agregar el valor en `src/enums/stores.enum.ts`

Las tiendas con VTEX Intelligent Search usan el factory:

```typescript
import { createVtexScraper } from "@/platform/vtex/helpers";
export const scrapeNombre = createVtexScraper("https://www.tienda.com.ar", StoreNamesEnum.NOMBRE);
```

---

## Variables de entorno

| Variable | Entorno | Descripción |
|----------|---------|-------------|
| `REDIS_URL` | Local + Prod | Host de Redis (`127.0.0.1` local) |
| `REDIS_PORT` | Local + Prod | Puerto de Redis (`6379` local) |
| `REDIS_PASSWORD` | Solo prod | Omitir en local |
| `API_SECRET_KEY` | Solo prod | Se requiere el header `x-api-key` en prod; en dev se omite |
| `RESEND_API_KEY` | Solo prod | API key de [Resend](https://resend.com) para alertas por email |
| `ALERT_EMAIL` | Solo prod | Email destino de las alertas de scrapers caídos |

> `CRON_SECRET` y `VERCEL_PROJECT_PRODUCTION_URL` los genera Vercel automáticamente.

---

## Monitoring en producción

Un Vercel Cron Job corre cada 10 minutos y ejecuta `/api/health-check`, que:

1. Llama a `/api/health` — prueba cada scraper con la query `"smart tv"` (timeout 8s)
2. Si alguno falla o se degrada → manda un email con el detalle

```
Vercel Cron (*/10 * * * *)
  → GET /api/health-check
    → GET /api/health
      → status !== "ok" → email a ALERT_EMAIL vía Resend
```

### Endpoints de health

| Endpoint | Descripción | Auth |
|----------|-------------|------|
| `GET /api/health` | Estado de cada scraper en tiempo real | Pública |
| `GET /api/health-check` | Cron: evalúa y notifica | `CRON_SECRET` (Vercel automático) |

Ejemplo de respuesta de `/api/health`:

```json
{
  "status": "degraded",
  "stores": {
    "fravega":  { "status": "ok",   "latency": 823,  "count": 12 },
    "cetrogar": { "status": "down", "latency": 8001, "count": 0, "error": "timeout" }
  },
  "timestamp": "2026-04-20T14:30:00.000Z"
}
```

### Setup en Vercel (una sola vez)

**1.** Crear cuenta en [resend.com](https://resend.com) → API Keys → Create → copiar la key

**2.** En Vercel → quiendamenos → **Settings → Environment Variables**, agregar:

| Variable | Valor |
|----------|-------|
| `RESEND_API_KEY` | La key de Resend |
| `ALERT_EMAIL` | Tu email |

**3.** Hacer deploy — el cron se activa automáticamente al leer `vercel.json`.

---

## Tests

| Framework | Qué testea | Config |
|-----------|------------|--------|
| Jest + ts-jest | `platform/` y `scrapers/` | `jest.config.js` |
| Vitest + Playwright | Storybook component tests + coverage | `vitest.config.ts` |

---

## Convenciones no obvias

- **`src/proxy.ts`** es el archivo de middleware de Next.js. No renombrar a `middleware.ts` — convención de Next.js 16.
- **Los scrapers se auto-registran** en `src/scrapers/index.ts`. Agregar una tienda nueva requiere entrada ahí.
- **La clasificación de errores HTTP** en `src/platform/errors/` determina si una falla se reintenta o no. Agregar nuevas clasificaciones ahí, no en los scrapers.
- **Path alias `@/*` → `src/*`** configurado en `tsconfig.json` y `jest.config.js` (moduleNameMapper).
