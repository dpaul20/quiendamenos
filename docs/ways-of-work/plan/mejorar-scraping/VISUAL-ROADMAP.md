# Visual Roadmap - Mejorar Arquitectura de Scraping

## 🎯 Epic Vision

```
┌─────────────────────────────────────────────────────────────────────┐
│  EPIC: Mejorar Arquitectura de Scraping                             │
│  Goal: $0 cost, 50+ stores, 30 min to add new store                │
│  Timeline: 10 days, 47 story points                                 │
│  Owner: Backend Team                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Sprint Timeline (10 Days)

```
Day 1        Day 3    Day 4    Day 5    Day 6         Day 10
│            │        │        │        │             │
├─ SPRINT 1 ─┤        │        │        │             │
│ Playwright │        │        │        │             │
│ + Backoff  │        │        │        │             │
│ (13 pts)   │        │        │        │             │
│            ├─ SPRINT 2 ──────┤        │             │
│            │ Fallback Router │        │             │
│            │ (8 pts)         │        │             │
│            │                 ├─ SPRINT 3 ──────────┤
│            │                 │ Config-Driven       │
│            │                 │ (21 pts)            │
│            │                 │                     │
│            │                 │  [OPTIONAL]         │
│            │                 │  SPRINT 4: Pooling  │
│            │                 │  (5 pts)            │
└────────────┴─────────────────┴─────────────────────┘
```

---

## 🏗️ Feature Breakdown

### FEATURE 1: Playwright + Exponential Backoff
```
┌──────────────────────────────────────────┐
│ FEAT-001: Playwright + Backoff (13 pts) │
│ Days: 1-3                                │
│ Priority: P0 Critical                    │
├──────────────────────────────────────────┤
│ ✓ US-101: Install Playwright (3 pts)    │
│ ✓ US-102: Exponential Backoff (5 pts)   │
│ ✓ US-103: Error Detection (5 pts)       │
│ ✓ EN-101: Test Musimundo (validation)  │
└──────────────────────────────────────────┘
```

**Deliverable**: Playwright working with Musimundo 85%+ success

---

### FEATURE 2: Fallback Router
```
┌──────────────────────────────────────────┐
│ FEAT-002: Fallback Router (8 pts)        │
│ Days: 4-5                                │
│ Priority: P0 Critical                    │
│ Blocked by: FEAT-001                    │
├──────────────────────────────────────────┤
│ ✓ US-201: Router Implementation (4 pts) │
│ ✓ US-202: Error Categorization (4 pts)  │
└──────────────────────────────────────────┘
```

**Deliverable**: All 6 stores working, 85%+ success

---

### FEATURE 3: Configuration-Driven Architecture ⭐
```
┌──────────────────────────────────────────────────────┐
│ FEAT-003: Configuration-Driven (21 pts)             │
│ Days: 6-10                                          │
│ Priority: P1 High Value (SCALABILITY!)              │
│ Blocked by: FEAT-002                                │
├──────────────────────────────────────────────────────┤
│ ✓ US-301: stores.config.json System (5 pts)        │
│ ✓ US-302: Plugin Parser System (8 pts)             │
│ ✓ US-303: Generic Formatter (5 pts)                │
│ ✓ US-304: Store Loader & Hot-Reload (3 pts)       │
│ ✓ EN-301: Migrate 6 Stores (8 pts)                 │
└──────────────────────────────────────────────────────┘
```

**Deliverable**: Add 7th store in 30 minutes (demo validated)

---

### FEATURE 4: Browser Pooling (OPTIONAL)
```
┌──────────────────────────────────────────┐
│ FEAT-004: Browser Pooling (5 pts)        │
│ Days: 8-10 (parallel with FEAT-003)      │
│ Priority: P2 Optional                    │
│ Blocked by: FEAT-003                     │
├──────────────────────────────────────────┤
│ ✓ US-401: Browser Pool (3 pts)          │
│ ✓ US-402: Memory Monitoring (2 pts)     │
└──────────────────────────────────────────┘
```

**Deliverable**: <200MB per browser, total <1GB

---

## 📊 Story Points Distribution

```
FEAT-001  FEAT-002  FEAT-003  FEAT-004
(13 pts)  (8 pts)   (21 pts)  (5 pts)
   |         |         |        |
   |         |         |        └─ Optional
   |         |         └──────────── Largest (Scalability)
   |         └──────────────────────  Router
   └──────────────────────────────── Foundation
   
Total: 47 story points
Team Capacity: ~40 pts/week
Timeline: 10 days (slightly compressed)
```

---

## 🔄 Dependency Flow

```
┌─────────────────────┐
│   START (Day 0)    │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────┐
│ FEAT-001: Playwright + Backoff    │ Days 1-3
│ (13 pts)                         │
│ ✓ Install Playwright             │
│ ✓ Exponential backoff logic       │
│ ✓ Error detection                │
│ ✓ Musimundo testing              │
│ → Success: 85%+ ✓                │
└──────────────┬────────────────────┘
               │ MUST COMPLETE FIRST
               ▼
┌──────────────────────────────────┐
│ FEAT-002: Fallback Router        │ Days 4-5
│ (8 pts)                          │
│ ✓ Router (Cheerio→PW→Cache)      │
│ ✓ Error categorization           │
│ ✓ Retry-After header respect     │
│ → Success: All 6 stores ✓        │
└──────────────┬────────────────────┘
               │ MUST COMPLETE FIRST
               ▼
┌──────────────────────────────────┐
│ FEAT-003: Config-Driven          │ Days 6-10
│ (21 pts) ⭐ SCALABILITY           │
│ ✓ stores.config.json             │
│ ✓ Plugin parsers                 │
│ ✓ Generic formatter              │
│ ✓ Store loader & hot-reload      │
│ ✓ Migrate 6 stores               │
│ → Success: Add store in 30min ✓  │
└──────────┬───────────────────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
    ┌────────────────┐         ┌──────────────┐
    │ Release v2.0.0 │         │ FEAT-004:    │ Days 8-10
    │ (Mandatory)    │         │ Browser Pool │ (Optional)
    │                │         │ (5 pts)      │
    └────────────────┘         └──────────────┘
           │
           ▼
    ┌────────────────┐
    │ MILESTONE HIT  │ Day 10
    │ ✓ Zero cost    │
    │ ✓ 50+ stores   │
    │ ✓ 30 min/store │
    └────────────────┘
```

---

## 💾 Architecture Transformation

### BEFORE (Current - Hardcoded)

```
stores.enum.ts
└── StoreNamesEnum {
    CETROGAR = 'cetrogar',
    FRAVEGA = 'fravega',
    ...
}

scraper.ts
├── formatProductNaldo()      ← Per-store function
├── formatProductCarrefour()  ← Per-store function
├── encodeQuery()             ← Per-store query
├── encodeCarrefourQuery()    ← Per-store query
└── [hardcoded selectors]     ← Code duplication

Adding new store = 4-5 hours ❌
```

### AFTER (Future - Config-Driven)

```
stores.config.json
├── cetrogar: {
│   ├── type: "static-html"
│   ├── selectors: {...}
│   └── formatter: "defaultFormatter"
├── musimundo: {
│   ├── type: "spa-javascript"
│   ├── selectors: {...}
│   └── formatter: "musimundoFormatter"
├── newstore7: {
│   ├── type: "static-html"
│   ├── selectors: {...}
│   └── formatter: "defaultFormatter"
└── ... 50+ stores possible

parsers/
├── cheerio-parser.ts   ← Reusable
├── playwright-parser.ts ← Reusable
└── api-parser.ts        ← Reusable

formatters/
└── generic-formatter.ts ← Works for all

Adding new store = 30 minutes ✅
```

---

## 🎯 Success Metrics

### Technical Metrics

```
Metric                Current  Target  Improvement
─────────────────────────────────────────────────
Success Rate          70-80%   85-95%   +20%
Time/Store            4-5 hrs  30 min   90% faster
Stores Supported      6        50+      8x more
Monthly Cost          $49-599  $0       100% savings
Memory/Browser        N/A      <200MB   Optimized
Test Coverage         ~60%     >85%     +25%
```

### Business Metrics

```
                  Before       After       Benefit
─────────────────────────────────────────────────
Cost/Year         $600-7000    $0          $6000-7000
Stores            6            50+         Scalable
Config Changes    Redeploy     Hot-reload  No downtime
Time to Market    4-5 hours    30 min      90% faster
```

---

## 📋 Sprint Commitments

### Sprint 1: Foundation (13 pts)
```
┌─ SPRINT 1 (Days 1-3) ──────────────────┐
│ Capacity: 13 points                    │
│ Focus: Playwright + Exponential Backoff│
│                                        │
│ Tasks:                                 │
│ ├─ npm install playwright              │
│ ├─ Exponential backoff (2→4→8→16s)    │
│ ├─ Error detection (JS/rate-limit)     │
│ └─ Test with Musimundo                 │
│                                        │
│ Success: Musimundo 85%+ ✓              │
│ Blocker?: None - can start immediately│
└────────────────────────────────────────┘
```

### Sprint 2: Resilience (8 pts)
```
┌─ SPRINT 2 (Days 4-5) ──────────────────┐
│ Capacity: 8 points                     │
│ Focus: Fallback Router                 │
│                                        │
│ Tasks:                                 │
│ ├─ Router logic (Cheerio→PW→Cache)    │
│ ├─ Error categorization (429/403)      │
│ └─ Retry-After header support          │
│                                        │
│ Success: 6 stores 85%+ ✓               │
│ Blocker?: FEAT-001 must be done        │
└────────────────────────────────────────┘
```

### Sprint 3: Scalability (21 pts - MAIN SPRINT)
```
┌─ SPRINT 3 (Days 6-10) ──────────────────────┐
│ Capacity: 29 points (Largest sprint)        │
│ Focus: Configuration-Driven Architecture    │
│                                             │
│ Tasks:                                      │
│ ├─ stores.config.json system               │
│ ├─ Plugin parser system (3 types)          │
│ ├─ Generic formatter (eliminate duplication)│
│ ├─ Store loader & hot-reload               │
│ └─ Migrate all 6 stores                     │
│                                             │
│ Success: Add 7th store in 30 min (demo) ✓  │
│ Blocker?: FEAT-002 must be done             │
│ Impact?: THIS ENABLES ALL SCALABILITY       │
└─────────────────────────────────────────────┘
```

### Sprint 4: Optimization (5 pts - OPTIONAL)
```
┌─ SPRINT 4 (Days 8-10) ─────────────────┐
│ Capacity: 5 points (Optional)          │
│ Focus: Browser Pooling                 │
│                                        │
│ Tasks:                                 │
│ ├─ Browser pool (5-10 instances)       │
│ └─ Memory monitoring                   │
│                                        │
│ Optional?: YES - only if needed        │
│ Success: <200MB per browser            │
└────────────────────────────────────────┘
```

---

## 🚀 Execution Roadmap

```
Day 0: Setup
  ├─ Create GitHub issues (from checklist)
  ├─ Setup project board (Backlog→Done columns)
  └─ Assign Sprint 1 tasks

Day 1: Start
  ├─ Install Playwright
  ├─ Create playwright-adapter.ts
  └─ Write backoff logic

Day 2-3: Complete Sprint 1
  ├─ Error detection system
  ├─ Test Musimundo
  └─ Validate 85%+ success

Day 4-5: Execute Sprint 2
  ├─ Build router logic
  ├─ Error categorization
  └─ All 6 stores 85%+

Day 6-10: Execute Sprint 3 (Biggest sprint)
  ├─ stores.config.json system
  ├─ Plugin parser framework
  ├─ Generic formatter
  ├─ Migrate 6 stores
  └─ Demo: Add 7th store in 30 min

Day 10: Release v2.0.0
  ├─ Final testing
  ├─ Deploy to production
  └─ Documentation

Days 8-10 (Parallel): Optional Sprint 4
  ├─ Browser pooling (if needed)
  └─ Memory optimization
```

---

## ✅ Definition of Done (Epic Level)

```
✓ FEAT-001 completed and integrated
✓ FEAT-002 completed and integrated
✓ FEAT-003 completed (THE SCALABILITY FEATURE)
✓ All 6 stores migrated to config-driven
✓ Can add new store in 30 minutes (VALIDATED)
✓ Test coverage >80%
✓ Zero breaking changes
✓ Documentation complete
✓ Performance benchmarks met (<1GB RAM)
✓ Deployed to production

THEN: v2.0.0 RELEASED ✓
```

---

## 📞 Support & Escalation

### If Timeline Slips

| Scenario | Action |
|----------|--------|
| Sprint 1 slips 1 day | Add buffer to Sprint 2 start |
| Sprint 2 slips 2 days | Can still fit FEAT-003 within 10 days |
| Sprint 3 slips | FEAT-004 moves to v2.1.0 (optional anyway) |

### If Blockers Occur

| Blocker | Contingency |
|---------|------------|
| Playwright issues | Fallback to Puppeteer (similar API) |
| Memory problems | Implement browser pooling early |
| Some site blocks Playwright | Cheerio fallback works (already planned) |

---

## 🎓 Key Lessons from Roadmap

1. **Critical Path**: FEAT-001 → FEAT-002 → FEAT-003 (no parallelization)
2. **Scalability Magic**: Happens in FEAT-003 (config-driven architecture)
3. **Optional but Helpful**: FEAT-004 can be skipped if memory acceptable
4. **Low Risk**: Each feature has fallback strategy
5. **High Value**: $6000-7000 savings year 1, unlimited scalability

---

**Created**: 2025-01-10  
**Status**: ✅ Ready for Execution  
**Next**: Create GitHub issues and start Sprint 1
