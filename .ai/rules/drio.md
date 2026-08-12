---
paths:
  - 'resources/js/components/drio/**'
---

# Drio

## IconButton only wraps itself when it has a badge
`IconButton` returns a bare `<button>` unless a `badge` is passed, in which case it wraps in `<span class="relative inline-flex">` to anchor the badge.

This is load-bearing. When the wrapper was unconditional it captured any `absolute` a caller put in `className` — the product card's wishlist heart positioned itself against a zero-width inline span instead of against the card's media, and vanished off the card. Do not make the wrapper unconditional again; if a badged button ever needs positioning, add a separate `wrapperClassName` rather than reinstating it.
