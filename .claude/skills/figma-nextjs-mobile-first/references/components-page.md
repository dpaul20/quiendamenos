# Components Page Organization

**Page**: `🧩 Components` (node `5:2`)

Every component **must** live inside a section — never at the page root.

## Sections

| Section     | ID      | Contains                                                                                                                                |
| ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ATOMS`     | `130:2` | StoreChip, Badge — single-purpose UI pieces                                                                                             |
| `MOLECULES` | `130:3` | SearchBar, BrandFilter, SearchRow, Pagination, MissionModal/Trigger                                                                     |
| `ORGANISMS` | `151:2` | Header, MobileHeader, Footer, ProductCard, ProductGrid, EmptyState, ErrorAlert, Disclaimer, StoresList, FiltersRow, MissionModal/Dialog |

## Type Groups Within Sections

Components are grouped by **semantic domain**. Use within-group gaps for adjacent items, between-group gaps when the domain changes.

**MOLECULES** (top → bottom):

1. **Search** — SearchBar + BrandFilter (same row) → SearchRow (row below)
2. **Actions/Nav** — MissionModal/Trigger + Pagination (same row)

**ORGANISMS** (top → bottom):

1. **Header/Nav** — Header → MobileHeader (vertical stack)
2. **Footer** — Footer
3. **Products** — ProductCard + SkeletonCard + ProductGrid/2col (same row) → ProductGrid → ProductGrid/Loading
4. **Filters** — BrandFilter/Dropdown + FiltersRow (same row)
5. **Feedback** — ErrorAlert + EmptyState (same row)
6. **Mission** — MissionModal/Dialog
7. **Info/Static** — StoresList → Disclaimer (vertical stack)

## Spacing Rules

Be **generous** — tight layouts are hard to scan.

| Context                                  | Gap      |
| ---------------------------------------- | -------- |
| Items in the same row (x-axis)           | **24px** |
| Rows within the same type group (y-axis) | **40px** |
| Between type groups (y-axis)             | **80px** |
| Section top → first item (`y`)           | **96px** |
| Section bottom padding                   | **48px** |
| Between sections on the page             | **80px** |
| First item left margin (`x`)             | **40px** |

## Positioning Rules

1. **New components always go inside a section** — `section.appendChild(node)`, then set `x`/`y` relative to section.
2. **COMPONENT_SET must be compact** — 24px internal padding, 32px gap between variants. No oversized empty space.
3. **Section width** — at least `max_child_width + 80px`.
4. **After adding a component** — resize the section, recheck group sibling positions, then reposition all page sections.
5. **Verify with screenshot** — `mcp_figma_get_screenshot(fileKey, sectionId)` after every reorganization.
