---
title: "Epic: Mejorar Arquitectura de Scraping"
status: in-progress
features: [FEAT-1, FEAT-2, FEAT-3, FEAT-4]
---

## Goal

Pasar de 6 scrapers hardcodeados y sin retry a una arquitectura resiliente y extensible donde:

- Los fallos se reintenten y degraden a caché (no retornan `[]` silenciosamente)
- Nuevas tiendas tipo Cheerio/HTML se pueden agregar sin modificar código existente

---

## Estado real del codebase (Abril 2026)

| Store | Implementación actual | Tipo | Necesita Playwright? |
|-------|-----------------------|------|----------------------|
| cetrogar | Axios + Cheerio (HTML estático) | HTML | No |
| fravega | Axios + Cheerio (SSR) | HTML | No |
| mercadolibre | Axios + Cheerio (SSR) | HTML | No |
| naldo | VTEX GraphQL API | API | No |
| carrefour | VTEX GraphQL API | API | No |
| musimundo | braindw API (`u.braindw.com`) | API | No |

> Ninguna tienda actual requiere Playwright. El código de FEAT-1 existe pero no está integrado
> en `scraper.ts`. Playwright está disponible como herramienta para tiendas **futuras** que sí lo necesiten.

---

## Features

| # | Spec | Estado | Prioridad | Descripción |
|---|------|--------|-----------|-------------|
| FEAT-1 | [FEAT-1.spec.md](FEAT-1.spec.md) | implementado | P0 | Playwright adapter + backoff (verificar tests antes de FEAT-2) |
| FEAT-2 | [FEAT-2.spec.md](FEAT-2.spec.md) | not-started | P0 | Retry + degradación a caché en `scrapeWebsite()` |
| FEAT-3 | [FEAT-3.spec.md](FEAT-3.spec.md) | not-started | P1 | Config-driven para tiendas **nuevas** (sin migrar las 6 existentes) |
| FEAT-4 | [FEAT-4.spec.md](FEAT-4.spec.md) | not-started | P2 (opcional) | Browser pool — implementar solo si hay presión de memoria real |

**Orden de implementación**: FEAT-1 verificar → FEAT-2 → FEAT-3 → FEAT-4 (si aplica)

---

## Constraints (invariantes del sistema)

- `scrapeWebsite(query): Promise<Product[]>` — firma pública, **nunca cambiar**
- `src/app/api/scrape/route.ts` — **nunca tocar**
- `src/lib/cache.ts` — solo consumir, no modificar
- Las 6 tiendas existentes deben retornar los mismos productos antes y después de cualquier cambio
- FEAT-4 solo si: RAM >700MB sostenido, >10 req Playwright/min, o >5% timeout rate

---

## Definition of Done del Epic

- [ ] FEAT-1: tests pasan con cobertura ≥85%
- [ ] FEAT-2: `scrapeWebsite()` usa retry + cache fallback, 0 fallos silenciosos
- [ ] FEAT-3: 7ª tienda agregada via `stores.config.json` sin tocar código
- [ ] `npx tsc --noEmit` sin errores
- [ ] Zero breaking changes en la API pública
