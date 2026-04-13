# Figma Node Reference — scraping-electronica

**File key**: `YTsPttJTYUclnJIkAUZ9fj`

## Pages

| Page ID | Name | Purpose |
|---------|------|---------|
| `0:1` | 📸 Current UI | Old screenshot for reference (frame `2:2`) |
| `5:2` | 🧩 Components | All reusable components |
| `5:3` | 🖥️ Screens | All breakpoint screens |

## Screen Frames (`5:3`)

| Node | Name | Dimensions |
|------|------|-----------|
| `49:2` | 🖥️ Desktop — 1280px | 1280×1138 |
| `50:63` | 📱 Tablet — 768px | 768×1333 |
| `50:148` | 📱 Mobile — 390px | 390×1385 |
| `59:172` | 🌙 Desktop Dark — 1280px | 1280×1138 |
| `61:233` | 🌙 Tablet Dark — 768px | 768×1333 |
| `61:257` | 🌙 Mobile Dark — 390px | 390×1385 |
| `64:342` | ⏳ Loading State — 1280px | 1280×793 |
| `143:516` | 🕳️ Empty State — 1280px | 1280×858 |
| `143:541` | ❌ Error State — 1280px | 1280×858 |
| `144:553` | 🌙 Loading State Dark — 1280px | 1280×793 |
| `288:842` | 🎛️ Filter Interaction — 1280px | 1280×1138 |
| `288:879` | 📝 Mission Modal — 1280px | 1280×1138 |

## Components (`5:2`)

| Node | Name | Variants / Notes |
|------|------|-----------------|
| `6:31` | Header | Desktop header (logo rotated -12°) |
| `365:2` | MobileHeader | Mobile-only header (390px, logo rotated -12°) |
| `244:709` | FiltersRow | All 5 chips + FilterLabel. Mobile: hide `FilterLabel` + `StoreChip_Cetrogar` |
| `375:119` | SearchRow (COMPONENT_SET) | `Direction=Horizontal` (`245:710`, 800×46) + `Direction=Vertical` (`375:109`, 358×108) |
| `116:3` | BrandFilter | Used inside SearchRow |
| `6:11` | SearchBar | Used inside SearchRow |
| `116:2` | Footer | Shared footer |
| `51:10` | EmptyState | "Sin resultados" card |
| `53:2` | ErrorAlert | "Error al cargar resultados" alert |

## FiltersRow Children (`244:709`)

| Child Node | Name | Width | Visible on mobile? |
|-----------|------|-------|-------------------|
| `244:703` | FilterLabel | 56px | ❌ Hidden |
| `244:704` | StoreChip_Frávega | 71px | ✅ (active) |
| `244:705` | StoreChip_Garbarino | 81px | ✅ |
| `244:706` | StoreChip_Musimundo | 92px | ✅ |
| `244:707` | StoreChip_Megatone | 83px | ✅ |
| `244:708` | StoreChip_Cetrogar | 75px | ❌ Hidden |

## Mobile Screen Structure (`50:148` / `61:257`)

```
Screen (390px)
├── MobileHeader (instance 365:2, FILL width, h-14)
├── Divider
└── Main (VERTICAL auto-layout)
    ├── Disclaimer
    ├── HeroSection
    │   ├── Title text
    │   ├── Subtitle text
    │   └── SearchRow [Direction=Vertical] (instance, FILL, 108px)
    ├── FiltersRow (instance 244:709, FilterLabel+Cetrogar hidden)
    ├── StoresList
    ├── ProductList
    └── Pagination
```

## Empty/Error State Structure

```
Screen (1280px, NONE layout — absolutely positioned)
├── Header (instance, y:0, h:57)
├── Divider (y:57, 1280×1px)
├── ContentArea (frame, y:57, 1280×737, transparent)
│   ├── Title text "¿Quién da menos?" (y:23)
│   ├── Subtitle text (y:71)
│   └── EmptyState / ErrorAlert instance (y:143)
└── Footer (instance, y:794, h:64)
```
