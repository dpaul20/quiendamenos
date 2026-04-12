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

---

## Plan de Mejoras UI — Implementación en Código

> Generado: 2026-04-12 | Análisis basado en tendencias 2026 aplicables al producto
> Filosofía: **precio es el protagonista** — es una app de comparación, no un catálogo visual
> Principio: eliminar > agregar. Cada cambio tiene un "por qué".

### Diagnóstico — Problemas confirmados en código

| Archivo | Línea | Problema | Severidad |
|---------|-------|---------|-----------|
| `page.tsx` | 12 | `h-screen` corta contenido en mobile con muchos productos | Alta |
| `page.tsx` | 13 | `space-y-4 py-2` = 8px entre secciones. Asfixiante | Alta |
| `ProductList.tsx` | 61 | `animate-pulse` en texto de loading — prohibido (crea ansiedad visual) | Media |
| `ProductList.tsx` | 82 | `shadow-md hover:shadow-lg transition-shadow` — hover de sombra prohibido | Media |
| `ProductList.tsx` | 82 | Card layout horizontal: imagen 100×100 a la izquierda. La imagen no es protagonista | Alta |
| `ProductList.tsx` | 100 | `text-green-600` — Tailwind directo, no token. Se rompe en dark mode customize | Alta |
| `ProductList.tsx` | 71-79 | Loading = logo girando fullscreen. No da feedback de progreso real | Alta |
| `ProductList.tsx` | 68 | Grid plano `lg:grid-cols-3`. Primer resultado (más barato) tiene misma jerarquía que el último | Media |
| `StoresList.tsx` | 22 | `shadow-md rounded-lg` — patrón shadow prohibido | Baja |

---

### F1 — Page Container (`src/app/page.tsx`)

**Decisión:** Cambiar estructura base de la página.

**Problemas:**
- `h-screen` fuerza todo en viewport → con productos llena la pantalla y corta el Footer
- `space-y-4 py-2` = demasiado comprimido para una UI de consulta sostenida
- `max-w-5xl` es correcto pero el padding lateral `px-4` en mobile es insuficiente

**Cambios:**

```tsx
// ANTES
<main className="h-screen flex flex-col justify-between">
  <div className="w-full max-w-5xl flex flex-col mx-auto space-y-4 px-4 py-2">

// DESPUÉS
<main className="min-h-screen flex flex-col">
  <div className="w-full max-w-5xl flex flex-col mx-auto space-y-6 px-4 py-6 md:py-8 flex-1">
```

**Además:** mover `<Footer />` fuera del div interior para que siempre cierre la página:

```tsx
// ANTES
<main className="h-screen flex flex-col justify-between">
  <div ...>
    ...
    <ProductList />
  </div>
  <Footer />
</main>

// DESPUÉS
<main className="min-h-screen flex flex-col">
  <div className="w-full max-w-5xl flex flex-col mx-auto space-y-6 px-4 py-6 md:py-8 flex-1">
    ...
    <ProductList />
  </div>
  <Footer />
</main>
```

**Resultado:** Footer siempre al fondo pero la página hace scroll natural cuando hay productores.

---

### F2 — ProductCard Redesign (`src/components/ProductList.tsx`)

**Decisión de diseño: el PRECIO es el protagonista.** Esta app responde a "¿quién da menos?". El precio debe ser lo primero que el ojo encuentra.

**Problema con layout actual:**
```
[Título uppercase pequeño]
[Imagen 100×100 izq] | [Precio, Marca, Logo tienda, Badge cuotas]
```
La imagen compite visualmente pero el contenedor limita el tamaño a 100px. El resultado es que ni la imagen ni el precio tienen peso visual dominante — todo tiene el mismo tono, clásico AI-generated feel.

**Nueva estructura vertical:**
```
[Imagen — aspect-square, full-width, fondo muted para productos]
[Padding interno:]
  [Store logo chip — top right corner, pequeño, 24px]
  [Título — 2 líneas max, text-sm, muted]
  [PRECIO — text-2xl font-bold text-primary, protagonista]
  [Fila bottom: Marca (muted-foreground) | Badge cuotas (orange)]
```

**Regla de jerarquía aplicada:**
- Precio: 120 puntos de importancia
- Imagen: 80 puntos (reconocimiento del producto)
- Título: 60 puntos (ya saben lo que buscaron)
- Marca / cuotas: 40 puntos (dato secundario)

**Cambios en el Card:**

```tsx
// ANTES
<Card
  className="flex flex-col items-center justify-between gap-1 rounded-xl p-2 shadow-md transition-shadow duration-300 hover:shadow-lg lg:p-4"
>
  <Link href={product.url} target="_blank">
    <h3 className="text-center text-xs font-semibold uppercase tracking-tight lg:text-base">
      {product.name}
    </h3>
  </Link>
  <div className="flex w-full flex-row justify-between gap-1">
    <Image
      loader={imageLoader}
      src={product.image}
      alt={product.name ?? "Product image"}
      width={100}
      height={100}
      className="object-contain"
    />
    <div className="flex flex-col justify-between gap-1">
      <div className="flex flex-col items-center justify-between gap-1">
        <p className="text-sm font-bold text-green-600 lg:text-2xl">
          {product.price.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </p>
        <span className="text-center text-xs uppercase text-muted-foreground lg:text-sm">
          {product.brand}
        </span>
      </div>
      <div className="mx-auto max-h-6 max-w-max rounded-md bg-primary px-2 py-1 text-primary-foreground">
        <Image src={storeLogos[product.from]} alt={product.from} className="h-full w-full object-contain" />
      </div>
      {product?.installment ? (
        <Badge className="mx-auto bg-orange-500 text-xs lg:text-sm">
          {product.installment} cuotas sin interés
        </Badge>
      ) : null}
    </div>
  </div>
</Card>

// DESPUÉS
<Card
  key={product.url}
  className={cn(
    "flex flex-col overflow-hidden rounded-xl border border-border transition-colors duration-200 hover:border-primary/30",
    index === 0 && "ring-1 ring-primary/40"  // primer resultado = más barato, leve highlight
  )}
>
  {/* Imagen: protagonista visual secundario */}
  <Link href={product.url} target="_blank" className="block">
    <div className="relative aspect-square w-full bg-muted">
      <Image
        loader={imageLoader}
        src={product.image}
        alt={product.name ?? "Product image"}
        fill
        className="object-contain p-3"
      />
      {/* Store logo — chip overlay esquina inferior derecha */}
      <div className="absolute bottom-2 right-2 rounded bg-background/90 p-1 shadow-sm">
        <Image
          src={storeLogos[product.from]}
          alt={product.from}
          width={48}
          height={16}
          className="h-4 w-auto object-contain"
        />
      </div>
    </div>
  </Link>

  {/* Contenido: precio protagonista */}
  <div className="flex flex-col gap-1 p-3">
    <Link href={product.url} target="_blank">
      <h3 className="line-clamp-2 text-xs text-muted-foreground leading-snug">
        {product.name}
      </h3>
    </Link>

    {/* PRECIO — elemento protagonista 120/100 */}
    <p className="text-xl font-bold text-primary leading-tight">
      {product.price.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
    </p>

    {/* Fila bottom: marca + badge cuotas */}
    <div className="flex items-center justify-between gap-1 mt-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {product.brand}
      </span>
      {product?.installment ? (
        <Badge className="bg-orange-500 text-[10px] px-1.5 py-0 leading-5">
          {product.installment}× sin interés
        </Badge>
      ) : null}
    </div>
  </div>
</Card>
```

**Imports adicionales necesarios:**
```tsx
import { cn } from "@/lib/utils";
// index en el map:
filteredProducts.map((product, index) => {
```

**Por qué `ring-1 ring-primary/40` en index===0:**
Los productos están ordenados por menor precio (`sorts.ts`). El primer resultado es la mejor oferta. Un ring verde sutil lo señala sin gritar — jerarquía sin romper la grilla.

**Por qué eliminar `shadow-md hover:shadow-lg`:**
Las sombras coloreadas o hover son el patrón más AI-generated del catálogo. El borde `border-border hover:border-primary/30` da el mismo feedback interactivo sin "popping" artificial.

---

### F3 — Grid con mayor densidad (`src/components/ProductList.tsx`)

**Decisión:** Cambiar a 4 columnas en desktop.

**Razonamiento:** Con el nuevo diseño vertical (imagen + precio), cada card es más alta que la versión horizontal pero más angosta. 4 columnas en desktop permite comparar más productos sin scroll, que es exactamente el valor del producto.

```tsx
// ANTES
<div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">

// DESPUÉS
<div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3 lg:grid-cols-4">
```

**Por qué cambiar `gap-6` a `gap-4`:**
Con cards más angostas (4 columnas), gap-6 (24px) se come demasiado espacio. Gap-4 (16px) mantiene separación visual legible.

**Badge "ordenado por menor precio":**
```tsx
// ANTES
<div>
  <Badge variant="secondary">Productos ordenados por menor precio</Badge>
</div>

// DESPUÉS
<div className="flex items-center gap-2">
  <Badge variant="secondary" className="text-xs">
    Ordenados por menor precio
  </Badge>
  <span className="text-xs text-muted-foreground">
    {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""}
  </span>
</div>
```

Agregar el conteo de resultados da contexto inmediato ("encontré 24 resultados" vs silenco). Es información útil, no decoración.

---

### F4 — Loading State: de logo girando a Skeleton Grid (`src/components/ProductList.tsx`)

**Decisión:** Reemplazar loader fullscreen con skeleton cards en el mismo layout real.

**Por qué es mejor:**
- El usuario ve la estructura de lo que va a aparecer → menos ansiedad de espera
- No interrumpe el layout (la página no "salta" cuando cargan los productos)
- El `animate-pulse` único y colectivo en el skeleton es aceptable (1 animación de sistema, no texto)
- Elimina el `animate-bell` personalizado en el logo (buscar en `globals.css` si existe)

**Número de skeletons:** 8 (llena 2 filas en desktop de 4 columnas, comunica que hay resultados cargando)

```tsx
// COMPONENTE SKELETON CARD (inline en ProductList o extraer)
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border animate-pulse">
      <div className="aspect-square w-full bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted mt-1" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// EN EL RETURN DE LOADING (reemplaza el bloque isLoading actual):
if (isLoading)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <p className="text-xs text-muted-foreground animate-pulse">{loadingMessage}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
```

**Nota sobre `loadingMessages`:** Conservar el texto del mensaje pero cambiarlo a estilo inline sutil (no fullscreen, no `animate-pulse` en el texto — el pulse ya está en los skeletons).

---

### F5 — Token Compliance (`src/components/StoresList.tsx`)

Problema menor pero genera inconsistencia visual:

```tsx
// ANTES
<div className="rounded-lg p-4 shadow-md">

// DESPUÉS
<div className="rounded-lg border border-border p-4">
```

Elimina la sombra, reemplaza con borde para consistencia con las Cards.

---

### F6 — SearchForm — Mobile-first (`src/components/SearchForm.tsx`)

El formulario actual funciona pero tiene issues menores:

```tsx
// PROBLEMA: w-2/3 y w-1/3 en todos los tamaños
<Input className="rounded-md w-2/3 text-base" />
<Button className="rounded-md w-1/3" />

// SOLUCIÓN: en mobile el botón puede ser más compacto
// El form ya tiene max-w-3xl y flex-row, funciona
// Cambio mínimo: usar flex-1 en el input para que se expanda naturalmente
<Input className="flex-1 text-base" />
<Button type="submit" className="shrink-0" disabled={isLoading}>
```

**Por qué min:** El SearchForm no es el componente con más deuda. Cambio quirúrgico.

---

### Checklist de implementación

| # | Tarea | Archivo | Impacto |
|---|-------|---------|---------|
| F1a | `h-screen` → `min-h-screen flex-col` | `page.tsx` | Alto |
| F1b | `space-y-4 py-2` → `space-y-6 py-6 md:py-8` | `page.tsx` | Alto |
| F2a | Reestructurar layout Card a vertical + imagen fill | `ProductList.tsx` | Alto |
| F2b | `text-green-600` → `text-primary` | `ProductList.tsx` | Alto |
| F2c | `shadow-md hover:shadow-lg` → `border border-border hover:border-primary/30` | `ProductList.tsx` | Medio |
| F2d | `ring-1 ring-primary/40` en `index === 0` | `ProductList.tsx` | Medio |
| F3 | Grid `lg:grid-cols-3` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` + contador | `ProductList.tsx` | Medio |
| F4 | Loading fullscreen → SkeletonCard grid | `ProductList.tsx` | Alto |
| F5 | `shadow-md` → `border border-border` en StoresList | `StoresList.tsx` | Bajo |
| F6 | `w-2/3 w-1/3` → `flex-1 shrink-0` en SearchForm | `SearchForm.tsx` | Bajo |

**Orden recomendado de ejecución:** F2 → F4 → F1 → F3 → F5 → F6

F2 y F4 son los cambios de mayor impacto visual. F1 resuelve el bug de layout. F3 ajusta la grilla al nuevo card. F5-F6 son pulido.

---

### Decisiones de diseño — Justificación

**¿Por qué no Bento Grid (tamaños variables)?**
Bento Grid funciona cuando el contenido tiene jerarquía semántica natural (ej: "este artículo es más importante"). En una lista de precios, TODOS los productos son igual de consultables. Usar Bento Grid forzaría una jerarquía arbitraria. La jerarquía real (precio más bajo = primero) se expresa con `ring-1` mínimo, no con tamaño de celda.

**¿Por qué 4 columnas en desktop y no 3?**
4 columnas = ver más productos sin scroll = cumple el objetivo del producto (comparar precios). 3 columnas con cards más altas crea necesidad de scroll excesivo. El precio se lee igual de grande en 4 columnas.

**¿Por qué eliminar el logo girando en loading?**
El logo girando con `animate-bell` es branding, no feedback de carga. El usuario quiere saber que algo está pasando, no ver una animación de marca. El skeleton grid comunica "van a aparecer X productos aquí" — información útil.
