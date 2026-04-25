# Post-Implementation Checklist

## Mobile (390px)

- [ ] Header height matches Figma (`h-14` = 56px)
- [ ] Divider `h-px bg-border` exists below header
- [ ] BrandFilter is `w-full` (full width)
- [ ] SearchBar is `w-full` (full width)
- [ ] BrandFilter and SearchBar are stacked (`flex-col`)
- [ ] Store filter pills wrap and label is hidden (or shown per design)
- [ ] Product grid is 2 columns
- [ ] Container padding: `px-4`

## Desktop (1280px)

- [ ] Header height matches Figma (`h-10` = 40px)
- [ ] BrandFilter is compact (`w-auto shrink-0`)
- [ ] SearchBar and BrandFilter are side by side
- [ ] SearchRow max-width matches Figma (e.g. `max-w-[800px]`)
- [ ] Product grid is 4+ columns
- [ ] Container padding: `px-16` to `px-20`
- [ ] Footer visible and correct height

## TypeScript

- [ ] `npx tsc --noEmit` — zero errors
