---
paths:
  - resources/css/app.css
---

# Css

## gold-700 and clay-700 exist for text; gold and clay stay fills
Use `text-gold-700` / `text-clay-700` whenever gold or clay is text on a light surface. Use `gold` and `clay` for fills, rules, stars and icons.

§11 anticipated the problem and prescribed gold-600 — but measured, gold-600 is 3.85:1 on cream, still under the 4.5:1 floor the same paragraph sets. gold-700 (#876121) is the first value on the hue clearing it on cream, sand and paper (5.22 / 4.79 / 5.58); clay-700 (#925935) does the same for the tinted recipe badge (4.57).

Do not reintroduce `text-gold-600` — nothing uses it now, and it fails everywhere it would be used. Any new token added to `@theme` must also be listed in `extend.theme` in resources/js/lib/utils.ts (see .ai/rules/js.md).

Known exception, deliberate: white on a solid `gold` button fill is 3.04:1. §11 says to keep gold for fills, so the token is untouched — raise it with the client rather than silently darkening every CTA.
