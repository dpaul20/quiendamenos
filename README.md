# Scraping Electrónica

Comparador de precios de productos electrónicos. Scrapea múltiples tiendas argentinas en paralelo y presenta resultados ordenados por precio.

## Tiendas soportadas

| Tienda | Método |
| --- | --- |
| Naldo | VTEX IS |
| OnCity | VTEX IS |
| Musimundo | Custom |
| Carrefour | VTEX |
| *(y otras)* | Playwright / Cheerio |

---

## Setup local

### 1. Requisitos

- Node.js 18+
- Docker (para Redis local)

### 2. Instalar dependencias

```bash
npm install
npx playwright install chromium
```

### 3. Variables de entorno

Copiá `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

**Para desarrollo local** el `.env.local` debe tener:

```env
NODE_ENV=development
REDIS_URL=127.0.0.1
REDIS_PORT=6379
# sin REDIS_PASSWORD — Redis local no usa auth
```

**Para producción** (Vercel + Upstash u otro Redis cloud) usá las credenciales reales, incluyendo `REDIS_PASSWORD`.

### 4. Levantar Redis local (Docker)

```bash
# Primera vez — crea el container
docker run -d --name redis-local -p 6379:6379 redis:alpine

# Sesiones siguientes — solo iniciarlo
docker start redis-local

# Detenerlo
docker stop redis-local
```

### 5. Correr el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Comandos útiles

### Desarrollo

```bash
npm run dev          # servidor Next.js
npm run build        # build de producción
npm run lint         # ESLint
npx tsc --noEmit     # chequeo de tipos
```

### Tests

```bash
npm test                        # todos los tests
npm test -- --watch             # modo watch
npm test -- --coverage          # con cobertura
```

### Redis — inspección de cache

```bash
# Ver todas las keys en cache
docker exec redis-local redis-cli KEYS "*"

# Ver el contenido de una key (resultado de búsqueda)
docker exec redis-local redis-cli GET "q:televisor"

# Ver cuántos segundos le quedan a una key
docker exec redis-local redis-cli TTL "q:televisor"

# Borrar una key específica (fuerza re-scrape en la próxima request)
docker exec redis-local redis-cli DEL "q:televisor"

# Borrar todo el cache
docker exec redis-local redis-cli FLUSHALL
```

---

## Arquitectura de cache

El sistema usa dos niveles de cache en Redis, optimizado para el free tier (~30 MB):

```text
Request GET /api/scrape?query=televisor
        │
        ▼
  getQueryCache("q:televisor")  ← TTL 1h
        │
   ┌────┴────┐
   │  HIT    │  MISS
   │         ▼
   │   scrapeWebsite()  ← scrapea las 7 tiendas en paralelo
   │         │
   │   setQueryCache()  ← guarda resultado completo, TTL 1h
   │   setStoreCacheNX() ← guarda por tienda, TTL 24h (NX: no sobreescribe)
   │
   ▼ (si stale: age > 45min)
scheduleRevalidation()  ← responde inmediato + revalida en background
```

**Keys:**

- `q:{query}` — resultado completo de la búsqueda (1h)
- `s:{store}:{query}` — resultado por tienda individual (24h)

**Stale-While-Revalidate:** cuando una key tiene más de 45 minutos (75% del TTL de 1h), se sirve el dato viejo inmediatamente y se dispara un re-scrape en background con `setImmediate`.

### Probar SWR localmente

Para forzar el path stale sin esperar 45 minutos, bajá temporalmente el ratio en `src/platform/cache/index.ts`:

```typescript
SWR_RATIO: 0.001, // cualquier entry será stale inmediatamente
```

Hacés dos requests seguidas al mismo endpoint → la segunda sirve desde cache e imprime en consola:

```text
[queue] SWR revalidation complete for query="televisor"
```

---

## API

### `GET /api/scrape?query={término}`

Busca productos en todas las tiendas.

**Parámetros:**

- `query` (requerido): término de búsqueda (ej: `televisor`, `heladera`)

**Respuesta exitosa (`200`):**

```json
[
  {
    "name": "Smart TV 55\"",
    "price": 450000,
    "url": "https://...",
    "image": "https://...",
    "store": "Naldo",
    "brand": "Samsung"
  }
]
```

**Errores:**

- `400` — falta el parámetro `query` o es inválido
- `500` — error interno al hacer scraping
