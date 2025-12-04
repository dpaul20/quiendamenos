# GitHub Issues Creation Checklist

## Epic Level Issues

### Epic Issue Template
- [ ] **Epic #1**: Mejorar Arquitectura de Scraping - Solución 100% Gratuita
  - **File**: `project-plan.md` line 1-50
  - **Title**: `Epic: Mejorar Arquitectura de Scraping - Solución 100% Gratuita`
  - **Labels**: `epic`, `priority-critical`, `value-high`
  - **Milestone**: `v2.0.0 - Scalable Scraping Architecture` (target: 10 days)
  - **Estimate**: XXL (47 story points total)
  - **Description**: Complete copy from project-plan.md Epic section
  - **Acceptance Criteria**: All 10 items from Epic AC section

---

## Feature Level Issues

### Feature 1: Playwright + Exponential Backoff

- [ ] **Feature #FEAT-001**: Playwright + Exponential Backoff Strategy
  - **Epic**: Link to Epic #1
  - **Title**: `Feature: Playwright + Exponential Backoff Retry Strategy`
  - **Labels**: `feature`, `priority-critical`, `value-high`, `backend`, `performance`
  - **Estimate**: 13 story points (M - Medium feature, 1-2 weeks)
  - **Sprint**: Sprint 1 (Days 1-3)
  - **Milestone**: v2.0.0
  
  **Description**:
  ```markdown
  ## Feature: Playwright + Exponential Backoff
  
  Agregar Playwright para JavaScript rendering y exponential backoff para reintentos inteligentes.
  Esto es la base para todo lo demás de la refactorización.
  
  ## User Stories in this Feature
  - [ ] #US-101 - Install & Configure Playwright (3 pts)
  - [ ] #US-102 - Implement Exponential Backoff Logic (5 pts)
  - [ ] #US-103 - Error Detection & Categorization (5 pts)
  
  ## Technical Enablers
  - [ ] #EN-101 - Test with Musimundo (0 pts, enabler)
  
  ## Dependencies
  **Blocks**: #FEAT-002  
  **Blocked by**: None (start immediately)
  **Prerequisite**: Node.js 20+ (already installed)
  
  ## Acceptance Criteria
  - [ ] Playwright installed and binaries downloaded successfully
  - [ ] Exponential backoff implemented with jitter (2s→4s→8s→16s)
  - [ ] Max 4 retry attempts before fallback
  - [ ] Error detection working (JS required, rate limited, network error)
  - [ ] Musimundo scraping with 85%+ success rate
  - [ ] Memory footprint <500MB for single browser instance
  - [ ] No breaking changes to existing code
  - [ ] All unit tests passing with >80% coverage
  - [ ] Integration tests with 6 stores passing
  
  ## Definition of Done
  - [ ] Acceptance criteria met
  - [ ] Code review approved
  - [ ] Unit tests written and passing
  - [ ] Integration tests with all 6 stores passing
  - [ ] Documentation updated (CHANGELOG.md, README.md)
  - [ ] No regressions in existing functionality
  ```
  
  **Files to Create**:
  - `src/lib/playwright-adapter.ts`
  - `src/lib/backoff-strategy.ts`
  
  **Files to Modify**:
  - `src/app/api/scrape/route.ts` (add Playwright option)

---

### Feature 2: Fallback Router Strategy

- [ ] **Feature #FEAT-002**: Fallback Router Strategy (Cheerio → Playwright → Cache)
  - **Epic**: Link to Epic #1
  - **Title**: `Feature: Fallback Router & Error Categorization`
  - **Labels**: `feature`, `priority-critical`, `value-high`, `backend`, `reliability`
  - **Estimate**: 8 story points (S - Small feature, <1 day ideal, but complex)
  - **Sprint**: Sprint 2 (Days 4-5)
  - **Milestone**: v2.0.0
  - **Blocked by**: #FEAT-001 (needs Playwright working)
  
  **Description**:
  ```markdown
  ## Feature: Fallback Router & Error Categorization
  
  Implementar router inteligente que elige automáticamente entre:
  1. Cheerio (HTML parsing rápido)
  2. Playwright (JS rendering)
  3. Cache (fallback final)
  
  Basado en tipo de error y capacidades del sitio.
  
  ## User Stories in this Feature
  - [ ] #US-201 - Router Implementation (4 pts)
  - [ ] #US-202 - Error Categorization & Retry-After Headers (4 pts)
  
  ## Dependencies
  **Blocks**: #FEAT-003  
  **Blocked by**: #FEAT-001 (needs Playwright)
  **Related**: Existing `src/lib/cache.ts` system
  
  ## Acceptance Criteria
  - [ ] Router automatically chooses correct adapter based on error type
  - [ ] Error categorization: 403/429 (rate limit), timeout, JS required, network error
  - [ ] Retry-After headers respected when present
  - [ ] Cache fallback works when both Cheerio and Playwright fail
  - [ ] All 6 stores achieve 85%+ success rate
  - [ ] No infinite retry loops (max 4 attempts enforced)
  - [ ] Performance acceptable (<5s per request for JS sites)
  - [ ] Unit tests >80% coverage
  
  ## Definition of Done
  - [ ] Acceptance criteria met
  - [ ] Code review approved
  - [ ] All unit tests passing
  - [ ] Integration tests with 6 stores passing
  - [ ] Performance benchmarks verified
  - [ ] Documentation updated
  ```
  
  **Files to Create**:
  - `src/lib/router-strategy.ts`
  - `src/lib/error-categorizer.ts`
  
  **Files to Modify**:
  - `src/lib/scraper.ts` (integrate router)

---

### Feature 3: Configuration-Driven Architecture

- [ ] **Feature #FEAT-003**: Configuration-Driven Architecture with Plugin Parsers
  - **Epic**: Link to Epic #1
  - **Title**: `Feature: Configuration-Driven Store Architecture & Plugin Parsers`
  - **Labels**: `feature`, `priority-high`, `value-high`, `backend`, `scalability`, `architecture`
  - **Estimate**: 21 story points (L - Large, 20-40 pts)
  - **Sprint**: Sprint 3 (Days 6-10)
  - **Milestone**: v2.0.0
  - **Blocked by**: #FEAT-002 (needs router)
  
  **Description**:
  ```markdown
  ## Feature: Configuration-Driven Architecture
  
  **THIS IS THE SCALABILITY FEATURE** - transforms hardcoded approach to config-driven.
  
  After this feature: Adding new store = adding JSON config entry only (30 minutes vs 4-5 hours).
  
  ## User Stories in this Feature
  - [ ] #US-301 - Create stores.config.json System (5 pts)
  - [ ] #US-302 - Plugin-Based Parser System (8 pts)
  - [ ] #US-303 - Generic Formatter with Field Mapping (5 pts)
  - [ ] #US-304 - Dynamic Store Loader & Hot-Reload (3 pts)
  
  ## Technical Enablers
  - [ ] #EN-301 - Migrate all 6 stores to config-driven (8 pts)
  
  ## Dependencies
  **Blocks**: Production release v2.0.0  
  **Blocked by**: #FEAT-002 (needs router)
  **Related**: `src/enums/stores.enum.ts` (will be deprecated)
  
  ## Acceptance Criteria
  - [ ] stores.config.json fully functional with schema validation
  - [ ] Plugin parser system (Cheerio, Playwright, API) working correctly
  - [ ] Generic formatter eliminates all per-store formatter functions
  - [ ] All 6 existing stores migrated to config-driven successfully
  - [ ] Can add new store in 30 minutes without code changes (demo validated)
  - [ ] Hot-reload capability working (config changes without restart)
  - [ ] Config validation schema is strict
  - [ ] Performance vs FEAT-002 is same or better (no regression)
  - [ ] Unit tests >80% for parsers and formatters
  - [ ] Integration tests all 6 stores
  
  ## Definition of Done
  - [ ] Acceptance criteria met
  - [ ] Code review approved (architecture review required)
  - [ ] Unit tests >80% coverage
  - [ ] Integration tests all 6 stores passing
  - [ ] E2E test: add 7th store in real time, verify it works
  - [ ] Performance benchmarks verified
  - [ ] Documentation complete (ARCHITECTURE.md, new-store-guide.md)
  - [ ] No performance regression vs Sprint 2
  - [ ] stores.enum.ts can be marked as deprecated
  ```
  
  **Files to Create**:
  - `src/config/stores.config.json`
  - `src/lib/parsers/cheerio-parser.ts`
  - `src/lib/parsers/playwright-parser.ts`
  - `src/lib/parsers/api-parser.ts`
  - `src/lib/formatters/generic-formatter.ts`
  - `src/lib/formatters/post-processors.ts`
  - `src/lib/store-loader.ts`
  - `src/lib/store-registry.ts`
  - `docs/ARCHITECTURE.md`
  - `docs/new-store-guide.md`
  
  **Files to Modify**:
  - `src/lib/scraper.ts` (complete refactor)
  - `src/enums/stores.enum.ts` (mark as deprecated, keep for backward compatibility)

---

### Feature 4: Browser Pooling Optimization (OPTIONAL)

- [ ] **Feature #FEAT-004**: Browser Pooling & Memory Optimization (OPTIONAL)
  - **Epic**: Link to Epic #1
  - **Title**: `Feature: Browser Pooling & Performance Optimization`
  - **Labels**: `feature`, `priority-medium`, `value-medium`, `backend`, `performance`, `optional`
  - **Estimate**: 5 story points (S - Small, but can skip)
  - **Sprint**: Sprint 4 (Days 8-10, parallel with FEAT-003)
  - **Milestone**: v2.0.0 or v2.1.0
  - **Blocked by**: #FEAT-003 (architecture must be solid first)
  - **Optional**: YES - can skip if FEAT-003 performance is acceptable
  
  **Description**:
  ```markdown
  ## Feature: Browser Pooling & Memory Optimization
  
  Optimize Playwright performance with browser pool (5-10 instances),
  context reuse, and memory monitoring.
  
  **OPTIONAL**: Can skip if memory usage is acceptable after FEAT-003.
  
  ## User Stories in this Feature
  - [ ] #US-401 - Implement Browser Pool (3 pts)
  - [ ] #US-402 - Memory Monitoring & Alerting (2 pts)
  
  ## Dependencies
  **Blocks**: None  
  **Blocked by**: #FEAT-003
  **Optional**: YES - implement only if needed
  
  ## Acceptance Criteria
  - [ ] Browser pool manages 5-10 instances
  - [ ] Contexts reused efficiently
  - [ ] Memory per browser <200MB
  - [ ] Total system memory <1GB (6 concurrent requests)
  - [ ] Performance improved vs single browser instance
  - [ ] Memory monitoring logs per-browser usage
  - [ ] Alert on memory spike (>150MB per browser)
  
  ## Definition of Done
  - [ ] Acceptance criteria met (if implemented)
  - [ ] Code review approved
  - [ ] Performance benchmarks verified
  - [ ] Memory monitoring operational
  ```
  
  **Files to Create**:
  - `src/lib/browser-pool.ts`
  - `src/lib/memory-monitor.ts`
  
  **Note**: This is truly optional. Only implement if:
  1. Memory usage in FEAT-003 is >200MB per browser
  2. Or system RAM becomes constraint
  3. Or team has extra capacity

---

## User Story Issues - Fase 1

### Story #US-101: Install & Configure Playwright

```markdown
# User Story: Install & Configure Playwright

## Story Statement
As a **backend engineer**, I want **Playwright installed and configured** so that 
**JavaScript-rendered content can be scraped**.

## Acceptance Criteria
- [ ] `npm install playwright` installs successfully
- [ ] Chromium, Firefox, WebKit binaries auto-downloaded (~150MB)
- [ ] Basic Playwright script can launch and close browser
- [ ] Zero breaking changes to existing code
- [ ] Dependencies in package.json updated with version pinned

## Technical Tasks
- [ ] Install playwright package
- [ ] Verify binary downloads work
- [ ] Create `src/lib/playwright-adapter.ts` skeleton
- [ ] Test with one simple store (Cetrogar)

## Testing Requirements
- [ ] Unit test: Browser launches and closes successfully
- [ ] Unit test: Error handling if binaries can't download
- [ ] Integration test: Can scrape simple static site

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Integration test passing
- [ ] No performance regression
- [ ] package.json updated

## Labels
`user-story`, `priority-critical`, `backend`, `phase-1`, `setup`

## Feature
#FEAT-001

## Estimate
3 story points
```

- [ ] Create issue #US-101

---

### Story #US-102: Implement Exponential Backoff Logic

```markdown
# User Story: Implement Exponential Backoff Retry Logic

## Story Statement
As a **backend engineer**, I want **exponential backoff retry logic** so that 
**rate-limited requests can be retried intelligently without overwhelming servers**.

## Acceptance Criteria
- [ ] Retry sequence: 2s → 4s → 8s → 16s → give up
- [ ] Jitter: random 0-1s added to each delay
- [ ] Max attempts: 4 retries before failing
- [ ] Jitter prevents "thundering herd" (simultaneous retries)
- [ ] All retry attempts logged with metadata (attempt #, delay, store)
- [ ] Works correctly with concurrent requests

## Technical Tasks
- [ ] Create `src/lib/backoff-strategy.ts`
- [ ] Implement delay calculation: `Math.min(baseDelay * 2^attempt + jitter, maxDelay)`
- [ ] Implement jitter generation: `Math.random() * 1000`
- [ ] Add logging with attempt number and store name
- [ ] Test with simulated rate limiting

## Testing Requirements
- [ ] Unit test: Correct delay sequence (2s, 4s, 8s, 16s)
- [ ] Unit test: Jitter is always 0-1s
- [ ] Unit test: Max 4 attempts enforced
- [ ] Unit test: Concurrent requests don't cause thundering herd

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests >80% coverage
- [ ] No performance regression
- [ ] Documented in README.md

## Labels
`user-story`, `priority-critical`, `backend`, `phase-1`, `reliability`

## Feature
#FEAT-001

## Estimate
5 story points
```

- [ ] Create issue #US-102

---

### Story #US-103: Error Detection & Categorization

```markdown
# User Story: Error Detection & Categorization System

## Story Statement
As a **backend engineer**, I want **error detection and categorization** so that 
**appropriate action can be taken based on error type** (JS required → Playwright, 
rate limited → backoff, etc.).

## Acceptance Criteria
- [ ] Detect "JavaScript required": No content after 2s timeout
- [ ] Detect "Rate limited (429)": HTTP 429 status code
- [ ] Detect "IP blocked (403)": HTTP 403 status code
- [ ] Detect "Network error": Connection refused, timeout, DNS failure
- [ ] Each error type has metadata (status code, response size, timing)
- [ ] Works with all 6 existing stores
- [ ] Logs appropriate action taken (Cheerio → Playwright → Cache)

## Technical Tasks
- [ ] Create error categorization system
- [ ] Test with each store to identify which type of error occurs
- [ ] Add logging for error categorization
- [ ] Create metrics/stats on error types

## Testing Requirements
- [ ] Unit test: Categorizes 429 as rate limit
- [ ] Unit test: Categorizes 403 as IP block
- [ ] Unit test: Detects JS required scenario
- [ ] Integration test: Categorizes errors from real stores correctly

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Integration tests with 6 stores passing
- [ ] Documentation updated

## Labels
`user-story`, `priority-critical`, `backend`, `phase-1`, `reliability`

## Feature
#FEAT-001

## Estimate
5 story points
```

- [ ] Create issue #US-103

---

## Enabler Issues - Fase 1

### Enabler #EN-101: Test with Musimundo

```markdown
# Technical Enabler: Test Playwright with Musimundo

## Enabler Description
Musimundo is the most problematic store (JavaScript-heavy). Testing FEAT-001 
with Musimundo validates that Playwright + backoff solves the core issue.

## Technical Requirements
- [ ] Playwright can scrape Musimundo successfully
- [ ] Success rate improved from ~60% to 85%+
- [ ] No infinite loops or hanging requests
- [ ] Memory usage acceptable (<500MB)

## Testing
- [ ] 100 scraping attempts on Musimundo
- [ ] Track success rate improvement
- [ ] Monitor memory usage
- [ ] Check for any hanging/timeout issues

## Acceptance Criteria
- [ ] 85%+ success rate on Musimundo
- [ ] Average response time <5s
- [ ] Memory footprint <500MB
- [ ] Zero hanging requests in 100 attempts

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Results documented in feature completion
- [ ] Ready to move to FEAT-002

## Labels
`enabler`, `priority-critical`, `testing`, `phase-1`, `validation`

## Feature
#FEAT-001

## Estimate
0 story points (validation only, not dev work)
```

- [ ] Create issue #EN-101

---

## User Story Issues - Fase 2

### Story #US-201: Router Implementation

```markdown
# User Story: Fallback Router Implementation

## Story Statement
As a **backend engineer**, I want **a router that chooses between Cheerio, 
Playwright, or Cache** so that **each error type gets the best handling strategy**.

## Acceptance Criteria
- [ ] Router logic: Cheerio first → Playwright second → Cache fallback
- [ ] Decision based on error type categorization
- [ ] Automatic adapter selection based on store configuration
- [ ] Works with all 6 stores without modification
- [ ] Performance: No overhead added by router logic

## Technical Tasks
- [ ] Create `src/lib/router-strategy.ts`
- [ ] Implement adapter selection logic
- [ ] Integrate with error categorizer from FEAT-001
- [ ] Add logging for adapter selection

## Testing Requirements
- [ ] Unit test: Static site goes to Cheerio
- [ ] Unit test: JS-heavy site goes to Playwright
- [ ] Unit test: Failed requests go to cache
- [ ] Integration test: All 6 stores use correct adapter

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Integration tests with 6 stores passing

## Labels
`user-story`, `priority-critical`, `backend`, `phase-2`, `architecture`

## Feature
#FEAT-002

## Estimate
4 story points
```

- [ ] Create issue #US-201

---

### Story #US-202: Error Categorization & Retry-After Headers

```markdown
# User Story: Error Categorization & Retry-After Header Respect

## Story Statement
As a **backend engineer**, I want **categorize errors and respect Retry-After headers** 
so that **I don't overwhelm servers and follow HTTP standards**.

## Acceptance Criteria
- [ ] Retry-After header detected and respected when present
- [ ] If Retry-After header says "120s", wait 120s before retry
- [ ] If no Retry-After, use exponential backoff (2s, 4s, 8s, 16s)
- [ ] Error categories: 429, 403, timeout, network error, JS required
- [ ] Works with all 6 stores

## Technical Tasks
- [ ] Add Retry-After header parsing
- [ ] Implement delay logic: Retry-After > exponential backoff
- [ ] Test with sites that send Retry-After headers

## Testing Requirements
- [ ] Unit test: Retry-After header honored
- [ ] Unit test: Fallback to backoff if no header
- [ ] Integration test: With stores that send Retry-After

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Integration tests passing

## Labels
`user-story`, `priority-critical`, `backend`, `phase-2`, `reliability`

## Feature
#FEAT-002

## Estimate
4 story points
```

- [ ] Create issue #US-202

---

## User Story Issues - Fase 3

### Story #US-301: Create stores.config.json System

```markdown
# User Story: Create stores.config.json Configuration System

## Story Statement
As a **backend engineer**, I want **stores defined in JSON config** so that 
**new stores can be added without code changes**.

## Acceptance Criteria
- [ ] Create `src/config/stores.config.json`
- [ ] Schema validation with strict rules
- [ ] Load config on application startup
- [ ] Config format: name, type, baseUrl, selectors, formatter, etc.
- [ ] Validation errors prevent startup
- [ ] All 6 existing stores expressible in config

## Technical Tasks
- [ ] Design stores.config.json schema
- [ ] Implement config loader
- [ ] Create schema validator (use Zod or similar)
- [ ] Test with all 6 existing stores

## Testing Requirements
- [ ] Unit test: Config loads successfully
- [ ] Unit test: Invalid config rejected with clear errors
- [ ] Unit test: All 6 stores loadable from config

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Schema documented in README

## Labels
`user-story`, `priority-high`, `backend`, `phase-3`, `scalability`

## Feature
#FEAT-003

## Estimate
5 story points
```

- [ ] Create issue #US-301

---

### Story #US-302: Plugin-Based Parser System

```markdown
# User Story: Plugin-Based Parser System

## Story Statement
As a **backend engineer**, I want **plugin-based parsers (Cheerio, Playwright, API)** 
so that **each store type is handled optimally**.

## Acceptance Criteria
- [ ] Parser interface: `parse(url: string): Promise<Product[]>`
- [ ] CheerioPArser: HTML parsing for static sites
- [ ] PlaywrightParser: JS rendering for SPAs
- [ ] APIParser: Direct API calls for stores with public APIs
- [ ] Auto-detection: store.type determines which parser
- [ ] All parsers respect retry logic from FEAT-001
- [ ] All parsers work with router from FEAT-002

## Technical Tasks
- [ ] Create `src/lib/parsers/` folder structure
- [ ] Implement CheerioPArser
- [ ] Implement PlaywrightParser (wraps existing Playwright)
- [ ] Implement APIParser
- [ ] Create parser factory with auto-detection

## Testing Requirements
- [ ] Unit test: Each parser works independently
- [ ] Unit test: Parser selection based on store.type correct
- [ ] Integration test: All parsers work through router

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing

## Labels
`user-story`, `priority-high`, `backend`, `phase-3`, `architecture`

## Feature
#FEAT-003

## Estimate
8 story points
```

- [ ] Create issue #US-302

---

### Story #US-303: Generic Formatter with Field Mapping

```markdown
# User Story: Generic Formatter with Field Mapping

## Story Statement
As a **backend engineer**, I want **a generic formatter that works with field mapping** 
so that **I don't need per-store formatter functions** (eliminates code duplication).

## Acceptance Criteria
- [ ] Generic formatter accepts Product, config with field mappings
- [ ] Field mapping: {productField: selectorOrPath}
- [ ] Eliminates formatProductNaldo(), formatProductCarrefour(), etc.
- [ ] Post-processing hooks for store-specific transformations
- [ ] All 6 existing stores working with generic formatter
- [ ] Type-safe output (Product type)

## Technical Tasks
- [ ] Create `src/lib/formatters/generic-formatter.ts`
- [ ] Implement field mapping logic
- [ ] Implement post-processing hooks
- [ ] Test with all 6 stores

## Testing Requirements
- [ ] Unit test: Field mapping works correctly
- [ ] Unit test: Post-processing hooks called
- [ ] Integration test: All 6 stores produce correct Product types

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] All 6 stores working with generic formatter

## Labels
`user-story`, `priority-high`, `backend`, `phase-3`, `refactoring`

## Feature
#FEAT-003

## Estimate
5 story points
```

- [ ] Create issue #US-303

---

### Story #US-304: Dynamic Store Loader & Hot-Reload

```markdown
# User Story: Dynamic Store Loader & Hot-Reload Capability

## Story Statement
As a **backend engineer**, I want **dynamic store loading and hot-reload** so that 
**configuration changes don't require application restart**.

## Acceptance Criteria
- [ ] Store registry loads from config at startup
- [ ] Config changes detected and reloaded (without restart)
- [ ] Validation on reload (prevent bad config from going live)
- [ ] Existing requests complete before reload
- [ ] New requests use reloaded config

## Technical Tasks
- [ ] Create `src/lib/store-loader.ts`
- [ ] Create `src/lib/store-registry.ts`
- [ ] Implement file watch for config changes
- [ ] Implement validation before reload

## Testing Requirements
- [ ] Unit test: Config loads correctly
- [ ] Integration test: Hot-reload works
- [ ] Integration test: Bad config rejected on reload

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests passing
- [ ] Hot-reload tested manually

## Labels
`user-story`, `priority-high`, `backend`, `phase-3`, `devops`

## Feature
#FEAT-003

## Estimate
3 story points
```

- [ ] Create issue #US-304

---

## Enabler Issues - Fase 3

### Enabler #EN-301: Migrate All 6 Stores to Config-Driven

```markdown
# Technical Enabler: Migrate 6 Existing Stores to Config-Driven Architecture

## Enabler Description
Validate that new configuration-driven architecture works with all 6 existing stores.
This is the proof that scalability is real (can add 7th store in 30 minutes).

## Technical Requirements
- [ ] All 6 stores (Cetrogar, Fravega, Musimundo, Naldo, Carrefour, MercadoLibre) 
      defined in stores.config.json
- [ ] All stores use generic formatter (no per-store functions)
- [ ] All stores use one of the plugin parsers (Cheerio, Playwright, API)
- [ ] Old per-store functions (formatProductNaldo, etc.) removed
- [ ] Success rate maintained or improved vs FEAT-002
- [ ] Performance same or better vs FEAT-002

## Acceptance Criteria
- [ ] All 6 stores in config (no hardcoded per-store logic)
- [ ] Success rate: Cetrogar 95%+, Fravega 95%+, Musimundo 85%+, etc.
- [ ] Response time: <1s for static, <5s for JS sites
- [ ] No per-store formatter functions in codebase
- [ ] Old stores.enum.ts can be marked deprecated
- [ ] Zero breaking changes to existing API

## Definition of Done
- [ ] All 6 stores tested and working
- [ ] Metrics show performance maintained
- [ ] Code review approved
- [ ] Documentation updated (ARCHITECTURE.md)
- [ ] Ready for production migration

## Labels
`enabler`, `priority-high`, `backend`, `phase-3`, `migration`, `validation`

## Feature
#FEAT-003

## Estimate
8 story points
```

- [ ] Create issue #EN-301

---

## User Story Issues - Fase 4 (OPTIONAL)

### Story #US-401: Implement Browser Pool

```markdown
# User Story: Implement Browser Pool (Optional)

## Story Statement
As a **backend engineer**, I want **a browser pool (5-10 instances)** so that 
**concurrent requests can be handled efficiently**.

## Acceptance Criteria
- [ ] Pool manages 5-10 browser instances
- [ ] Contexts are reused (not full browser restart)
- [ ] Pool grows up to max, shrinks when idle
- [ ] Memory per browser <200MB
- [ ] Concurrent requests queued properly

## Note
**OPTIONAL**: Only implement if memory usage in FEAT-003 >200MB per browser 
or if team has extra capacity.

## Labels
`user-story`, `priority-medium`, `backend`, `phase-4`, `optimization`, `optional`

## Feature
#FEAT-004

## Estimate
3 story points
```

- [ ] Create issue #US-401 (OPTIONAL)

---

### Story #US-402: Memory Monitoring & Alerting

```markdown
# User Story: Memory Monitoring & Alerting (Optional)

## Story Statement
As a **devops engineer**, I want **memory monitoring for browser instances** so that 
**I can detect memory leaks early**.

## Acceptance Criteria
- [ ] Monitor RAM per browser instance
- [ ] Alert if >150MB (potential leak)
- [ ] Log memory stats every 5 minutes
- [ ] Dashboard or logging for visibility

## Note
**OPTIONAL**: Only implement if needed for production monitoring.

## Labels
`user-story`, `priority-medium`, `devops`, `phase-4`, `monitoring`, `optional`

## Feature
#FEAT-004

## Estimate
2 story points
```

- [ ] Create issue #US-402 (OPTIONAL)

---

## Pre-Creation Preparation Checklist

- [x] **Feature artifacts complete**: PRD, technical breakdown, implementation plan done ✓
- [x] **Epic exists in plan**: project-plan.md created ✓
- [x] **Project board will be configured**: Instructions below
- [x] **Team capacity assessed**: 1 backend engineer, 1-2 QA engineers recommended

---

## GitHub Project Board Setup Instructions

### Create New Project Board

1. Go to GitHub → Your Repo → Projects
2. Click "New Project"
3. Name: `v2.0.0 - Scalable Scraping Architecture`
4. Choose template: `Table` (better for tracking points)

### Configure Columns

| Column | Purpose | Auto-Move Triggers |
|--------|---------|------------------|
| 📋 Backlog | Not yet estimated | N/A (manual move) |
| 🔵 Ready | Estimated, ready for sprint | Manual move |
| 🟡 In Progress | Currently being worked | PR opened |
| 🟠 In Review | Waiting for review | PR review requested |
| ✅ Done | Completed and merged | PR merged |

### Configure Custom Fields

- **Priority**: P0 Critical, P1 High, P2 Medium, P3 Low
- **Value**: High, Medium, Low
- **Component**: Frontend, Backend, Infrastructure
- **Phase**: Phase 1, Phase 2, Phase 3, Phase 4
- **Estimate**: 1, 2, 3, 5, 8, 13, 21 (story points)

### Create Milestones

1. **v2.0.0 - Scalable Scraping Architecture** (target: 10 days)
2. Add all FEAT and US issues to this milestone

---

## Issue Creation Execution Plan

### Day 1: Create Epic + Sprint 1 Issues (2 hours)

- [ ] Create Epic #1
- [ ] Create FEAT-001, US-101, US-102, US-103, EN-101
- [ ] Add to v2.0.0 milestone
- [ ] Add to project board in "Ready" column
- [ ] Assign to backend engineer

### Day 2: Create Sprint 2 Issues (30 minutes)

- [ ] Create FEAT-002, US-201, US-202
- [ ] Add to v2.0.0 milestone
- [ ] Mark as "Blocked by FEAT-001"
- [ ] Add to project board

### Day 3: Create Sprint 3 Issues (1 hour)

- [ ] Create FEAT-003, US-301, US-302, US-303, US-304, EN-301
- [ ] Add to v2.0.0 milestone
- [ ] Mark as "Blocked by FEAT-002"
- [ ] Add to project board

### Day 4: Create Sprint 4 Issues (OPTIONAL, 30 minutes)

- [ ] Create FEAT-004, US-401, US-402
- [ ] Add to v2.0.0 milestone
- [ ] Mark as "Blocked by FEAT-003"
- [ ] Mark as "Optional"

---

## References

- 📄 **Epic Plan**: `project-plan.md`
- 📄 **Research**: `.copilot-tracking/research/20250110-scraper-solutions-investigation.md`
- 📋 **Issue Templates**: Above in this file

---

**Created**: 2025-01-10  
**Last Updated**: 2025-01-10  
**Status**: 🟡 Ready for Issue Creation

### Next Step
Execute this checklist: create all issues in GitHub following the templates above.
