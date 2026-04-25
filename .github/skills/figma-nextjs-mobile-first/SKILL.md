---
name: figma-nextjs-mobile-first
description: 'Implement Figma designs into Next.js + Tailwind CSS with mobile-first discipline. Enforces node discovery, breakpoint-ordered implementation (mobile → desktop), and codebase-first analysis before edits. WHEN: "implement from Figma", "tomar desde figma", "implementar pantalla", "hay inconsistencias con figma", "mobile first", "comparar con figma", "fix Figma", "implementing a screen", "converting Figma frames".'
argument-hint: "Figma URL or node-id to implement, or 'compare' to diff live app vs Figma"
---

# Figma → Next.js Mobile-First Implementation

## Core Principles

1. **Mobile frame is ground truth** — always implement mobile first, then scale up
2. **Read before write** — understand existing components before touching any file
3. **Fetch the right node** — Screens canvas (breakpoint frames), NOT component/symbol nodes
4. **Direct Figma px = direct Tailwind px** — `h-[46px]` in Figma → `h-[46px]` in Tailwind (no guessing)
5. **Full-width on mobile, constrained on desktop** — not the other way around

---

## Step 1 — Discover the Correct Figma Node

**DO NOT** use a component node or old screenshot node as the design reference.

1. Parse URL: `figma.com/design/:fileKey/...?node-id=X-Y` → nodeId = `X:Y`
2. Call `mcp_figma_get_metadata(fileKey, nodeId)` to inspect canvas structure.
3. Find the **Screens canvas** with breakpoint frames: `📱 Mobile — 390px`, `📲 Tablet — 768px`, `🖥️ Desktop — 1280px`, dark mode variants.
4. Record node IDs — see [Node Reference](references/node-reference.md) for this project.

> If user provides a component node-id, ask: "¿Querés que implemente este componente específico, o la pantalla completa?"

---

## Step 2 — Fetch Design Context for All Breakpoints

```
mcp_figma_get_design_context(fileKey, mobileNodeId)   // 390px — PRIMARY
mcp_figma_get_design_context(fileKey, desktopNodeId)  // 1280px
mcp_figma_get_design_context(fileKey, tabletNodeId)   // 768px (if needed)
```

Extract: header height per breakpoint, divider presence, container padding/max-width, SearchRow layout, input heights, grid columns (`2→3→4`), gaps, component order.

---

## Step 3 — Read the Existing Codebase

Before writing a single line, read `src/components/` and `src/app/page.tsx`. See [Node Reference](references/node-reference.md) for the component inventory.

Spot: `shrink-0` where `w-full` needed · fixed px widths without responsive overrides · single `h-X` missing `sm:h-Y` · missing `border-b` divider.

---

## Step 4 — Build the Mobile-First Change Map

Create a table: **Component | Mobile Figma spec | Desktop Figma spec | Current code | Fix needed**.

Prioritize layout divergences (height, width, order) over cosmetic ones (color, font-size).

---

## Step 5 — Implement Mobile-First

Core pattern — mobile values first, overrides scale up:

```tsx
className = "flex lg:hidden"; // mobile-only
className = "w-full sm:w-auto"; // full mobile, shrink desktop
className = "h-14 sm:h-10"; // taller mobile, shorter desktop
className = "px-4 sm:px-10 lg:px-20";
className = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
className = "flex flex-col sm:flex-row gap-3"; // SearchRow: stack → side-by-side
```

See [Tailwind Mappings](references/tailwind-mappings.md) for Figma px conversions and component-specific patterns.

---

## Step 6 — Post-Implementation Checklist

See [Checklist](references/checklist.md) for full per-breakpoint verification.

Quick check: `npx tsc --noEmit` — zero errors.

---

## Step 7 — Visual Comparison (Optional)

Run dev server → open `http://localhost:3000` at 390px → compare with `mcp_figma_get_screenshot` on the mobile frame. List remaining delta as follow-up tasks.

---

## Scope Clarification — Figma vs Code

When a change request is ambiguous about **where** the fix should happen, **ask before acting**.

### Common ambiguous phrases

| User says                         | Could mean                                                  |
| --------------------------------- | ----------------------------------------------------------- |
| "el logo le falta la inclinación" | Rotate in Figma **OR** add `-rotate-X` in code              |
| "el color no coincide"            | Fix design token in Figma **OR** fix Tailwind class in code |
| "falta el borde"                  | Add border node in Figma **OR** add `border` class in code  |
| "el texto no va"                  | Remove text node in Figma **OR** remove JSX text in code    |

### Rule

If the request describes a **visual property** (rotation, color, size, text) without explicitly saying "en el código" or "en Figma", ask:

> "¿Lo hago en Figma, en el código, o en ambos?"

**Never assume** the scope based on which tool feels more natural or direct.

---

## Anti-Patterns to Avoid

- **Using a component/symbol node as screen reference** — always use full breakpoint frames
- **Implementing desktop layout first** — start with 390px mobile frame
- **Guessing heights** — use exact Figma `px` values in Tailwind `h-[Xpx]`
- **Fixed widths without responsive overrides** — always add `w-full sm:w-[X]`
- **Forgetting dividers** — check for `Divider` nodes in Figma (they're easy to miss)
- **Wrong component order** — match the DOM order in Figma's layers panel exactly
- **Not reading existing code first** — always compare before overwriting

---

## Components Page Organization

See [Components Page](references/components-page.md) for section IDs, type groups, and all spacing rules. Key constraint: every component must be inside a section, never at the page root.

---

## Project Context (quiendamenos)

- **Figma fileKey**: `YTsPttJTYUclnJIkAUZ9fj` · **Screens page**: `5:3`
- **Stack**: Next.js App Router + TypeScript + Tailwind CSS v3 + shadcn/ui
- **Design tokens**: `src/app/globals.css` · **Font**: Geist Sans · **Primary**: `#16a34a`
- **All node IDs, components, screen structures**: [Node Reference](references/node-reference.md)
