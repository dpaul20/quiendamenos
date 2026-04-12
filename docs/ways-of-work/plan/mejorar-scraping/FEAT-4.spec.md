---
title: "FEAT-4: Browser Pooling & Performance"
status: not-started
stories: [US-401]
depends-on: [FEAT-3]
blocks: []
complexity: medium
risk: low          # opcional — el sistema funciona sin esto
priority: low      # implementar SOLO si los go/no-go signals se disparan
---

## Problem

Con FEAT-1, cada request a una tienda JS-rendered lanza un browser Chromium fresco
(~400–500MB RAM, ~2–3s startup). Si hay 3+ requests concurrentes a tiendas con Playwright,
el servidor puede exceder 1.5GB RAM.

> **Esta feature es opcional.** FEAT-1/2/3 ya logran el objetivo del Epic.
> Implementar solo si se observa presión real en producción.

## Go / No-Go

| Signal | Umbral | Acción |
|--------|--------|--------|
| RAM sostenida | >700MB | Implementar FEAT-4 |
| Requests Playwright/min | >10 | Implementar FEAT-4 |
| Timeout rate | >5% | Implementar FEAT-4 |
| Ninguno de los anteriores | — | No implementar |

## Context / Estado del codebase

### Archivos relevantes

| Archivo | Estado | Acción FEAT-4 |
|---------|--------|---------------|
| `src/lib/adapters/playwright-adapter.ts` | ✅ existe | Modificar para aceptar `browser` externo opcional |
| `src/lib/browser-pool.ts` | ❌ no existe | ✅ crear |
| `src/lib/__tests__/browser-pool.test.ts` | ❌ no existe | ✅ crear |

### Comportamiento actual (FEAT-1)

```typescript
// playwright-adapter.ts usa singleton: let browser: Browser | null = null
// initBrowser() lanza si browser es null
// Una página a la vez por contexto (pool de tamaño 1 implícito)
```

El singleton actual ya es un pool de tamaño 1. FEAT-4 lo extiende a N instancias.

### Baseline de performance

| Métrica | Sin pool (FEAT-1) | Con pool (FEAT-4 objetivo) |
|---------|------------------|-----------------------------|
| Startup por request | ~2-3s | <100ms (browser ya existe) |
| RAM por instancia | ~400-500MB | ~200MB (contexto liviano) |
| Requests concurrentes | 1-2 | 5-10 |

## Acceptance Criteria

1. `BrowserPool` mantiene entre `minSize` (default: 2) y `maxSize` (default: 5) instancias activas.
2. `pool.acquire()` devuelve una instancia disponible en <50ms si hay slot libre.
3. `pool.acquire()` espera (con timeout de 10s) si todas las instancias están ocupadas.
4. `pool.release(id)` marca la instancia como disponible sin cerrar el browser.
5. Cada request usa un `BrowserContext` aislado (no comparten cookies/storage).
6. `pool.shutdown()` cierra todos los browsers gracefully — llamado en `process.on('SIGTERM')`.
7. Si una instancia excede 300MB de heap, se recicla (close + new launch) en background.
8. `pool.metrics()` devuelve `{ size, available, waitQueue, avgMemoryMB }`.
9. `playwright-adapter.ts` acepta un `browser` opcional — si se provee, lo usa; si no, lanza uno propio (backward compatible).
10. Opt-in via env: `ENABLE_BROWSER_POOL=true`.

## Nuevo archivo: `src/lib/browser-pool.ts`

### API pública

```typescript
export interface PoolConfig {
  minSize?: number         // default: 2
  maxSize?: number         // default: 5
  acquireTimeout?: number  // ms, default: 10000
  recycleMemoryMB?: number // default: 300
}

export interface PoolMetrics {
  size: number
  available: number
  waitQueue: number
  avgMemoryMB: number
}

export class BrowserPool {
  constructor(config?: PoolConfig)
  async acquire(): Promise<{ id: string; browser: Browser }>
  release(id: string): void
  metrics(): PoolMetrics
  async shutdown(): Promise<void>
}
```

## Tasks

### T1 — Crear `src/lib/browser-pool.ts`
- Implementar `BrowserPool` con la API pública definida arriba
- Usar `chromium.launch()` de Playwright para cada instancia
- Implementar queue de espera con timeout para `acquire()`
- Monitorear heap via `process.memoryUsage()` o `browser.contexts()` length como proxy

### T2 — Modificar `playwright-adapter.ts`
- Agregar parámetro opcional `browser?: Browser` a `scrapeWithPlaywright(config, browser?)`
- Si `browser` se provee: usar `browser.newContext()` en lugar de lanzar uno nuevo
- Si no: comportamiento actual (singleton) — backward compatible

### T3 — Integración opt-in en `scraper.ts` (o `router-strategy.ts`)
```typescript
const pool = process.env.ENABLE_BROWSER_POOL === 'true' ? new BrowserPool() : null;
// pasar pool.acquire().browser a scrapeWithPlaywright cuando corresponda
```

### T4 — Tests
```
✓ pool inicializa con minSize instancias al arrancar
✓ acquire() retorna instancia disponible
✓ acquire() espera si pool está lleno
✓ acquire() lanza timeout error si espera supera acquireTimeout
✓ release() marca instancia como disponible
✓ shutdown() cierra todos los browsers
✓ playwright-adapter funciona igual con y sin browser externo
```

## Constraints

- NO implementar si los go/no-go signals no se cumplen.
- Opt-in únicamente — `ENABLE_BROWSER_POOL=false` por defecto.
- Backward compatible: `playwright-adapter.ts` debe funcionar igual sin pool.
- Pool size máximo: 10 instancias (más es contraproducente en un servidor single-process).

## Definition of Done

```bash
npx jest src/lib/__tests__/browser-pool.test.ts --coverage
npx tsc --noEmit
# ENABLE_BROWSER_POOL=true — smoke test con tienda JS-rendered
```
