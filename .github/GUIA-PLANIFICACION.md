# Guía de Planificación de Roadmap - Paso a Paso

## Introducción

Esta guía te explica cómo usar los 5 recursos que instalamos para planificar un roadmap detallado, investigar soluciones técnicas y crear un proyecto en GitHub con todas las tareas necesarias.

El flujo completo es:
1. **Definir qué cambios quieres** → Usar Task Researcher para investigar
2. **Crear roadmap detallado** → Usar breakdown-plan prompt
3. **Desglosar features en tareas** → Usar breakdown-feature-implementation prompt
4. **Crear issues en GitHub** → Usar create-github-issues prompt
5. **(Opcional) Organizar prioridades** → Usar task-planner agent

---

## Recurso 1: Task Researcher Agent (@task-researcher)

### ¿Qué es?
Un agente especializado en **investigar técnicamente** la mejor solución para cada cambio que quieras implementar. No hace el trabajo, solo investiga y propone.

### ¿Cuándo usarlo?
- **Cuando tienes una idea pero no sabes la mejor forma de implementarla**
- Cuando necesitas comparar diferentes enfoques técnicos
- Antes de empezar a planificar features complejas
- Cuando quieres saber qué tecnologías o librerías usar

### ¿Cómo usarlo?

**Ejemplo 1: Investigar cómo mejorar el scraping**
```
@task-researcher

Investiga la mejor forma de mejorar el scraping de productos. 
Necesito saber:
1. Qué herramientas/librerías usar
2. Cómo manejar errores y reintentos
3. Cómo cachear datos para no saturar servidores
4. Cómo paralelizar los scrapes
```

**Ejemplo 2: Investigar autenticación**
```
@task-researcher

Investiga cómo implementar autenticación de usuarios en la app.
Considera:
1. Stack Auth vs NextAuth vs Auth0
2. Almacenamiento seguro de tokens
3. Integración con la API actual
4. Cómo proteger endpoints
```

### Qué obtendrás
- Un análisis detallado con ventajas y desventajas
- Recomendación de la mejor solución
- Ejemplos de implementación
- Referencias a documentación oficial

### Output
Los hallazgos se guardan en `./.copilot-tracking/research/` con el patrón:
- `YYYYMMDD-task-description-research.md`

**Ejemplo:** `20251204-mejorar-scraping-research.md`

---

## Recurso 2: Breakdown Plan Prompt (#file:.github/prompts/breakdown-plan.prompt.md)

### ¿Qué es?
Un prompt que genera un **roadmap completo y detallado** organizando todo en:
- **Epics** (grandes capabilidades)
- **Features** (funcionalidades entregables)
- **User Stories** (requisitos del usuario)
- **Enablers** (trabajo técnico/infraestructura)
- **Tests** (validación)

### ¿Cuándo usarlo?
- **Después de investigar con Task Researcher**
- Cuando quieres tener una visión completa de todos los cambios
- Para organizar el trabajo en sprints/fases
- Para identificar dependencias entre tareas

### ¿Cómo usarlo?

**Paso 1: Prepara la información**
Necesitas tener clara:
- Qué cambios quieres hacer
- Cuál es el objetivo
- Qué historias de usuario cubre
- Qué trabajo técnico requiere

**Paso 2: Usa el prompt**
```
#file:.github/prompts/breakdown-plan.prompt.md

Aquí está mi roadmap que quiero desglosar:

CAMBIO 1: Mejorar el scraping
- Objetivo: Aumentar velocidad y confiabilidad
- Historias de usuario:
  - Como usuario, quiero que se actualicen los productos más rápido
  - Como usuario, quiero que el scraping sea más confiable (sin errores)
- Trabajo técnico:
  - Investigar librerías de scraping modernas
  - Implementar reintentos y caché
  - Paralelizar scrapes

CAMBIO 2: Agregar autenticación
- Objetivo: Permitir que usuarios guarden favoritos
- Historias de usuario:
  - Como usuario, quiero crear cuenta y login
  - Como usuario, quiero que se guarden mis favoritos
- Trabajo técnico:
  - Configurar Stack Auth o NextAuth
  - Crear endpoints para usuario
  - Proteger endpoints
```

### Qué obtendrás
- Epic definido con descripción y aceptación criteria
- Features desglosadas
- User Stories con statements claros
- Enablers técnicos identificados
- Dependencias mapeadas
- Estimaciones (story points)
- Priorización (P0, P1, P2)

### Output
Se genera un documento estructura en:
- `/docs/ways-of-work/plan/{epic-name}/{feature-name}/project-plan.md`
- `/docs/ways-of-work/plan/{epic-name}/{feature-name}/issues-checklist.md`

---

## Recurso 3: Breakdown Feature Implementation Prompt

### ¿Qué es?
Un prompt que toma **una feature específica** y la desglosa en un **plan de implementación técnico detallado** con:
- Arquitectura del sistema
- Diseño de base de datos
- Endpoints de API
- Estructura de componentes
- Consideraciones de seguridad

### ¿Cuándo usarlo?
- **Después de tener el roadmap del Breakdown Plan**
- Para cada feature que vayas a implementar
- Cuando necesitas detalles técnicos específicos
- Antes de empezar a codificar

### ¿Cómo usarlo?

**Paso 1: Elige una feature del roadmap**
Por ejemplo: "Agregar autenticación"

**Paso 2: Prepara la Feature PRD**
Crea un documento con:
- Descripción de la feature
- Requisitos funcionales
- Requisitos técnicos
- Aceptancia criteria

**Paso 3: Usa el prompt**
```
#file:.github/prompts/breakdown-feature-implementation.prompt.md

Feature PRD:

## Feature: Autenticación de Usuarios

### Descripción
Permitir que usuarios se registren, hagan login y guarden favoritos.

### Requisitos Funcionales
- Registro con email y contraseña
- Login / Logout
- Recuperación de contraseña
- Perfil de usuario

### Requisitos Técnicos
- Usar Stack Auth
- Base de datos PostgreSQL
- JWT para tokens
- Refresh tokens con rotación

### Acceptance Criteria
- [ ] Usuarios pueden registrarse
- [ ] Usuarios pueden hacer login
- [ ] Tokens se almacenan de forma segura
- [ ] Sesión persiste entre recargas
- [ ] Logout limpia tokens
```

### Qué obtendrás
- Diagrama de arquitectura del sistema
- Diseño de base de datos (ERD)
- Endpoints de API completos
- Estructura de componentes frontend
- Consideraciones de seguridad
- Plan de caching y performance

### Output
Se genera en:
- `/docs/ways-of-work/plan/{epic-name}/{feature-name}/implementation-plan.md`

---

## Recurso 4: Create GitHub Issues Prompt

### ¿Qué es?
Un prompt que automatiza la **creación de issues en GitHub** a partir del plan de implementación. Crea:
- 1 issue por cada fase de implementación
- Descripción clara de cada tarea
- Labels automáticos
- Linked issues

### ¿Cuándo usarlo?
- **Cuando ya tienes el implementation plan listo**
- Cuando quieres empezar a trackear el trabajo en GitHub
- Para convertir el plan en tareas concretas
- Cuando necesitas organizar el trabajo en el proyecto

### ¿Cómo usarlo?

**Paso 1: Asegúrate de tener el implementation plan**
Debería estar en:
- `/docs/ways-of-work/plan/{epic-name}/{feature-name}/implementation-plan.md`

**Paso 2: Usa el prompt**
```
#file:.github/prompts/create-github-issues-feature-from-implementation-plan.prompt.md

File: /docs/ways-of-work/plan/autenticacion/login/implementation-plan.md
```

**O con más contexto:**
```
#file:.github/prompts/create-github-issues-feature-from-implementation-plan.prompt.md

Crea issues en GitHub para el plan de implementación en:
/docs/ways-of-work/plan/autenticacion/login/implementation-plan.md

El Epic padre es: "Agregar Autenticación"
Prioridad: P1 (alta)
```

### Qué obtendrás
- Issues creados automáticamente en tu repo
- Cada fase es un issue separado
- Linked a la Feature principal
- Con labels: feature, priority, component
- En el GitHub Project board

### Output
Los issues se crean directamente en tu repositorio GitHub

---

## Recurso 5: Task Planner Agent (@task-planner) - OPCIONAL

### ¿Qué es?
Un agente que ayuda a **organizar y priorizar** tareas cuando el roadmap es muy grande o complejo.

### ¿Cuándo usarlo?
- **Cuando tienes muchas features y necesitas priorizar**
- Cuando hay dependencias complejas
- Cuando necesitas distribuir el trabajo en sprints
- Para validar que el plan es realista

### ¿Cómo usarlo?

```
@task-planner

Tengo estos cambios planeados:
1. Mejorar scraping (15 story points)
2. Agregar autenticación (13 story points)
3. Sistema de favoritos (8 story points)
4. Notificaciones (5 story points)

Mi capacidad es 20 story points por sprint (2 semanas).
¿Cómo debería organizar el trabajo en sprints?
¿Hay dependencias que deba considerar?
```

### Qué obtendrás
- Plan de sprints
- Identificación de dependencias críticas
- Recomendación de orden de implementación
- Identificación de riesgos

---

## Flujo Completo: Paso a Paso

### Fase 1: Investigación (1-2 días)

**Paso 1:** Define qué cambios quieres hacer
```
Cambio 1: Mejorar scraping
Cambio 2: Agregar autenticación
Cambio 3: Sistema de favoritos
```

**Paso 2:** Usa `@task-researcher` para investigar cada cambio
```
@task-researcher

Investiga cómo mejorar el scraping...
[espera resultado]

@task-researcher

Investiga cómo implementar autenticación...
[espera resultado]
```

**Output:** Tienes investigación técnica en `./.copilot-tracking/research/`

---

### Fase 2: Planificación del Roadmap (1 día)

**Paso 3:** Usa `breakdown-plan.prompt.md` con toda la información
```
#file:.github/prompts/breakdown-plan.prompt.md

[Proporciona detalles de los cambios]
```

**Output:** 
- Roadmap completo con epics, features, stories
- Estimaciones y prioridades
- Dependencias identificadas

---

### Fase 3: Planes de Implementación (2-3 días)

**Paso 4:** Para cada feature, usa `breakdown-feature-implementation.prompt.md`
```
#file:.github/prompts/breakdown-feature-implementation.prompt.md

Feature PRD: [detalles técnicos]
```

**Repite para cada feature importante**

**Output:**
- Implementation plans detallados
- Diagramas de arquitectura
- Especificaciones completas

---

### Fase 4: Crear Issues en GitHub (2 horas)

**Paso 5:** Usa `create-github-issues.prompt.md` para cada feature
```
#file:.github/prompts/create-github-issues-feature-from-implementation-plan.prompt.md

File: /docs/ways-of-work/plan/.../implementation-plan.md
```

**Output:**
- Issues creados en GitHub
- Listo para empezar a trabajar

---

### Fase 5: Organizar (Opcional - 1 día)

**Paso 6:** Usa `@task-planner` si necesitas priorizar mejor
```
@task-planner

Aquí están mis cambios... ¿Cómo los organizo en sprints?
```

**Output:**
- Plan de sprints
- Priorización optimizada

---

## Ejemplo Real: Paso a Paso Completo

### Tu caso: Mejorar la app de scraping

**Día 1: Investigación**
```
@task-researcher

Investiga cómo mejorar el scraping de electrónica:
- Velocidad
- Confiabilidad
- Manejo de cambios en sitios web
- Caching inteligente
```

Resultado: Documento de investigación con mejores prácticas.

**Día 2: Roadmap**
```
#file:.github/prompts/breakdown-plan.prompt.md

Epic: Mejorar plataforma de scraping

Feature 1: Scraping más rápido
- Paralelizar peticiones
- Implementar caché
- Usar mejor librería

Feature 2: Scraping más confiable
- Reintentos con backoff
- Manejo de errores
- Notificaciones de fallos

Feature 3: Dashboard de monitoreo
- Ver estado de scrapes
- Alertas
- Logs
```

Resultado: Roadmap completo.

**Día 3-4: Planes técnicos**
```
#file:.github/prompts/breakdown-feature-implementation.prompt.md

Feature: Scraping más rápido
[Detalles técnicos]

#file:.github/prompts/breakdown-feature-implementation.prompt.md

Feature: Scraping más confiable
[Detalles técnicos]
```

Resultado: Planes con arquitectura, DB, APIs.

**Día 5: GitHub Issues**
```
#file:.github/prompts/create-github-issues-feature-from-implementation-plan.prompt.md

[Para cada feature, crear issues]
```

Resultado: Issues listos en GitHub.

**Día 6: Organizar (opcional)**
```
@task-planner

[Organizar en sprints si es necesario]
```

Resultado: Plan de sprints para ejecutar.

---

## Tips Importantes

### ✅ Hacer bien

- **Ser específico:** Dale al Task Researcher detalles claros
- **Investigar primero:** No saltees la fase de investigación
- **Documentar:** Guarda los findings en los documentos
- **Iterar:** Si el plan no te gusta, ajusta y regenera
- **Usar GitHub Project:** Crea un proyecto en GitHub para trackear

### ❌ Evitar

- No investigues todo de una vez - hazlo por cambios
- No saltees phases - la investigación es importante
- No ignores las dependencias - map them first
- No crees 100 issues - agrupa tareas similares
- No sobre-estimes - sé realista con story points

---

## Estructura de Carpetas Que Se Genera

```
.github/
├── agents/
│   ├── task-researcher.agent.md
│   └── task-planner.agent.md
├── prompts/
│   ├── breakdown-plan.prompt.md
│   ├── breakdown-feature-implementation.prompt.md
│   └── create-github-issues-feature-from-implementation-plan.prompt.md

docs/
└── ways-of-work/
    └── plan/
        └── {epic-name}/
            └── {feature-name}/
                ├── project-plan.md
                ├── issues-checklist.md
                └── implementation-plan.md

.copilot-tracking/
└── research/
    ├── 20251204-mejorar-scraping-research.md
    ├── 20251204-autenticacion-research.md
    └── ...
```

---

## Próximos Pasos

1. ¿Cuál es el cambio más importante que quieres hacer?
2. Usa `@task-researcher` para investigarlo
3. Luego seguimos con el roadmap

¿Por dónde quieres empezar? 🚀
