# 📑 Roadmap - Mejorar Arquitectura de Scraping

## 🎯 Inicio Rápido

**¿Qué es esto?**  
Roadmap completo de 10 días para transformar scraping de $49-599/mes a $0, escalar a 50+ tiendas, agregar tienda en 30 minutos.

**¿De dónde empiezo?**
1. Lee este archivo (2 minutos)
2. Lee `RESUMEN.md` para contexto ejecutivo (5 minutos)
3. Lee `VISUAL-ROADMAP.md` para timeline visual (5 minutos)
4. Lee `project-plan.md` completo para detalles técnicos (15 minutos)
5. Usa `issues-checklist.md` para crear issues en GitHub (2 horas)

---

## 📂 Documentos Disponibles

### 1. **Este Archivo (Índice)**
- `README.md` (este archivo)
- Descripción: Punto de entrada rápido

### 2. **RESUMEN.md** - Resumen Ejecutivo (10 min read)
- Cambios de visión (antes/después)
- Deliverables completados
- Timeline de 10 días
- Próximos pasos
- **Lee esto si**: Quieres overview ejecutivo

### 3. **VISUAL-ROADMAP.md** - Timeline Visual (10 min read)
- Diagramas ASCII de sprints
- Feature breakdown con ASCII art
- Dependency flow completo
- Architecture transformation
- Success metrics
- **Lee esto si**: Prefieres visualización de timeline

### 4. **project-plan.md** - Plan Técnico Completo (30 min read) ⭐
- Epic definition detallada
- Jerarquía completa: Epic → Feature → Story → Enabler
- Acceptance criteria para cada item
- Risk assessment
- Sprint planning detallado
- KPIs y success metrics
- **Lee esto si**: Necesitas detalles técnicos completos

### 5. **issues-checklist.md** - Plantillas GitHub (1 hour read+execute)
- Plantillas para todas las issues
- Instrucciones de creación
- Setup de GitHub Project Board
- Checklist de pre-creación
- **Lee esto si**: Vas a crear issues en GitHub

---

## ⚡ Información Clave en 60 Segundos

### The Problem
```
Antes:
- Costo: $49-599/mes (no hay presupuesto)
- Tiendas: 6 máximo (hardcoded)
- Agregar tienda: 4-5 horas (muy lento)
- Confiabilidad: 70-80% (no es suficiente)
```

### The Solution
```
Después (10 días):
- Costo: $0/mes (Playwright MIT-licensed)
- Tiendas: 50+ (configuration-driven)
- Agregar tienda: 30 minutos (super rápido)
- Confiabilidad: 85-95% (mucho mejor)
```

### The Timeline
```
Sprint 1 (Days 1-3):   Playwright + Exponential Backoff (13 pts)
Sprint 2 (Days 4-5):   Fallback Router (8 pts)
Sprint 3 (Days 6-10):  Configuration-Driven Architecture (21 pts) ⭐
Sprint 4 (Days 8-10):  Browser Pooling (5 pts, OPTIONAL)
────────────────────────────────────────
Total: 47 story points, 10 days, 1 backend engineer
```

---

## 🎯 Epic Overview

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Costo/mes** | $49-599 | $0 |
| **Tiendas** | 6 | 50+ |
| **Tiempo/tienda** | 4-5 horas | 30 minutos |
| **Success rate** | 70-80% | 85-95% |
| **Scalabilidad** | No | Sí |
| **Config en código** | Sí | No (JSON) |

---

## 📊 4 Features (Fases)

### Feature 1: Playwright + Exponential Backoff ✅
- **Duration**: Days 1-3
- **Points**: 13
- **What**: Install Playwright, add smart retry logic, detect errors
- **Why**: Foundation - JS rendering + smart retries
- **Blocks**: FEAT-2

### Feature 2: Fallback Router 🔄
- **Duration**: Days 4-5  
- **Points**: 8
- **What**: Choose between Cheerio → Playwright → Cache automatically
- **Why**: Resilience - smart fallback based on error type
- **Blocks**: FEAT-3
- **Blocked by**: FEAT-1

### Feature 3: Configuration-Driven Architecture ⭐ (SCALABILITY!)
- **Duration**: Days 6-10
- **Points**: 21 (largest)
- **What**: stores.config.json, plugin parsers, generic formatter
- **Why**: THIS IS HOW WE SCALE - add store in 30 min, not 4-5 hours
- **Blocks**: v2.0.0 release
- **Blocked by**: FEAT-2

### Feature 4: Browser Pooling (OPTIONAL) 🚀
- **Duration**: Days 8-10 (parallel)
- **Points**: 5
- **What**: Pool 5-10 browser instances, monitor memory
- **Why**: Performance optimization (skip if not needed)
- **Blocked by**: FEAT-3
- **Optional**: YES

---

## 📋 Stories & Enablers (High Level)

### FEAT-1 Stories (13 pts total)
- **US-101** (3 pts): Install Playwright
- **US-102** (5 pts): Exponential backoff logic
- **US-103** (5 pts): Error detection
- **EN-101** (0 pts): Test with Musimundo

### FEAT-2 Stories (8 pts total)
- **US-201** (4 pts): Router implementation
- **US-202** (4 pts): Error categorization

### FEAT-3 Stories (21 pts total) ⭐
- **US-301** (5 pts): stores.config.json
- **US-302** (8 pts): Plugin parser system
- **US-303** (5 pts): Generic formatter
- **US-304** (3 pts): Store loader & hot-reload
- **EN-301** (8 pts): Migrate 6 stores to config

### FEAT-4 Stories (5 pts total - optional)
- **US-401** (3 pts): Browser pool
- **US-402** (2 pts): Memory monitoring

---

## 🚀 Próximos Pasos (Accionables)

### AHORA (30 min)
- [ ] Revisar este archivo (2 min)
- [ ] Revisar `RESUMEN.md` (5 min)
- [ ] Revisar `VISUAL-ROADMAP.md` (5 min)
- [ ] Aprobar timeline y estructura (18 min)

### HOY O MAÑANA (2 horas)
Seguir `issues-checklist.md`:
- [ ] Crear Epic issue #1
- [ ] Crear FEAT-001, US-101, US-102, US-103, EN-101 (Sprint 1)
- [ ] Crear FEAT-002, US-201, US-202 (Sprint 2)
- [ ] Crear FEAT-003, US-301-304, EN-301 (Sprint 3)
- [ ] (Opcional) Crear FEAT-004, US-401, US-402

### DESPUÉS (30 min)
- [ ] Setup GitHub project board "v2.0.0"
- [ ] Configure columns (Backlog→Ready→In Progress→Review→Done)
- [ ] Configure custom fields (Priority, Value, Phase, Points)

### LUEGO (immediate)
- [ ] Assign Sprint 1 issues to backend engineer
- [ ] Move to "In Progress"
- [ ] Start Sprint 1 (Day 1)

---

## 💡 Key Insights

### Why This Works

1. **Playwright is MIT-licensed** - Free forever, open source
2. **Exponential backoff** - Industry standard (Google/Microsoft)
3. **Configuration-driven** - Proven pattern (Netflix, Vimeo, etc.)
4. **Plugin architecture** - Flexible for future parsers
5. **Zero breaking changes** - Fully backward compatible

### Why 30 Minutes to Add Store

Before FEAT-3:
```
1. Add to stores.enum.ts (code change)
2. Write formatProductNewStore() (code change)
3. Write encodeNewStoreQuery() (code change)
4. Update scraper.ts router (code change)
5. Test extensively
6. Deploy app
Total: 4-5 hours
```

After FEAT-3:
```
1. Add JSON entry to stores.config.json
2. Define selectors in JSON
3. Done - auto-detected, auto-formatted
Total: 30 minutes
```

---

## 📈 Success Metrics

### Business
- ✅ Cost: $600-7000/year → $0
- ✅ Stores: 6 → 50+
- ✅ Time: 4-5 hours → 30 minutes

### Technical
- ✅ Success rate: 70-80% → 85-95%
- ✅ Test coverage: 60% → >85%
- ✅ Memory: <1GB total
- ✅ Zero breaking changes

---

## 🎓 Document Hierarchy

```
README.md (START HERE - you are here)
├─ RESUMEN.md (Executive summary, 10 min)
├─ VISUAL-ROADMAP.md (Timeline visualization, 10 min)
├─ project-plan.md (Complete technical plan, 30 min) ⭐
└─ issues-checklist.md (GitHub templates, 1 hour)
    └─ Use to create issues in GitHub
```

**Recommended reading order:**
1. This file (2 min)
2. RESUMEN.md (5 min)
3. VISUAL-ROADMAP.md (5 min)
4. project-plan.md (15 min) OR skip if pressed for time
5. issues-checklist.md (2 hours) - execute the checklist

---

## 🔍 Quick Reference

### By Role

**Project Manager**:
- Read: RESUMEN.md + VISUAL-ROADMAP.md
- Use: issues-checklist.md to create issues
- Track: GitHub project board "v2.0.0"

**Backend Engineer**:
- Read: project-plan.md (features you're building)
- Use: issues-checklist.md (detailed acceptance criteria)
- Execute: Sprint 1 first, then 2, then 3

**QA Engineer**:
- Read: project-plan.md (acceptance criteria section)
- Test: Against checklist in each issue
- Execute: Parallel testing with each feature

**Tech Lead**:
- Read: All documents
- Review: FEAT-3 architecture (configuration-driven)
- Approve: Risk assessment and timeline

---

## ❓ FAQ

**Q: ¿Realmente 10 días?**  
A: Sí, pero es timeline agresivo. Asume:
- 1 backend engineer full-time
- Sin interrupciones
- 0.5 QA engineer testing en paralelo
- Si hay issues, podría ser 12-14 días

**Q: ¿Que si algo se rompe?**  
A: Cada feature tiene fallback:
- FEAT-1 breaks? Use existing Cheerio (rollback easy)
- FEAT-2 breaks? Use cache (already exists)
- FEAT-3 breaks? Keep stores.enum.ts as backup (planned)

**Q: ¿FEAT-3 es realmente necesaria?**  
A: Sí si quieres verdadera escalabilidad. Sin FEAT-3:
- Agregar tienda sigue siendo 4-5 horas
- Solo tienes JS rendering + smart retries
- FEAT-3 ES lo que habilita escalabilidad

**Q: ¿Puedo saltar FEAT-4?**  
A: Sí. FEAT-4 es optimization, no feature. Solo si:
- Memory >200MB per browser, O
- System RAM becomes constraint

**Q: ¿Cuándo release a producción?**  
A: Day 10, después FEAT-3 completado.
FEAT-4 es opcional y podría ir a v2.1.0

---

## 📞 Support

### If you need...

| Need | Location |
|------|----------|
| **Executive summary** | RESUMEN.md |
| **Visual timeline** | VISUAL-ROADMAP.md |
| **Technical details** | project-plan.md |
| **GitHub templates** | issues-checklist.md |
| **Dependency map** | VISUAL-ROADMAP.md + project-plan.md |
| **Success metrics** | RESUMEN.md o project-plan.md |

---

## ✅ Checklist to Start

- [ ] Read this file (README.md)
- [ ] Read RESUMEN.md
- [ ] Read VISUAL-ROADMAP.md
- [ ] Skim project-plan.md
- [ ] Approve timeline (10 days OK?)
- [ ] Approve features (4 fases OK?)
- [ ] Create GitHub issues (using issues-checklist.md)
- [ ] Setup GitHub project board
- [ ] Assign Sprint 1 tasks
- [ ] Start Day 1

---

## 🎉 What You're Getting

✅ Epic definition (complete)  
✅ Features desglosadas (4 features)  
✅ User stories con AC (12 stories)  
✅ Technical enablers (2 enablers)  
✅ GitHub issue templates (ready to use)  
✅ Sprint planning (Days 1-10)  
✅ Risk assessment (complete)  
✅ Success metrics (KPIs defined)  
✅ Dependency map (visualized)  
✅ Execution plan (step-by-step)  

**All you need to do**: Create issues in GitHub and execute sprints.

---

**Status**: ✅ Ready for Execution  
**Created**: 2025-01-10  
**Last Updated**: 2025-01-10  
**Next Step**: Create GitHub issues

👉 **Start here**: Read `RESUMEN.md` next (5 min summary)
