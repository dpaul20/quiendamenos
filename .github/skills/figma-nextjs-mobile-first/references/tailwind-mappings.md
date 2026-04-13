# Figma → Tailwind Mappings

## Pixel Values

| Figma | Tailwind |
|-------|----------|
| `py-[11px]` on input (46px total) | `h-[46px]` |
| `px-[80px]` page padding | `px-20` (80px) |
| `px-[24px]` | `px-6` |
| `gap-[8px]` | `gap-2` |
| `gap-[16px]` | `gap-4` |
| `gap-[20px]` | `gap-5` |
| `rounded-[9999px]` | `rounded-full` |
| `border: 1px solid var(--border)` | `border border-border` |
| `bg-[var(--card)]` | `bg-card` |
| `text-[color:var(--muted-foreground)]` | `text-muted-foreground` |
| `font-weight: 600` | `font-semibold` |
| `font-weight: 500` | `font-medium` |
| Geist font (same as project) | use existing `font-*` classes |

## Responsive Patterns

### Header (different content per breakpoint)

```tsx
// Mobile layout
<div className="flex sm:hidden h-14 items-center justify-between px-4">
  <LogoBadge />  {/* centered title */}
  <Spacer />     {/* balances layout */}
</div>

// Desktop layout
<div className="hidden sm:flex h-10 items-center justify-between px-6">
  <LogoArea />
  <Actions />    {/* buttons, toggles */}
</div>
```

### Container

```tsx
<div className="w-full max-w-[1280px] mx-auto px-4 sm:px-10 lg:px-20 py-6 lg:py-10">
```

### SearchRow (stack mobile → side-by-side desktop)

```tsx
<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:max-w-[800px]">
  <BrandFilter />   {/* w-full on mobile → w-auto on desktop */}
  <SearchForm />    {/* flex-1 always */}
</div>
```

### BrandFilter width

```tsx
// ✅ Full-width mobile, auto desktop
className="... w-full sm:w-auto"
// ❌ shrink-0 breaks full-width on mobile
className="... shrink-0"
```
