# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server (Next.js)
npm run build         # Production build
npm run lint          # ESLint (flat config)
npm test              # Jest unit tests
npm run test:coverage # Vitest with coverage (runs Storybook component tests)
npm run storybook     # Storybook dev server on :6006
```

Run a single Jest test file:
```bash
npm test -- src/platform/backoff/__tests__/backoff.test.ts
```

Node.js 20.x required (see `.nvmrc`).

## Architecture

**Electronics price comparison** for Argentine stores. Scrapes 6+ retailers in parallel, caches in Redis, serves via Next.js API.

### Request Flow

```
GET /api/scrape?query=iphone
  → proxy.ts (rate limiting + API key auth)
  → /api/scrape/route.ts (cache lookup → SWR dispatch)
  → price-search/service.ts (parallel scrapers)
    → price-search/router.ts (per-store: backoff → store cache → [])
      → scrapers/{store}/index.ts
```

### Key Layers

**`src/platform/`** — Infrastructure, no business logic:
- `cache/` — Two-level Redis cache with SWR (Stale-While-Revalidate)
- `backoff/` — Exponential backoff with jitter (4 retries: 2s→4s→8s→16s)
- `errors/` — HTTP status → retriable/non-retriable classification
- `redis/` — ioredis client with reconnect strategy
- `queue/` — Background revalidation via `setImmediate()`
- `vtex/` — Shared VTEX Intelligent Search helpers

**`src/features/price-search/`** — Domain logic:
- `service.ts` — Runs all scrapers in parallel, writes cache
- `router.ts` — Per-store fallback: try scraper → store cache → empty array
- `hooks/` — Zustand store for client-side state (results, filters, pagination)

**`src/scrapers/`** — One folder per store (naldo, oncity, carrefour, fravega, cetrogar, mercadolibre). VTEX stores use `createVtexScraper` factory from `platform/vtex`.

**`src/components/`** — React UI with Storybook stories. `ui/` contains shadcn/ui primitives.

**`src/proxy.ts`** — Next.js middleware: token-bucket rate limiting (10 req/min/IP), API key auth (prod only), security headers.

### Caching Strategy

Two-level Redis cache with SHA256-hashed, normalized query keys:
- **Primary** (`q:{hash}`) — 1h TTL, all stores combined
- **Store-level** (`s:{store}:{hash}`) — 24h TTL, per-store fallback

**SWR at 75% TTL (45min):** Returns stale data immediately and fires background revalidation via `queue/`. Revalidation is non-blocking (`setImmediate`).

### Testing Split

| Framework | Purpose | Config |
|-----------|---------|--------|
| Jest + ts-jest | Unit tests for platform/ and scrapers/ | `jest.config.js` |
| Vitest + Playwright | Storybook component tests + coverage | `vitest.config.ts` |

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `REDIS_URL` | Yes | `127.0.0.1` locally |
| `REDIS_PORT` | Yes | `6379` locally |
| `REDIS_PASSWORD` | Prod only | ioredis skips if absent |
| `API_SECRET_KEY` | Prod only | `x-api-key` header; middleware skips auth in dev |

Local Redis via Docker:
```bash
docker run -d --name redis-local -p 6379:6379 redis:alpine
```

## Non-Obvious Conventions

- **`src/proxy.ts`** is the Next.js middleware file (renamed from `middleware.ts` per Next.js 16 convention — do not rename back).
- **Scrapers register themselves** in `src/scrapers/index.ts` via hardcoded imports into the registry. Adding a new store requires both a scraper file and an entry there.
- **Error categorization in `platform/errors/`** determines retry behavior. HTTP 429 → `rate_limited`, 403 → `blocking`, 5xx → `server_error`, 404/unknown 4xx → non-retriable. Add new classifications there, not in individual scrapers.
- **Path alias `@/*` → `src/*`** configured in both `tsconfig.json` and `jest.config.js` (moduleNameMapper).
- **`AGENTS.md`** contains rules for AI agents using the Storybook MCP addon — read it before writing or modifying Storybook stories.
