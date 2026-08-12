---
paths:
  - 'resources/js/**'
---

# Js

## cn() must know the DRIO theme or it silently drops classes
`cn` in resources/js/lib/utils.ts uses `extendTailwindMerge` with the DRIO theme registered (colors, text sizes, font, radius, container, ease). This is load-bearing, not decoration.

tailwind-merge only knows Tailwind's stock scales. Without the theme it cannot tell a custom font size from a custom colour, so it files `text-small` and `text-cream` in one conflict group and drops the earlier one — producing buttons with no text colour and no error anywhere. Any new token namespace added to `@theme` in app.css must also be added to the `extend.theme` list here.

Corollary: never give a font-size token the same name as a colour token. `--text-card` was renamed to `--text-title` because shadcn already owns `--color-card`/`text-card-foreground`, which made `text-card` genuinely ambiguous.
