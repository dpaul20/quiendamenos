# 🛠️ Guía de Implementación - Mejores Prácticas

## Recomendaciones para Ejecución Exitosa

Este documento contiene recomendaciones de mejores prácticas basadas en la investigación completa.

---

## ✅ Pre-Implementación (Antes de Día 1)

### Checklist de Setup

- [ ] **Node.js 20+** instalado y verificado
  ```powershell
  node --version  # debe ser v20+
  ```

- [ ] **Repository limpio**
  ```powershell
  git status  # no debe haber cambios sin commit
  git pull origin master  # branch principal actualizado
  ```

- [ ] **Dependencies actualizadas**
  ```powershell
  npm install  # instaladas
  npm outdated | less  # revisar versions
  ```

- [ ] **GitHub issues creadas** (del checklist)
  - Epic #1 creado
  - Todas 15+ issues en Sprint 1-3
  - Milestone v2.0.0 creado

- [ ] **GitHub project board configurado**
  - Columns: Backlog, Ready, In Progress, Review, Done
  - Custom fields: Priority, Value, Phase, Estimate
  - Todas las issues agregadas

- [ ] **Team aligned**
  - Backend engineer asignado
  - QA engineer identificado (si aplica)
  - Daily standups scheduled

---

## 📅 Por Sprint - Recomendaciones Específicas

### SPRINT 1: Playwright + Exponential Backoff (Days 1-3)

#### Approach Recomendado

```typescript
// Estructura sugerida
src/lib/
├── playwright-adapter.ts      // NEW
│   ├── PlaywrightScraper class
│   ├── Launch browser
│   ├── Handle JS rendering
│   └── Clean shutdown
├── backoff-strategy.ts         // NEW
│   ├── ExponentialBackoff class
│   ├── Delay calculation
│   ├── Jitter implementation
│   └── Retry loop
└── error-categorizer.ts        // NEW (puede ir aquí o esperar FEAT-2)
    ├── Detect JS required
    ├── Detect rate limiting
    └── Categorize network errors
```

#### Key Decisions

**Decision 1: Playwright vs Puppeteer?**
- ✅ **Recommend: Playwright**
- Why: Microsoft-backed, multi-browser, same cost (free)
- Puppeteer also works but slightly heavier

**Decision 2: Browser launch strategy?**
- ✅ **Recommend: Launch per request (simple)**
- Con: ~2-3 seconds overhead per request
- Benefit: No memory leaks, fresh state each time
- (FEAT-4 can implement pooling later)

**Decision 3: Error detection timing?**
- ✅ **Recommend: 2 second timeout**
- Why: Enough for JS to render, catches JS requirement
- Configurable per-store in future (FEAT-3)

#### Testing Strategy

```typescript
// Minimal test example
describe('PlaywrightAdapter', () => {
  it('should launch and close browser', async () => {
    const adapter = new PlaywrightAdapter();
    const browser = await adapter.launch();
    expect(browser).toBeDefined();
    await browser.close();
  });

  it('should scrape simple HTML page', async () => {
    const adapter = new PlaywrightAdapter();
    const html = await adapter.scrape('https://example.com');
    expect(html).toContain('html');
  });
});

describe('ExponentialBackoff', () => {
  it('should generate correct delay sequence', () => {
    const backoff = new ExponentialBackoff();
    const delays = [
      backoff.getDelay(1),
      backoff.getDelay(2),
      backoff.getDelay(3),
      backoff.getDelay(4),
    ];
    expect(delays[0]).toBeCloseTo(2000, -2); // 2s ± 100ms
    expect(delays[1]).toBeCloseTo(4000, -2); // 4s ± 100ms
    expect(delays[2]).toBeCloseTo(8000, -2); // 8s ± 100ms
  });
});
```

#### Files to NOT touch yet

❌ `stores.enum.ts` - No changes yet  
❌ `scraper.ts` - Keep existing logic  
❌ Test actual stores - Only Musimundo for validation

---

### SPRINT 2: Fallback Router (Days 4-5)

#### Approach Recomendado

```typescript
// Estructura sugerida
src/lib/
├── router-strategy.ts          // NEW
│   ├── Router class
│   ├── selectAdapter() logic
│   └── Adapter selection rules
└── error-categorizer.ts        // MOVE/COMPLETE from FEAT-1
    ├── categorizeError()
    ├── should429BeRetried()
    └── is403Blocking()
```

#### Router Logic (Pseudo-code)

```typescript
async function scrapeWithFallback(store, url) {
  // Try 1: Cheerio (fast, no overhead)
  try {
    return await cheerioScraper.scrape(url);
  } catch (error) {
    const category = categorizeError(error);
    
    // Try 2: Playwright (for JS sites)
    if (category === 'JS_REQUIRED') {
      try {
        return await playwrightScraper.scrape(url);
      } catch (error2) {
        // Try 3: Cache fallback
        return await cache.get(store);
      }
    }
    
    // Try 2: Backoff then retry (for rate limiting)
    if (category === 'RATE_LIMITED') {
      const delay = getRetryDelay(attemptNumber);
      await sleep(delay);
      return scrapeWithFallback(store, url); // recursive
    }
    
    // Default: Use cache
    return await cache.get(store);
  }
}
```

#### Testing Strategy

```typescript
describe('FallbackRouter', () => {
  it('should use Cheerio for static sites', async () => {
    const router = new Router();
    const result = await router.scrape('cetrogar');
    expect(result).toBeDefined();
  });

  it('should fallback to Playwright for JS sites', async () => {
    const router = new Router();
    const result = await router.scrape('musimundo');
    expect(result).toBeDefined();
  });

  it('should respect Retry-After header', async () => {
    // Mock server returning 429 with Retry-After
    const result = await router.scrape(mockUrl429);
    // Verify it waited and retried
  });
});
```

#### Key Points

- **Cheerio should succeed 95%+ of the time** for static sites
- **Playwright should succeed 85%+ of the time** for JS sites
- **Cache fallback** is last resort, not primary strategy
- **Logging is critical** - log which adapter was used per request

#### Integration Point

This is where you connect FEAT-1 with existing code:

```typescript
// In src/app/api/scrape/route.ts

import { Router } from '@/lib/router-strategy';

const router = new Router();

export async function POST(request: Request) {
  const { store, query } = await request.json();
  
  try {
    // NEW: Use router instead of direct scraper
    const products = await router.scrape(store, query);
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

### SPRINT 3: Configuration-Driven Architecture (Days 6-10)

#### Approach Recomendado

Este es el sprint **más importante** para escalabilidad. Estructura sugerida:

```typescript
src/
├── config/
│   └── stores.config.json        // NEW - Central store definitions
├── lib/
│   ├── parsers/                  // NEW FOLDER
│   │   ├── parser.interface.ts
│   │   ├── cheerio-parser.ts
│   │   ├── playwright-parser.ts
│   │   └── api-parser.ts
│   ├── formatters/               // NEW FOLDER
│   │   ├── generic-formatter.ts
│   │   └── post-processors.ts
│   ├── store-loader.ts           // NEW
│   ├── store-registry.ts         // NEW
│   └── scraper.ts                // REFACTOR (major changes)
└── types/
    ├── store-config.d.ts         // NEW
    └── parser.d.ts               // NEW
```

#### stores.config.json Structure

```json
{
  "version": "1.0",
  "stores": {
    "cetrogar": {
      "enabled": true,
      "name": "Cetrogar",
      "type": "static-html",
      "baseUrl": "https://www.cetrogar.com.ar",
      "parser": "cheerio",
      "selectors": {
        "products": ".product-item",
        "name": ".product-name",
        "price": ".product-price",
        "url": "a.product-link",
        "image": "img.product-image"
      },
      "formatter": "defaultFormatter",
      "pagination": {
        "type": "query-param",
        "key": "page"
      }
    },
    "musimundo": {
      "enabled": true,
      "name": "Musimundo",
      "type": "spa-javascript",
      "baseUrl": "https://www.musimundo.com.ar",
      "parser": "playwright",
      "selectors": {
        "products": "[data-test='product-card']",
        "name": "[data-test='product-name']",
        "price": "[data-test='product-price']",
        "url": "a[data-test='product-link']"
      },
      "formatter": "musimundoPostProcessor",
      "timeout": 5000
    },
    "carrefour": {
      "enabled": true,
      "type": "api",
      "baseUrl": "https://api.carrefour.com.ar",
      "parser": "api",
      "apiEndpoint": "/api/products",
      "formatter": "carrefourMapper"
    }
  }
}
```

#### Parser Interface

```typescript
// src/lib/parsers/parser.interface.ts

export interface IParser {
  name: string;
  canHandle(config: StoreConfig): boolean;
  parse(url: string, config: StoreConfig): Promise<RawProduct[]>;
}

// Implementations
export class CheerioPArser implements IParser {
  name = 'cheerio';
  
  canHandle(config: StoreConfig) {
    return config.type === 'static-html';
  }
  
  async parse(url: string, config: StoreConfig) {
    // Use existing cheerio logic
  }
}

export class PlaywrightParser implements IParser {
  name = 'playwright';
  
  canHandle(config: StoreConfig) {
    return config.type === 'spa-javascript';
  }
  
  async parse(url: string, config: StoreConfig) {
    // Use FEAT-1 playwright logic
  }
}

export class APIParser implements IParser {
  name = 'api';
  
  canHandle(config: StoreConfig) {
    return config.type === 'api';
  }
  
  async parse(url: string, config: StoreConfig) {
    // Direct API calls
  }
}
```

#### Generic Formatter

```typescript
// src/lib/formatters/generic-formatter.ts

export function genericFormatter(
  rawData: RawProduct[],
  config: StoreFormatterConfig
): Product[] {
  return rawData.map(raw => {
    const product: Product = {};
    
    // Apply field mappings
    Object.entries(config.fieldMappings).forEach(([field, selector]) => {
      product[field] = extractField(raw, selector);
    });
    
    // Apply post-processing if needed
    if (config.postProcess) {
      product = config.postProcess(product);
    }
    
    return product;
  });
}

// Usage
const cetrogarProducts = genericFormatter(rawProducts, {
  fieldMappings: {
    name: '.product-name',
    price: '.price-value',
    url: 'a.link',
    image: 'img.thumbnail'
  }
});
```

#### Store Loader & Registry

```typescript
// src/lib/store-registry.ts

export class StoreRegistry {
  private stores: Map<string, StoreConfig> = new Map();
  private parsers: Map<string, IParser> = new Map();
  
  async loadStores(configPath: string) {
    const config = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(config);
    
    // Validate
    validateStoreConfig(parsed);
    
    // Register each store
    Object.entries(parsed.stores).forEach(([key, store]) => {
      this.stores.set(key, store);
    });
  }
  
  getStore(name: string): StoreConfig {
    return this.stores.get(name);
  }
  
  getParser(config: StoreConfig): IParser {
    // Auto-select parser based on config.type
    const parser = this.parsers.get(config.parser);
    if (!parser) throw new Error(`Parser ${config.parser} not found`);
    return parser;
  }
}
```

#### Testing Strategy

```typescript
describe('GenericFormatter', () => {
  it('should apply field mappings correctly', () => {
    const raw = { name_elem: 'Product', price_elem: '100' };
    const result = genericFormatter([raw], {
      fieldMappings: {
        name: 'name_elem',
        price: 'price_elem'
      }
    });
    expect(result[0].name).toBe('Product');
    expect(result[0].price).toBe('100');
  });
});

describe('StoreRegistry', () => {
  it('should load all stores from config', async () => {
    const registry = new StoreRegistry();
    await registry.loadStores('src/config/stores.config.json');
    expect(registry.getStore('cetrogar')).toBeDefined();
  });
});
```

#### Migration Plan (Key for FEAT-3 Success)

Migración de 6 tiendas existentes a config-driven:

1. **Day 6**: Setup config system + create stores.config.json
2. **Day 7**: Migrate Cetrogar (simple, test template)
3. **Day 8**: Migrate Fravega, Naldo, Carrefour (similar structure)
4. **Day 9**: Migrate Musimundo (post-processing special case)
5. **Day 10**: Migrate MercadoLibre (any special handling)

**Critical**: Each migration debe pasar tests idénticos a before:
- Same success rate
- Same performance
- Same products returned

**Validation**:
```typescript
// Compare results before/after
const before = await oldScraper.scrape('cetrogar');
const after = await newScraper.scrape('cetrogar');
expect(before.length).toBe(after.length);
expect(before[0].name).toBe(after[0].name);
```

---

### SPRINT 4: Browser Pooling (OPTIONAL - Days 8-10)

#### Solo SI es necesario

```typescript
// src/lib/browser-pool.ts

export class BrowserPool {
  private pool: Browser[] = [];
  private queue: (() => Promise<void>)[] = [];
  private maxSize = 10;
  
  async acquire(): Promise<Browser> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return await this.createBrowser();
  }
  
  async release(browser: Browser) {
    if (this.pool.length < this.maxSize) {
      this.pool.push(browser);
    } else {
      await browser.close();
    }
  }
  
  private async createBrowser(): Promise<Browser> {
    return await chromium.launch({ headless: true });
  }
}
```

**Only implement if:**
- ✅ Memory per browser > 200MB in FEAT-3
- ✅ OR system RAM becomes constraint
- ✅ OR concurrent request volume is high

**Otherwise**: Single browser launch per request is fine

---

## 🔍 Testing Strategy General

### Levels de Testing

1. **Unit Tests** (cada feature)
   - Test individual functions
   - Mock external dependencies
   - Target: >80% coverage

2. **Integration Tests** (entre features)
   - Test router with different adapters
   - Test formatters with real selectors
   - Test with real store data

3. **E2E Tests** (full scrape)
   - Test actual stores
   - Validate product structure
   - Target: All 6 stores + 1 new store (FEAT-3 demo)

### Example Test Structure

```typescript
// Unit test example
describe('ExponentialBackoff', () => {
  let backoff: ExponentialBackoff;
  
  beforeEach(() => {
    backoff = new ExponentialBackoff();
  });
  
  it('should generate correct delays', () => {
    const delay1 = backoff.getDelay(1);
    const delay2 = backoff.getDelay(2);
    expect(delay2).toBeGreaterThan(delay1);
  });
});

// Integration test example
describe('FallbackRouter with all stores', () => {
  it('should scrape Cetrogar with Cheerio', async () => {
    const result = await router.scrape('cetrogar', 'tv');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBeDefined();
  });
  
  it('should scrape Musimundo with Playwright', async () => {
    const result = await router.scrape('musimundo', 'tv');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].price).toBeDefined();
  });
});

// E2E test example
describe('E2E: Add new store (FEAT-3 validation)', () => {
  it('should add new store to config and scrape', async () => {
    // 1. Add entry to stores.config.json
    const newStore = {
      name: 'NewStore7',
      type: 'static-html',
      selectors: { ... }
    };
    
    // 2. Reload registry
    await registry.reloadStores();
    
    // 3. Scrape new store
    const result = await router.scrape('newstore7', 'tv');
    
    // 4. Validate
    expect(result.length).toBeGreaterThan(0);
  });
});
```

---

## 📊 Monitoring & Metrics

### Logs a Implementar

```typescript
// Log template
logger.info('Scrape started', {
  store: 'musimundo',
  query: 'tv',
  adapter: 'playwright',
  timestamp: new Date().toISOString()
});

logger.info('Scrape completed', {
  store: 'musimundo',
  products: 15,
  duration: 3245, // ms
  adapter: 'playwright'
});

logger.error('Scrape failed', {
  store: 'musimundo',
  error: 'JavaScript timeout',
  adapter: 'playwright',
  attempt: 2,
  nextDelay: 4000 // ms
});
```

### Métricas por Sprint

| Sprint | Key Metric | Target |
|--------|-----------|--------|
| 1 | Musimundo success rate | 85%+ |
| 2 | All 6 stores success rate | 85%+ |
| 3 | Config reload works | 100% |
| 3 | Add store in 30 min | Demo ✓ |
| 4 | Mem per browser | <200MB |

---

## 🚨 Common Pitfalls & How to Avoid

### Pitfall 1: Playwright Memory Leak
**Problem**: Browser instances not closing  
**Solution**: 
```typescript
// Always use try-finally
try {
  const browser = await playwright.chromium.launch();
  // use browser
} finally {
  await browser.close();
}
```

### Pitfall 2: Infinite Retry Loop
**Problem**: Backoff retries forever  
**Solution**: Enforce max attempts
```typescript
const MAX_ATTEMPTS = 4;
if (attemptNumber > MAX_ATTEMPTS) {
  return cache.get(store);
}
```

### Pitfall 3: Config Validation Fails Late
**Problem**: Bad config crashes production  
**Solution**: Validate at load time
```typescript
async function loadConfig() {
  const config = await fs.readFile('stores.config.json');
  const parsed = JSON.parse(config);
  validateStoreConfig(parsed); // throw if invalid
  return parsed;
}
```

### Pitfall 4: Breaking Changes to API
**Problem**: Users' existing calls break  
**Solution**: Keep old endpoint working
```typescript
// Old endpoint still works
app.get('/api/scrape', (req, res) => {
  // Internally uses new router
});
```

### Pitfall 5: No Rollback Plan
**Problem**: Can't revert if FEAT-3 breaks  
**Solution**: Keep stores.enum.ts as backup
```typescript
// If stores.config.json breaks, can fall back to:
if (!configAvailable) {
  return loadFromEnum(); // old backup
}
```

---

## 🎓 Best Practices by Phase

### FASE 1: Playwright + Backoff
- ✅ Keep it simple - just basic retry logic
- ✅ Test only with Musimundo first
- ✅ Don't optimize yet - just get working
- ✅ Log all retry attempts with metadata

### FASE 2: Fallback Router
- ✅ Keep it simple - just basic routing
- ✅ Test with all 6 existing stores
- ✅ Verify success rates aren't regressed
- ✅ Don't refactor scraper.ts yet

### FASE 3: Configuration-Driven
- ✅ This is the complex phase - go slow
- ✅ Validate config strictly
- ✅ Test each store migration thoroughly
- ✅ Demo adding 7th store on Day 10

### FASE 4: Browser Pooling (OPTIONAL)
- ✅ Only implement if needed
- ✅ Monitor memory before implementing
- ✅ Test thoroughly - pooling can be tricky

---

## 📋 Daily Standup Template

### Cada día, reportar:

```
Date: Day X / 10
Feature: FEAT-Y
Status: ✅ / 🟡 / 🔴

Completed today:
- [ ] ...

In progress:
- [ ] ...

Blockers:
- None / [ ] List of issues

Metrics:
- Stores passing: X/6
- Success rate: %
- Memory usage: MB
- Tests coverage: %

Tomorrow:
- [ ] Next task
```

---

## ✨ Conclusión

Esta guía cubre:
- ✅ Setup recomendado
- ✅ Approach por sprint
- ✅ Código de ejemplo
- ✅ Testing strategy
- ✅ Common pitfalls
- ✅ Best practices

**Clave del éxito**:
1. Keep it simple en cada fase
2. Test continuamente
3. Valida con datos reales
4. Comunica blockers temprano
5. Mantén documentación actualizada

---

**Created**: 2025-01-10  
**Last Updated**: 2025-01-10  
**Status**: ✅ Ready to Use
