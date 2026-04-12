# Figma Redesign — Contexto de sesión

> Última actualización: 2026-04-11
> Estado: **EN EJECUCIÓN** — ver sección Plan/Progreso
> Usar este archivo para retomar si el chat se cae.

---

## Figma

- **File key:** `YTsPttJTYUclnJIkAUZ9fj`
- **URL:** https://www.figma.com/design/YTsPttJTYUclnJIkAUZ9fj/Scraping-Electronica---Design-System
- **Node componentes:** `5:2` (página 🧩 Components)

---

## Páginas del archivo

| ID  | Nombre           | Estado                                      |
|-----|------------------|---------------------------------------------|
| 0:1 | 📸 Current UI    | Frame 1358×602 con captura de la UI actual  |
| 5:2 | 🧩 Components    | Componentes corregidos, canvas reorganizado |
| 5:3 | 🖥️ Screens       | ✅ 3 screens con instancias reales: Desktop (49:2, 1280×858), Tablet (50:63, 768×1114), Mobile (50:148, 390×966) |

---

## Tokens existentes en Figma

### Colors — colección `VariableCollectionId:5:4`

| Variable | ID | Light (hex) | Dark (hex) |
|---|---|---|---|
| Background | 5:5 | `#ffffff` | `#09090b` |
| Foreground | 5:6 | `#0a0a11` | `#fafafa` |
| Primary | 5:7 | `#16a34a` | `#22c55e` |
| Primary-Foreground | 5:8 | `#fef3f4` | `#052e16` |
| Secondary | 5:9 | `#f4f4f5` | `#27272a` |
| Secondary-Foreground | 5:10 | `#1a191d` | `#fafafa` |
| Muted | 5:11 | `#f4f4f5` | `#27272a` |
| Muted-Foreground | 5:12 | `#757576` | `#a1a1aa` |
| Destructive | 5:13 | `#ef4444` | `#ef4444` |
| Border | 5:14 | `#e4e4e7` | `#27272a` |
| Card | 5:15 | `#ffffff` | `#18181b` |
| Card-Foreground | 5:16 | `#0a0a11` | `#fafafa` |
| Price-Green | 5:17 | `#16a34a` | `#22c55e` |
| Orange-500 | 5:18 | `#f97316` | `#f97316` |
| Green-50 | 5:19 | `#f0fdf4` | `#052e16` |
| Surface | 5:20 | `#fafafa` | `#18181b` |

> Light mode ID: `5:0` — Dark mode ID: `30:0`

### Typography — colección `VariableCollectionId:31:2` (modo `Base` ID `31:0`)

| Grupo | Variable | ID | Valor |
|---|---|---|---|
| size | xs | 31:3 | 12px |
| size | sm | 31:4 | 14px |
| size | base | 31:5 | 16px |
| size | lg | 31:6 | 18px |
| size | xl | 31:7 | 20px |
| size | 2xl | 31:8 | 24px |
| size | 3xl | 31:9 | 30px |
| size | 4xl | 31:10 | 36px |
| line-height | tight | 31:11 | 20px |
| line-height | snug | 31:12 | 24px |
| line-height | normal | 31:13 | 28px |
| line-height | relaxed | 31:14 | 32px |
| line-height | loose | 31:15 | 40px |
| weight | regular | 31:16 | 400 |
| weight | medium | 31:17 | 500 |
| weight | semibold | 31:18 | 600 |
| weight | bold | 31:19 | 700 |

### Spacing (10 variables) — `VariableCollectionId:5:21`
`1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=20px, `6`=24px, `8`=32px, `10`=40px, `12`=48px, `16`=64px

### Radius (7 variables) — `VariableCollectionId:5:32`
`none`=0, `sm`=4, `md`=6, `lg`=8, `xl`=12, `2xl`=16, `full`=9999

### Tokens pendientes
- [x] ~~Dark mode en Colors~~ → modo `Dark` creado, ID `30:0`
- [x] ~~Typography~~ → colección `VariableCollectionId:31:2` creada (17 vars)
- [ ] Shadows
- [ ] Z-index

---

## Componentes en 🧩 Components

### Organización Atomic Design (3 secciones)

```
ATOMS     130:2  w=246  h=242  @ x=8, y=40
MOLECULES 130:3  w=600  h=278  @ x=8, y=442   (40+242+160)
ORGANISMS 151:2  w=1360 h=1404 @ x=8, y=880   (442+278+160)
```

#### Constantes de spacing (confirmadas con screenshots)
```
TITLE       = 56px   // altura real del title bar de sección en Figma
LABEL       = 24px   // etiqueta de nombre de componente
BUFFER      = 16px   // breathing room
firstChildY = 96px   // TITLE + LABEL + BUFFER
ROW_GAP     = 56px   // 24px label + 32px gap entre filas
COL_GAP     = 24px   // entre columnas
SECT_GAP    = 160px  // entre secciones
PAD         = 40px   // padding lateral/inferior
```

> `resizeWithoutConstraints(w, h)` — requerido para nodos SECTION (`.resize()` lanza error)

#### ATOMS — `130:2`
| ID   | Nombre              | Tamaño  | Pos (dentro sección) |
|------|---------------------|---------|----------------------|
| 6:3  | StoreChip/Default   | 71×28   | x=40, y=96           |
| 6:5  | StoreChip/Selected  | 71×28   | x=135, y=96          |
| 6:8  | Badge/Installment   | 129×22  | x=40, y=180          |

#### MOLECULES — `130:3`
| ID    | Nombre               | Tamaño  | Pos (dentro sección) |
|-------|----------------------|---------|----------------------|
| 6:11  | SearchBar            | 520×46  | x=40, y=96           |
| 116:3 | BrandFilter trigger  | auto×36 | x=40, y=198          |
| 116:5 | MissionModal/Trigger | auto×40 | x=145, y=198         |

#### ORGANISMS — `151:2`
| ID     | Nombre               | Tamaño   | y (dentro sección) |
|--------|----------------------|----------|--------------------|
| 6:31   | Header               | 1280×68  | 96                 |
| 116:2  | Footer               | 1280×64  | 192                |
| 6:18   | ProductCard          | 220×287  | 312 (fila cards)   |
| 51:2   | SkeletonCard         | 220×287  | 312 (fila cards)   |
| 116:4  | BrandFilter/Dropdown | 200×auto | 312 (fila cards)   |
| 51:10  | EmptyState           | 520×300  | 655 (fila states)  |
| 116:6  | MissionModal/Dialog  | 425×auto | 655 (fila states)  |
| 53:2   | ErrorAlert           | 520×68   | 1011               |
| 63:2   | Disclaimer           | 920×96   | 1135               |
| 116:7  | StoresList           | 560×auto | 1288               |

#### Detalles de componentes
| ID    | Nombre              | Notas                                               |
|-------|---------------------|-----------------------------------------------------|
| 6:3   | StoreChip/Default   | tokenizado                                          |
| 6:5   | StoreChip/Selected  | tokenizado                                          |
| 6:8   | Badge/Installment   | tokenizado                                          |
| 6:11  | SearchBar           | InputField, SearchIcon, SearchButton                |
| 6:18  | ProductCard         | 220×287, imagen full-width, tokenizado              |
| 6:31  | Header              | 1280×68, LogoArea, LogoBadge, Actions, DarkModeToggle (47:2) |
| 51:2  | SkeletonCard        | ImageSkeleton + 5 líneas ContentSkeleton            |
| 51:10 | EmptyState          | EmptyIcon + título + subtitle                       |
| 53:2  | ErrorAlert          | bg #fef2f2, ErrorIcon rojo, bound a Destructive (5:13) |
| 63:2  | Disclaimer          | bg orange-100, border orange-300, botón ×           |
| 116:2 | Footer              | bg green-200, CafecitoButton amber right            |
| 116:3 | BrandFilter trigger | botón verde, caret icon                             |
| 116:4 | BrandFilter/Dropdown| SearchInput + divider + 5 brand items               |
| 116:5 | MissionModal/Trigger| botón verde "¿QUIÉN DA MENOS?" uppercase            |
| 116:6 | MissionModal/Dialog | título bold, 2 párrafos, X close                   |
| 116:7 | StoresList          | store icon + "Tiendas consultadas en:" + 🇦🇷        |
| 47:2  | DarkModeToggle      | sub-comp en Header, 44×24px pill                    |

> **Problema original resuelto:** `SearchBar`, `ProductCard`, `Header` tenían `counterAxisSizingMode: FIXED` a 10px con children con y negativo. Fix: `counterAxisSizingMode = "AUTO"`.

---

## UI Actual (📸 Current UI)

- **Header:** logo (pizza rotado 45°) + botón "¿QUIÉN DA MENOS?" + dark mode toggle
- **Disclaimer:** alert naranja "Aviso importante" (dismissable)
- **SearchBar:** input + botón verde "Buscar"
- **BrandFilter + StoresList**
- **ProductList:** grid de cards
- **Footer:** botón "Invitame un Cafecito" (bottom right)

### Paleta visual actual
- Verde primario: `#22c55e` (Tailwind `green-500`)
- Naranja accent: badge de cuotas + disclaimer
- Background: blanco / gris claro en dark

---

## Stack del proyecto

- **Framework:** Next.js App Router + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Componentes:** `src/components/`
- **Tokens Tailwind:** CSS variables en `src/app/globals.css`
- **Tokens deben mapear** directamente a variables CSS de shadcn (`--background`, `--primary`, etc.)

---

## Plan acordado

### Rol: UX/UI Senior — rediseño completo tokenizado

### Decisiones tomadas
- **Estilo:** "Clean Commerce Dark" — Vercel Dashboard + MercadoLibre simplified
- **Font:** Geist (ya en codebase)
- **Dark mode:** desde cero, true-black (`#09090b` base)
- **Breakpoints:** Mobile 390px, Tablet 768px, Desktop 1280px (ya existen en Figma)
- **Approach:** Refactor screens existentes (no rebuild)
- **Decisiones de diseño:** delegadas al agente

### Progreso

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Inspeccionar valores actuales Colors | ✅ done |
| 2 | Agregar modo Dark a colección Colors | ✅ done |
| 3 | Crear colección Typography | ✅ done |
| 4 | Verificar tokens en componentes | ✅ done |
| 5 | Vincular tokens a componentes existentes | ✅ done (25 bindings) |
| 6 | Redesign ProductCard | ✅ done (220×287, imagen full-width, tokenizado) |
| 7 | Reconectar screens con instancias | ✅ done (Desktop 1280px + Tablet 768px + Mobile 390px, todos en `5:3`) |
| 8 | Estados: Empty, Loading, Error | ✅ done (SkeletonCard 51:2, EmptyState 51:10, ErrorAlert 53:2 — en Components page) |
| + | Cards con datos reales | ✅ done — 12 cards con texto (Sony/Samsung/Apple/Xiaomi) + gradientes de imagen |
| + | Dark mode screens | ✅ done — Desktop Dark 59:172, Tablet Dark 61:233, Mobile Dark 61:257 (variable mode override) |
| + | Disclaimer component | ✅ done — 63:2 en Components page, 920×96, orange palette |
| + | Loading screen | ✅ done — 64:342 en Screens page, SkeletonCards + "Buscando resultados..." |
| + | Empty State screen | ✅ done — 143:516 en Screens page, 1280×858 @ x=0 y=2336 (Header+EmptyState+Footer) |
| + | Error State screen | ✅ done — 143:541 en Screens page, 1280×858 @ x=0 y=3354 (Header+ErrorAlert+Footer) |
| + | Loading State Dark | ✅ done — 144:553 en Screens page, 1280×858 @ x=2918 y=1318 (dark mode variable override) |
| + | Typography tokens binding | ✅ done — 23 text nodes vinculados a variables size/xs→4xl en 8 componentes |
| + | Atomic Design org | ✅ done — 9 secciones → ATOMS (130:2) / MOLECULES (130:3) / ORGANISMS (151:2), spacing firstChildY=96px |

---

## Cómo retomar esta sesión

```
Tengo el archivo figma-redesign-context.md en docs/.
Figma file key: YTsPttJTYUclnJIkAUZ9fj
Estábamos rediseñando el sitio en Figma como UX/UI Senior.
Rol: agente toma todas las decisions de diseño.
Estilo: Clean Commerce Dark (Geist, true-black dark, primary green #22c55e).
Colors: valores Light inspeccionados, Dark palette definida en tabla del doc.
Siguiente paso: ver tabla Progreso y continuar desde el primer pendiente.
Colección Colors ID: VariableCollectionId:5:4, Light mode ID: 5:0
Screens page ID 5:3 — refactor (no rebuild), tiene Mobile/Tablet/Desktop ya.
Caveman mode activo en español.
```
