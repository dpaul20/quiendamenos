<!-- markdownlint-disable-file -->

# Task Research Notes: Scraper Architecture Solutions Investigation

## Research Executed

### External Research Sources

#fetch:https://playwright.dev/docs/intro
- **JavaScript Rendering**: Free MIT-licensed open source, maintains Chromium, Firefox, WebKit
- **Browser Management**: Auto-downloads required binaries, manages browser lifecycle
- **Pricing**: 100% FREE - no API charges, no limits
- **Node.js**: Latest versions (20.x, 22.x, 24.x supported)
- **System Requirements**: Works on Windows, macOS, Linux

#fetch:https://pptr.dev/
- **JavaScript API**: High-level control over Chrome/Firefox via DevTools Protocol
- **Open Source**: Free to download and use
- **Lightweight Option**: puppeteer-core available to avoid re-downloading Chrome
- **Pricing**: 100% FREE - open source Google project
- **Usage**: 563k+ projects using Puppeteer

### Microsoft Research: Retry Strategies
- **Exponential Backoff**: Start with 2 seconds, double on each attempt, add jitter to avoid collisions
- **Max Retries**: 3-4 attempts recommended before giving up
- **Retry-After Headers**: Respect server-sent delays when present
- **Jitter Implementation**: Add random delay variation to prevent thundering herd
- **Best Practice**: Backoff formula: delay = Math.min(baseDelay * 2^attempt + jitter, maxDelay)

## Key Discoveries

### Free Tools Comparison Matrix

| Feature | Playwright | Puppeteer | Cheerio (Current) |
|---------|-----------|-----------|------------------|
| **Cost** | FREE | FREE | FREE |
| **JS Rendering** |  Yes |  Yes |  No |
| **License** | MIT | Apache 2.0 | MIT |
| **Maintained By** | Microsoft | Google | Community |
| **Multi-browser** |  Chromium, Firefox, WebKit |  Chromium, Firefox | N/A |
| **Setup** | npm install | npm install | Already have |
| **Browser Binary Size** | ~150MB | ~200MB | N/A |

### Problem Mapping to Free Solutions

| Problem | Solution | How it Works | Cost |
|---------|----------|-------------|------|
| JavaScript Rendering | Playwright | Actual browser, waits for JS execution | FREE |
| Rate Limiting (429) | Exponential Backoff | Smart delays between retries (2s4s8s) | FREE |
| IP Blocking (403) | Retry with delays | Most blocks release in seconds | FREE |
| CSS Changes | Cheerio fallback + config | Keep HTML parser for simple sites | FREE |
| Static Sites | Cheerio (existing) | No browser overhead for simple HTML | FREE |

## Recommended Approach: 100% FREE SOLUTION

**Hybrid Architecture: Playwright + Exponential Backoff Retry + Adapter Pattern**

### Why This Approach (Zero Cost)

1.  **Playwright is 100% FREE** - Open-source MIT license (Microsoft maintained)
2.  **No proxy costs** - Resilience through smart retry logic instead  
3.  **Solves JavaScript rendering** - Built-in Chrome/Firefox headless support
4.  **Handles rate limiting** - Exponential backoff with jitter prevents blocking
5.  **Minimal refactoring** - Wrap in adapter, keep Cheerio as fallback
6.  **Already in your stack** - Next.js compatible (Node.js framework)

### Technology Stack (All Free)

| Component | Tool | Cost | Why |
|-----------|------|------|-----|
| **JS Rendering** | Playwright | FREE | MIT licensed, cross-browser, Microsoft-backed |
| **Retry Logic** | Exponential Backoff | FREE | Built-in, custom implementation ~50 lines |
| **Browser Automation** | Chromium (via Playwright) | FREE | Auto-downloaded, no additional cost |
| **Fallback Parsing** | Cheerio (existing) | FREE | Already in project |
| **Architecture** | Adapter Pattern | FREE | Design pattern, no tools needed |

### Implementation Phases

**Phase 1: Add Playwright + Exponential Backoff (Days 1-3)**
- Install playwright package (npm install playwright)
- Create PlaywrightAdapter with exponential backoff retry logic
- Implement error detection (JS required vs network error vs blocking)
- Test with 1 problematic store (Musimundo)
- Cost: 0 hours infrastructure setup, minimal RAM increase (~400MB per browser)

**Phase 2: Fallback Router Strategy (Days 4-5)**
- Implement router: Cheerio  Playwright  Cached fallback
- Error categorization:
  - No content  JavaScript required  use Playwright
  - 403/429  Rate limited  retry with exponential backoff (2s, 4s, 8s, max 3 attempts)
  - Network timeout  temporary issue  exponential backoff
- Respect Retry-After headers when present

**Phase 3: Full Abstraction Layer (Days 6-7)**
- Refactor scraper.ts to support strategy pattern
- Make selectors configuration-driven (JSON file per store)
- Add monitoring/metrics (which adapter was used, retry counts, timing)
- Graceful degradation: if Playwright fails, use Cheerio, if both fail use cache

**Phase 4: Browser Pooling & Optimization (Days 8-10, Optional)**
- Implement browser pool (5-10 instances) to handle concurrent requests
- Reuse browser context instead of creating new one per request
- Monitor memory usage (each browser ~100-200MB)
- Add headless mode optimization flags

### Retry Strategy Details (Industry Standard)

Exponential Backoff Implementation:
- Initial delay: 2 seconds
- Multiplier: 2x per attempt
- Jitter: Add random 0-1s to avoid thundering herd
- Max attempts: 4 retries
- Max delay: 64 seconds

Retry sequence:
- Attempt 1 failure  wait ~2 seconds  retry
- Attempt 2 failure  wait ~4 seconds  retry
- Attempt 3 failure  wait ~8 seconds  retry
- Attempt 4 failure  wait ~16 seconds  retry
- Attempt 5 failure  give up, use cache

### Resource Requirements

| Resource | Current | Added | Total | Notes |
|----------|---------|-------|-------|-------|
| **RAM** | ~300MB | 400-500MB | ~800MB | Browser instances + overhead |
| **CPU** | Moderate | +20-30% | Moderate+ | Parallel browser execution |
| **Disk** | ~50MB | ~150MB | ~200MB | Chromium binaries (cached) |
| **Monthly Cost** | \ | \ | **\** |  Completely free |

### Success Criteria
- All 6 stores scraping successfully (no 403/429 errors via smart retries)
- JavaScript-rendered content parsed correctly (Playwright handles React/Vue/Angular)
- Fallback system working (Cheerio for simple sites, Playwright for complex)
- Smart retry preventing rate limiting (exponential backoff with jitter)
- Memory footprint acceptable for hosting (< 1GB total)
- No external API dependencies
- **ZERO monthly recurring costs**

### Why NOT Proxy Services (Even Though Popular)

| Aspect | Reason |
|--------|--------|
| **Monthly Cost** | \-599/month adds up (you don't have budget) |
| **Vendor Lock-in** | If service changes terms/pricing, you're stuck |
| **Data Privacy** | Sends scraping data through third-party servers |
| **API Limits** | Credits can run out mid-operation |
| **Overkill** | Proxy services solve ALL blocking at once, but you only need JS rendering |

### Realistic Performance Expectations

**Static HTML sites (Cetrogar, Fravega):**
- Parser: Cheerio
- Speed: <100ms per request
- Success rate: 95%+

**JavaScript-rendered sites (Musimundo, MercadoLibre):**
- Parser: Playwright
- Speed: 2-5 seconds per request (browser load time)
- Success rate: 85-90% (blocked attempts retried)

**Rate-limited sites:**
- Retry attempts: 2-4 with exponential backoff
- Total time for success: 10-30 seconds (but site unblocks)
- Success rate: 70-80% (some sites may need manual intervention)

---

## Scalability & Adding New Stores

### Current Architecture Problems (Before refactoring)

❌ **Hardcoded per-store logic** in scraper.ts:
- `formatProductNaldo()` (custom formatting)
- `formatProductCarrefour()` (custom formatting)
- `encodeQuery()` / `encodeCarrefourQuery()` (query building)
- Each new store = new function = more complexity

❌ **Tightly coupled store enumeration**:
- `StoreNamesEnum` has 6 entries hardcoded
- Adding new store requires: enum change + scraper.ts update + new format function

❌ **No template/configuration-driven approach**:
- CSS selectors hard to change (in code, not config)
- Adding 7th store would take 4-5 hours of coding + testing

### Proposed Scalable Architecture

After Phases 1-3, structure will support **adding 50+ stores with minimal code changes**:

#### **A. Configuration-Driven Selectors (stores.config.json)**

```json
{
  "stores": {
    "cetrogar": {
      "enabled": true,
      "type": "static-html",
      "parser": "cheerio",
      "baseUrl": "https://www.cetrogar.com.ar",
      "searchUrl": "/search?q={query}",
      "selectors": {
        "products": ".product-item",
        "name": ".product-name",
        "price": ".product-price",
        "image": ".product-image img",
        "url": "a.product-link"
      },
      "formatter": "defaultFormatter"
    },
    "musimundo": {
      "enabled": true,
      "type": "spa-javascript",
      "parser": "playwright",
      "baseUrl": "https://www.musimundo.com",
      "searchUrl": "/search?keyword={query}",
      "selectors": {
        "products": "[data-product-item]",
        "name": "[data-product-name]",
        "price": "[data-price]",
        "image": "[data-product-image]",
        "url": "[data-product-link]"
      },
      "waitFor": ".product-list",
      "formatter": "musimundoFormatter"
    },
    "naldo": {
      "enabled": true,
      "type": "vtex-api",
      "parser": "api",
      "apiEndpoint": "https://www.naldo.com.ar/_v/segment/graphql/v1",
      "graphqlQuery": "path/to/naldo-query.graphql",
      "formatter": "vtexFormatter"
    }
  }
}
```

#### **B. Plugin-Based Parser System**

```typescript
interface StoreParser {
  name: string;
  parse(url: string): Promise<Product[]>;
  canHandle(storeConfig: StoreConfig): boolean;
}

class CheerioPArser implements StoreParser { ... }
class PlaywrightParser implements StoreParser { ... }
class APIParser implements StoreParser { ... }

// Auto-detection
function getParserForStore(storeConfig: StoreConfig): StoreParser {
  if (storeConfig.type === 'static-html') return cheerioParser;
  if (storeConfig.type === 'spa-javascript') return playwrightParser;
  if (storeConfig.type === 'vtex-api') return apiParser;
}
```

#### **C. Generic Product Formatter**

```typescript
interface FormatterConfig {
  name: string;
  fieldMappings: {
    [productField]: selectorOrPath;
  };
  postProcess?: (product: any) => Product;
}

// Instead of formatProductNaldo(), formatProductCarrefour()
const genericFormatter = (rawData: any, config: FormatterConfig): Product => {
  const product = {} as Product;
  
  Object.keys(config.fieldMappings).forEach(field => {
    const selector = config.fieldMappings[field];
    product[field] = extractField(rawData, selector);
  });
  
  if (config.postProcess) {
    product = config.postProcess(product);
  }
  
  return product;
};
```

### Adding a New Store (With New Architecture)

**Before (Current, ~4-5 hours):**
1. Add enum entry in `stores.enum.ts`
2. Write custom `formatProductNewStore()` function
3. Write `encodeNewStoreQuery()` function
4. Update scraper.ts router logic
5. Handle store-specific edge cases
6. Deploy and test extensively

**After Phase 3 (New, ~30 minutes):**
1. Add JSON entry to `stores.config.json`:
```json
{
  "newstore": {
    "enabled": true,
    "type": "static-html",
    "baseUrl": "https://newstore.com.ar",
    "selectors": {
      "products": ".item-card",
      "name": ".item-title",
      "price": ".item-price",
      "image": ".item-img",
      "url": "a.item-link"
    }
  }
}
```
2. Done. The system automatically:
   - Detects it's static HTML → uses Cheerio
   - Applies generic formatter with selectors
   - Handles retries/fallbacks
   - Works immediately

**Time saved per store: 4.5 hours → 30 minutes = 90% faster**

### Scalability Metrics

| Metric | Current (Hardcoded) | After Phase 3 (Config-driven) |
|--------|-------------------|-------|
| **Time to add store** | 4-5 hours | 30 minutes |
| **Code changes needed** | 3-4 files | 1 config file |
| **Risk of breaking existing** | HIGH | LOW (config only) |
| **Support for 50 stores** | ❌ Unmaintainable | ✅ Easily managed |
| **Selector updates** | Redeploy app | Hot-reload config |
| **Testing effort** | Extensive per store | Minimal (generic) |

### Phase 3 Deliverables (Updated)

When Phase 3 completes, your architecture will include:

1. **Configuration System**
   - `stores.config.json` - Define all stores
   - `selectors.json` - CSS selectors per store
   - Hot-reload capability (no restart needed)

2. **Generic Parser Framework**
   - Cheerio parser (HTML parsing)
   - Playwright parser (JS rendering)
   - API parser (GraphQL/REST)
   - Auto-selector based on store type

3. **Plugin Formatter System**
   - Generic field mapper
   - Post-processing hooks
   - Store-specific transformations via config

4. **Store Registry**
   - Dynamic store detection
   - Enable/disable stores via config
   - Monitoring per store

### Adding 10 More Stores Example (Week timeline)

| Day | Task | Effort |
|-----|------|--------|
| **Mon-Tue** | Research 10 stores (identify parser type needed) | 8 hours |
| **Wed** | Create 10 store config entries | 3 hours |
| **Thu** | Test selectors, add any post-processing logic | 4 hours |
| **Fri** | Deploy, monitor, adjustments | 2 hours |
| **Total** | ~17 hours for 10 new stores | 1.7 hours per store |

**Without scalable architecture: 40-50 hours (4-5 per store)**

### Current Implementation Gaps to Address in Phase 3

❌ Currently in scraper.ts:
- Hardcoded `StoreNamesEnum` values
- Store-specific formatters (`formatProductNaldo`, etc)
- Hardcoded selectors embedded in code
- Store-specific query encoders

✅ After Phase 3 refactoring:
- Dynamic store loading from config
- Generic formatter with configurable field mapping
- Selectors in JSON config files
- Generic query builder with store-specific templates

### Recommendation

Phase 3 MUST include full configuration-driven refactoring, NOT just abstraction layer. Otherwise:
- Adding store #7 still takes 4+ hours
- Configuration changes require deployments
- Scalability is theoretical, not practical

**Proposed Phase 3 Enhancement:**
- Days 1-2: Core abstraction (strategy pattern)
- Days 3-5: Configuration system (stores.config.json)
- Days 6-7: Generic parsers & formatters
- Days 8-10: Dynamic store loader + hot-reload capability
