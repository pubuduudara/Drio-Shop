---
paths:
  - 'resources/js/layouts/**'
---

# Layouts

## Only a page with a dark hero may set overlayHeader
`StorefrontLayout` takes an `overlayHeader` layout prop, defaulting to `false`. It decides whether `SiteHeader` starts transparent with cream text (§7.1) or ships as the solid forest bar.

Only the homepage sets it, via `setLayoutProps({ overlayHeader: true })`, because it is the only page opening with a dark full-bleed hero for cream nav text to read against. Every other page has cream or sand up there — the transparent header renders itself invisible, which is how it shipped before the shop page caught it. A new page opts in only if it genuinely opens with a dark full-bleed panel.
