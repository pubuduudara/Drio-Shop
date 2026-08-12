## 0. Reference images and precedence

A visual reference for the homepage lives in `design/`:

- `00-full-reference.png` — the complete homepage mockup, top to bottom. Read this once for overall rhythm and section order.
- `01-header-hero.png` through `09-newsletter-footer.png` — per-section crops at 2× scale. **Open the relevant crop immediately before building each section**, not just the full image, because detail in the full-page version is lost to downscaling.
  **Precedence when the image and this document disagree:**

| Concern                                                          | Authority               |
| ---------------------------------------------------------------- | ----------------------- |
| Layout, proportion, spacing, alignment, hierarchy, element order | **The image**           |
| Colour values, type scale, fonts, tokens                         | **§5 of this document** |
| Behaviour, states, responsive rules, data, admin, copy           | **This document**       |

The hex values in §5 were sampled from this same mockup, so re-eyeballing colours from the image will produce slightly different values and cause drift between components. Always use the tokens.

**Do not transcribe fine text from the image.** Footer links, review bodies, product descriptions and small labels are near-illegible at this resolution — reading them will produce plausible-looking wrong content. All that copy is specified in §6 (seeder) and §7. Use those.

**Understand what the image doesn't show.** It's one screenshot, at one viewport width, in one state. It contains no hover or focus states, no mobile or tablet layout, no cart drawer, no modal, no form errors, no empty states, and nothing at all about the admin console. Where the image is silent, follow this document; where both are silent, ask rather than invent.

If you have browser screenshot tooling available, use it: build a section, screenshot it at 1440px, and compare against the corresponding crop side by side before moving on. Report differences you chose not to fix and why.

---

## 1. Project brief

Build **DRIO** — an e-commerce storefront selling authentic Sri Lankan dehydrated vegetables, spice powders and traditional ingredients, shipped across Japan. The audience is the Sri Lankan diaspora in Japan plus Japanese customers curious about Sri Lankan cooking. Prices are in **Japanese Yen (¥)**.

**Language: English only for now, built translation-ready.** Ship v1 with a single active locale (`en`). But every user-facing string — both UI chrome and database content like product names and descriptions — must be stored and read through the translation layer from day one. Adding 日本語 (or Sinhala, or Tamil) later must be a matter of enabling a locale in config and filling in translations, with **zero component rewrites and zero migrations**. Section §9 defines exactly what "adding a language later" must involve; treat that as an acceptance test for the architecture.

The visual direction is fixed and non-negotiable: a warm, earthy, editorial look — dark forest green chrome, gold accents, cream paper backgrounds, and a high-contrast display serif. It should feel like a premium spice house, not a generic Shopify theme. A reference mockup governs the layout; the section-by-section spec in §7 is the source of truth.

There are two applications in one codebase:

1. **Storefront** — public, bilingual, product browsing, cart, checkout, recipes, story pages.
2. **Admin console** — authenticated, separate URL prefix and separate visual shell, for managing products, categories, pricing, inventory, orders, recipes, reviews and site content.

---

## 2. Stack and conventions

- **Laravel 11** (already scaffolded — do not re-init; inspect what exists first)
- **Inertia.js v2 + React 18 + TypeScript** for both storefront and admin. Single Vite build, two page trees.
- **Tailwind CSS** with a custom theme (§5). No component library for the storefront — build it. Admin may use **shadcn/ui** for speed.
- **Laravel Fortify or Breeze (Inertia React stack)** for admin auth. Storefront customer accounts are a later phase.
- **Spatie Laravel Permission** for admin roles (`admin`, `manager`).
- **Spatie Laravel Media Library** for product/category/recipe images.
- **laravel-vite-plugin**, **Ziggy** for route helpers in React.
- **i18n:** `react-i18next` on the front end backed by JSON dictionaries, plus translatable DB columns via **Spatie Laravel Translatable** (see §6). Full rules in §9.
- Pest or PHPUnit for feature tests on admin CRUD and cart logic.
  **Code conventions**
- Strict TypeScript. No `any` in component props.
- Form Requests for every write endpoint. No validation inline in controllers.
- Eloquent API Resources or explicit array shaping for everything passed to Inertia — never dump raw models into props.
- Money is stored as **integer minor units** (`price_minor`, JPY has no decimal subunit so 1580 = ¥1,580). Never use floats.
- Components live in `resources/js/Components/` (shared), `resources/js/Pages/Storefront/`, `resources/js/Pages/Admin/`.
- Every storefront section is its own component file. No 800-line page files.

---

## 3. Images — placeholder strategy

**All imagery is a placeholder for now.** The client supplies real assets later. Do not download stock photos, do not generate images, do not hotlink external URLs.

Implement a single `<Placeholder />` component:

- Renders a `div` with the warm sand background (`--drio-sand`), a subtle diagonal hairline pattern, a centred leaf glyph, and a small caption label naming what belongs there (e.g. `Hero — spread of products on wood`, `Product — Dehydrated Jackfruit 200g`).
- Props: `ratio` (`'16/9' | '4/3' | '1/1' | '3/4' | '21/9'`), `label`, `className`, `rounded`.
- It must respect the exact aspect ratio of the slot so swapping in a real image causes **zero layout shift**.
- Wire it behind an `<Media />` component that renders a real `<img>` (with `srcset`, `loading="lazy"`, `alt`) when a media record exists, and falls back to `<Placeholder />` when it doesn't. Swapping in real images should then be a data operation, not a code change.
  Everything visible in the mockup that isn't a photo — logo mark, category icons, feature icons, payment-card marks, social icons, arrows, star ratings — should be **inline SVG components**, not placeholders. Draw them.

---

## 4. Design direction

Warm, earthy, hand-made. Think spice market, clay pots, palm shade, and print-quality typography. Generous whitespace between sections, tight and confident within them.

- **Corners:** small and consistent — 4px on buttons/inputs, 6px on cards, 10px on large media panels. Nothing pill-shaped except the wishlist circle and icon badges.
- **Shadows:** almost none. Depth comes from the cream/white contrast and hairline borders (`--drio-line`), not drop shadows. Cards get at most a 1px border plus a barely-there shadow on hover.
- **Section headers:** left-aligned serif title followed by a **short gold hairline dash** (roughly 32px, vertically centred on the title's baseline area) — not a full-width rule — with a right-aligned `View all X →` link in Inter at small size on the same baseline. This pattern repeats across Featured Categories, Best Sellers, Recipe Inspiration, Customer Reviews and Follow Our Journey — build it once as `<SectionHeader />`.
- **Motion:** restrained. Fade-and-rise on scroll into view (16px, 400ms, ease-out, staggered 60ms across grid children). Hover: images scale to 1.03 with a 600ms ease, gold underline sweeps on text links. Hero slides cross-fade. Honour `prefers-reduced-motion: reduce` by disabling all of it.
- **The signature element:** the **botanical hairline motif** — a fine gold line that terminates in a small drawn leaf or spice sprig. It appears as the section-header rule, as the divider under the logo, framing the newsletter band, and as the flourish beside "Why Choose DRIO". It is the one decorative flourish; keep everything else disciplined and let it do the identity work.

---

## 5. Design tokens

Put these in `tailwind.config.ts` under `theme.extend` **and** mirror them as CSS custom properties on `:root` in `resources/css/app.css`.

### Colour

| Token        | Hex       | Use                                                           |
| ------------ | --------- | ------------------------------------------------------------- |
| `forest`     | `#1F2A1C` | Footer, dark overlays, header on scroll, admin sidebar        |
| `forest-700` | `#2C3A26` | Icon badge circles, hover on forest surfaces                  |
| `forest-500` | `#465A3C` | Muted green text, borders on dark                             |
| `gold`       | `#C08A2F` | Primary buttons, stars, links, section rules, prices on dark  |
| `gold-600`   | `#A67323` | Gold hover/active                                             |
| `gold-200`   | `#E8D4A8` | Subtle gold fills, focus rings, dividers                      |
| `cream`      | `#FAF7F1` | Page background                                               |
| `sand`       | `#F3EDE1` | Alternating section bands, card backgrounds, placeholder fill |
| `paper`      | `#FFFFFF` | Product cards, review cards, inputs                           |
| `line`       | `#E5DBC9` | All hairline borders                                          |
| `ink`        | `#26221D` | Headings and primary body text                                |
| `ink-muted`  | `#6E6559` | Secondary text, captions, review body                         |
| `chilli`     | `#B23A2B` | Sparing accent — sale badges, chilli category, error states   |
| `clay`       | `#A5643C` | Tertiary warm accent — recipe tags, subtle illustration       |

Semantic aliases: `bg-page`→cream, `bg-surface`→paper, `bg-band`→sand, `text-body`→ink, `border-hairline`→line.

### Typography

- **Display —** `Cormorant Garamond`, weights 500/600, for the hero headline, all section titles, product names in cards, and the story headings. Set it with tight leading (`1.08`) and slight negative tracking (`-0.01em`) at large sizes. This is the voice of the brand — use it with restraint and never below 18px.
- **Body / UI —** `Inter`, weights 400/500/600, for paragraphs, nav, buttons, prices, form fields, admin.
- **Japanese —** `Noto Sans JP`, weights 400/500. Add it to the font stack for both roles so 日本語 never falls back to a system default. In the `ja` locale, headings use Noto Sans JP at weight 500 (Cormorant has no CJK coverage — do not let it try).
- **Utility / eyebrow —** Inter at 11px, weight 600, uppercase, `0.14em` tracking, in `ink-muted` or `gold`. Used for `Our Story`, `01 / 03`, category labels, admin table headers.
  Type scale (desktop → mobile): hero `clamp(2.75rem, 5.5vw, 4.25rem)` · section title `clamp(1.75rem, 2.6vw, 2.25rem)` · card title `1.0625rem` · body `0.9375rem` · small `0.8125rem`.

### Layout

- Container: `max-w-[1280px]`, gutters `px-5 md:px-8 lg:px-10`.
- Vertical rhythm between sections: `py-16 md:py-20`. Hero is full-bleed and breaks the container.
- Grid gap: `gap-5 md:gap-6`.
- Breakpoints: default Tailwind. Category grid 4→2→1. Best sellers 5→3→2. Recipes 4→2→1. Instagram strip 7→4→3.

### Component primitives

Build these first, in `resources/js/Components/UI/`:

- `<Button variant="primary|outline|ghost|dark" size="sm|md|lg" />` — primary is solid `gold` with white text, 4px radius, `font-medium`, `tracking-wide`, hover to `gold-600`. Outline is 1px `ink`/`line` border on transparent with hover fill. Both support a trailing arrow icon that nudges 3px right on hover.
- `<SectionHeader title viewAllHref viewAllLabel />` — implements the serif-title + gold-rule + right link pattern from §4.
- `<Placeholder />` and `<Media />` — per §3.
- `<Rating value count />` — five gold stars, half-star support, count in parentheses in `ink-muted`.
- `<Price amount currency="JPY" />` — formats integer minor units as `¥1,580` with `Intl.NumberFormat`, locale-aware.
- `<Badge />`, `<IconButton />`, `<Input />`, `<Select />`, `<Textarea />`.

---

## 6. Data model

Migrations, models, factories and seeders for all of the following. Fields marked _(translatable)_ are **JSON columns keyed by locale** — `{"en": "Dehydrated Jackfruit"}` today, `{"en": "Dehydrated Jackfruit", "ja": "乾燥ジャックフルーツ"}` later. Use Spatie Laravel Translatable. Seeders populate the `en` key only.

Do this even though only English ships — a JSON column holding one key costs nothing now and saves a data migration on every content table later. Non-translatable fields (SKU, prices, stock, flags, timestamps) stay as plain columns.

**Slugs are deliberately not translatable.** One canonical English slug per record, used for all locales. Per-locale slugs complicate route model binding, canonical URLs and redirects for a benefit you don't need yet; if Japanese SEO later justifies it, a `translatable_slugs` table can be added without touching the products table.

- **users** — id, name, email, password, `is_admin`, remember_token, timestamps. Roles via Spatie Permission.
- **categories** — id, `name` (translatable), slug, `description` (translatable), `icon_key` (maps to an SVG component: `leaf`, `powder`, `chilli`, `spice`), sort_order, is_featured, timestamps.
- **products** — id, category_id, `name` (translatable), slug, `short_description` + `description` (translatable), sku, `price_minor` (int), `compare_at_price_minor` (nullable int, for strikethrough), currency (default `JPY`), `weight_grams`, stock_quantity, `is_active`, `is_best_seller`, `is_vegetarian`, sort_order, timestamps, soft deletes.
- **product_images** — via Media Library collection `gallery`, plus a `primary` single-file collection.
- **product_variants** _(optional, build the table now, UI later)_ — product_id, name, sku, price_minor, stock_quantity.
- **reviews** — id, product_id (nullable — the homepage testimonials aren't tied to a product), customer_name, customer_city, rating (1–5), `body` (translatable), avatar via Media Library, `is_published`, `is_featured`, timestamps.
- **recipes** — id, `title` (translatable), slug, `intro`, `ingredients` (JSON), `steps` (JSON), prep_minutes, cook_minutes, serves, `is_vegetarian`, `is_traditional`, `is_quick`, is_published, timestamps. Pivot `recipe_product` linking recipes to the products they use.
- **orders** — id, order_number, user_id (nullable, guest checkout), status enum (`pending|paid|processing|shipped|delivered|cancelled|refunded`), customer name/email/phone, shipping address fields (Japanese format: postal_code, prefecture, city, address_line1, address_line2), subtotal_minor, shipping_minor, tax_minor, total_minor, currency, notes, timestamps.
- **order_items** — order_id, product_id, product_name_snapshot, sku_snapshot, unit_price_minor, quantity, line_total_minor.
- **carts / cart_items** — session-keyed for guests, user-keyed when authenticated.
- **subscribers** — email, locale, confirmed_at, timestamps.
- **settings** — key/value store for hero slides, social links, shipping flat rate, free-shipping threshold, contact details.
- **hero_slides** — `headline` + `subhead` (translatable), primary/secondary CTA label + href, sort_order, is_active, image via Media Library.
  **Seeder** must reproduce the mockup's exact content so the built UI is directly comparable to the reference:

- Categories: Dehydrated Vegetables, Curry Powder, Chilli Powder, Traditional Ingredients.
- Products: Dehydrated Jackfruit ¥1,580 (4.5★, 128), Dehydrated Polos Jackfruit ¥1,680 (5★, 96), Roasted Curry Powder ¥980 (4.5★, 72), Chilli Powder ¥880 (4★, 84), Dehydrated Breadfruit Chips ¥1,480 (4.5★, 64). All flagged `is_best_seller`. Add ~15 more plausible products across the four categories so pagination and filters are testable.
- Recipes: Jackfruit Curry, Polos Curry, Breadfruit Curry, Sri Lankan Rice & Curry.
- Reviews (featured, homepage carousel): Niroshi/Tokyo, Kenji/Osaka, Saman/Yokohama, Ayumi/Nagoya — all 5★, with the sentiment shown in the mockup. Add ~10 more for the carousel to scroll.
- 3 hero slides (the mockup shows `01 / 03`), one admin user `admin@drio.jp` / `password`.

---

## 7. Storefront — section by section

Build the homepage top to bottom. Each numbered item is one component.

**7.1 Header** — Transparent and overlaid on the hero at scroll-top with white text; on scroll past 80px, transitions to a solid `forest` bar with a hairline bottom border. Left: DRIO wordmark in the display serif with a drawn leaf mark and the tagline `SRI LANKAN FLAVOURS` in utility type beneath. Centre: `Home · Shop · Recipes · About · Contact`, active item marked with a gold underline. Right: search icon (opens an overlay search panel), wishlist heart with count badge, cart bag with count badge (opens a slide-over cart drawer), and — after a thin divider — the `<LocaleSwitcher />`. **The switcher renders nothing while only one locale is enabled**, so the header ships clean; it must not be commented out or absent, because the layout needs to already accommodate it. Build and style it now (a text toggle like `EN / 日本語` with a gold active state) and verify it by temporarily enabling a second locale. Mobile: hamburger opening a full-screen forest-green drawer, with the switcher pinned to the drawer footer under the same one-locale rule.

**7.2 Hero** — Full-bleed, roughly 78vh, min 560px. Background is a `<Media />` 21/9 placeholder with a left-to-right dark gradient scrim (`forest` at 82% → transparent by 60% width) so text stays legible over the eventual photo. Left-aligned content block: display-serif headline broken across three lines ("Authentic / Sri Lankan Flavours, / Delivered Across Japan"), a two-line body paragraph in `cream/85`, then a gold primary `Shop Now` and an outline `Explore Products →`. Bottom-right: slide counter `01 / 03` in utility type with a gold progress rule. Auto-advances every 6s, cross-fade, pauses on hover/focus, arrow-key navigable.

**7.3 Featured Categories** — `<SectionHeader title="Featured Categories" viewAll="View all Categories" />`. Four cards, 4/3 media with the image bleeding to the card edges. A `forest-700` circle badge with a white category icon sits at the lower-left of the media, overlapping into the caption area. Below: category name in display serif over two lines, and `Explore Collection →` in small gold caps. Whole card is a link; hover scales the image and slides the arrow.

**7.4 Best Sellers** — `<SectionHeader title="Best Sellers" viewAll="View all Products" />`. Five `paper` cards with `line` borders. Each: square `sand` media area with the product placeholder, a white circular wishlist heart button at top-right (fills `chilli` when toggled), then name, `<Rating />`, `<Price />`, and a button row of outline `Quick View` + gold `Add to Cart` with a small bag icon. Quick View opens a modal with a larger image, description, quantity stepper and add-to-cart. Add to Cart posts optimistically and pops the cart drawer.

**7.5 Why Choose DRIO** — Centred display-serif title with the botanical flourish beside it. A single row of five features, each a thin-stroke line-art icon in a circular `line` outline and a label beneath: Imported from Sri Lanka · 100% Natural Ingredients · Homemade Recipes · Fast Delivery Across Japan · Premium Export Quality. Wraps to 3+2 on tablet, 2-up on mobile.

Note on the reference mockup: it shows a second, smaller line under each label in Japanese (スリランカから直輸入, 100%自然素材, and so on). That secondary line is **omitted in the English-only build**, but the component must accept an optional `sublabel` prop rendered in `ink-muted` at 11px, and the layout must be vertically centred such that its presence or absence doesn't shift the row. When Japanese is enabled, that line comes back automatically from the translation file.

**7.6 Our Story** — Asymmetric three-panel row, roughly 1fr / 1.6fr / 0.9fr, equal height. Left: `sand` panel with the `Our Story` eyebrow, the display-serif heading "From Our Island To Your Table", two short paragraphs, and a gold `Learn Our Story` button. Centre: large 4/3 media placeholder (the cooking scene). Right: media placeholder with a light scrim and overlaid centred serif text "Taste the Tradition of Sri Lanka" with a small drawn palm/arrow flourish above it. Stacks vertically on mobile with the text panel first.

**7.7 Recipe Inspiration** — `<SectionHeader title="Recipe Inspiration" viewAll="View all Recipes" />`. Four 4/3 media cards, each with a bottom-up gradient scrim, the recipe title in display serif and `View Recipe →` beneath, both overlaid on the image. Hover lifts the scrim opacity and scales the image.

**7.8 Customer Reviews** — `<SectionHeader title="Customer Reviews" />` with circular outline arrow buttons at the left and right edges of the row, vertically centred. Four `paper` cards visible at a time in a scroll-snap carousel. Each card: five gold stars, the review body in `ink-muted`, then a footer row with `— Name, City` on the left and a small circular avatar placeholder on the right. Keyboard and swipe navigable; arrows disable at the ends.

**7.9 Follow Our Journey** — Section header with the Instagram handle `@drio.srilankanflavours` in utility type beneath the title, and `View on Instagram →` on the right. A single edge-to-edge row of seven square media placeholders with no gaps at the container edge. Hover reveals a `forest/60` overlay with a centred Instagram glyph.

**7.10 Newsletter** — Full-width `sand` band. Decorative drawn botanical elements anchored at the far left and far right edges (leaf sprig left, coconut/palm right), rendered as SVG, hidden below `lg`. Centre-left: display-serif "Stay Connected With DRIO" and a one-line subhead. Right: an inline form — a white `line`-bordered email input and a gold `Subscribe` button, with the privacy line "We respect your privacy. Unsubscribe at any time." centred beneath. Posts to a real endpoint, validates, shows inline success and error states in the interface voice (no apologies, say what to fix).

**7.11 Footer** — `forest` background, `cream` text. Top row: the DRIO wordmark and tagline plus a two-line description on the left, then four link columns — **Shop** (All Products, Dehydrated Vegetables, Spices & Powders, Traditional Ingredients, Gift Sets), **Recipes** (All Recipes, Vegetarian, Non-Vegetarian, Quick Recipes, Traditional Recipes), **Information** (About Us, Our Story, Blog, FAQ, Contact Us), **Customer Care** (Shipping Information, Returns & Exchanges, Payment Methods, Terms & Conditions, Privacy Policy). Far right: `We Accept` with drawn Visa / Mastercard / JCB / Amex / PayPal marks. Social icons (Instagram, Facebook, YouTube) sit under the description. Bottom hairline rule in `forest-500`, then the copyright line. Column headers in gold utility caps; links in `cream/75` with gold hover.

**7.12 Other storefront routes** — Shop index with category/price/dietary filters, sort and pagination; product detail with gallery, tabs, related products and reviews; category page; recipe index and detail (with a "shop the ingredients" block linking to products); About/Our Story; Contact with a form; cart page; a multi-step checkout (contact → Japanese-format shipping address → payment method stub → review); order confirmation. Wishlist persisted to localStorage for guests. Build these after the homepage is approved.

---

## 8. Admin console

Mounted at `/admin`, behind `auth` + `can:access-admin` middleware. **Deliberately different visual language from the storefront** — this is a work tool, not a brand experience. Compact, dense, functional: `forest` sidebar, white content area, Inter throughout (no display serif), 13px base, tight table rows, shadcn/ui components.

- **Auth:** login page (email + password, remember me), forgot/reset password, rate limiting, session regeneration. No public registration — admins are created via seeder or an existing admin's invite. Log out invalidates the session. Add a `admin@drio.jp` seeded account.
- **Dashboard:** revenue this month, orders by status, low-stock warnings (stock < 10), recent orders table, best-selling products.
- **Products:** paginated table with search, category filter and active/inactive filter, showing thumbnail, name, SKU, category, price, stock and status. Create/edit form with tabbed sections — Details (name, short description, description via `<TranslatableField />`, per §9 — a plain single input today, locale tabs the moment a second locale is enabled), Pricing (price, compare-at, currency), Inventory (SKU, stock, weight), Media (drag-drop upload, reorder, set primary), Flags (active, best seller, vegetarian). Bulk actions: activate, deactivate, delete. Inline quick-edit for price and stock directly in the table row — this is the thing the client will do most often, so make it fast.
- **Categories:** CRUD, drag-to-reorder, icon picker from the available SVG set, feature toggle.
- **Orders:** list with status filter and date range, detail view with line items, customer and shipping address, status transitions with a note, and a printable packing slip.
- **Recipes:** CRUD with a repeatable ingredients/steps builder and product linking.
- **Reviews:** moderation queue — approve, unapprove, feature on homepage, delete.
- **Hero slides:** CRUD with reorder and active toggle. Headline and subhead use `<TranslatableField />`.
- **Subscribers:** list with CSV export.
- **Settings:** shipping rate, free-shipping threshold, contact details, social links.
  Every destructive action needs a confirmation dialog naming what will be deleted. Every form shows field-level validation errors from Laravel. Success feedback via toast, using the same verb as the button ("Save changes" → "Changes saved").

---

## 9. Localisation architecture

English is the only enabled locale in v1. Everything below exists so that enabling the second one is a config change, not a project.

### 9.1 Single source of truth for locales

`config/locales.php`:

```php
return [
    'default'  => 'en',
    'fallback' => 'en',
    'enabled'  => ['en'],   // later: ['en', 'ja']
    'meta' => [
        'en' => ['label' => 'EN',    'native' => 'English',  'dir' => 'ltr', 'font' => 'latin'],
        'ja' => ['label' => '日本語', 'native' => '日本語',    'dir' => 'ltr', 'font' => 'cjk'],
    ],
];
```

Nothing anywhere else may hardcode a locale list. Not the header, not the admin forms, not a validation rule, not a seeder. If a component needs to know which locales exist, it reads them from shared Inertia props sourced from this config. Adding `'ja'` to `enabled` is the single switch that turns the feature on.

### 9.2 URL strategy

Ship clean, unprefixed English URLs (`/shop`, `/products/dehydrated-jackfruit`) and register storefront routes inside a group with an **optional locale prefix** resolved by a `SetLocale` middleware:

- No prefix → default locale. `/shop` stays `/shop` forever.
- Prefix present and enabled → that locale. `/ja/shop` starts working the day `ja` is enabled, with no route file changes and no broken English URLs.
- Prefix present but not enabled → 404.
  `SetLocale` sets `app()->setLocale()`, shares `locale`, `enabledLocales` and `localeMeta` as Inertia props, and sets `<html lang>`. Ziggy route helpers must generate locale-aware URLs so links inside the app stay in the current locale.

### 9.3 UI strings

**No user-facing string is hardcoded in a component.** Every label, button, heading, placeholder, validation message, empty state and toast comes from `resources/js/locales/en/*.json`, namespaced by area (`common`, `nav`, `home`, `shop`, `product`, `cart`, `checkout`, `footer`, `admin`). Server-side strings live in `lang/en/`.

This is the rule that quietly decides whether the retrofit is cheap or miserable, so enforce it: if you catch yourself typing visible English text inside JSX, it belongs in a dictionary. Use interpolation for dynamic values (`"{{count}} reviews"`) rather than string concatenation, and use i18next plurals rather than hand-rolled `count === 1` checks — Japanese has no plural forms and the plural machinery handles that for free.

### 9.4 Database content

Translatable attributes use Spatie Laravel Translatable with `en` as the fallback, so a record that has no `ja` value renders its English value rather than an empty string. A half-translated catalogue must always render a complete page.

Never pass raw translation JSON to the front end. Resources resolve each translatable field to a plain string in the active locale before it reaches Inertia, so React components receive `product.name` as a string and are entirely unaware that translation exists. The **only** exception is the admin edit form, which needs the full JSON to render locale tabs.

### 9.5 `<TranslatableField />`

One admin component wrapping input, textarea and rich text. Its behaviour is driven by `enabledLocales`:

- One locale enabled → renders as an ordinary labelled field. No tabs, no locale badges, no visual overhead. The admin UI looks single-language because it effectively is.
- Two or more → renders locale tabs above the field, with a subtle dot marker on tabs whose value is empty, and the fallback value shown as greyed placeholder text in an untranslated tab so the editor can see what they're translating.
  Every translatable field in every admin form uses this component from day one. Validation requires the default locale and treats all others as optional.

### 9.6 Typography readiness

Load only Latin subsets now. Structure the font stack so that CJK support is a matter of adding the Noto Sans JP `@font-face` and flipping a class, not restyling components: define `--font-display` and `--font-body` as CSS variables, and have `SetLocale` add a `locale-ja` class to `<html>` that reassigns `--font-display` to the CJK face. Cormorant Garamond has no CJK coverage, so Japanese headings must resolve to Noto Sans JP weight 500 — the variable indirection makes that a three-line change rather than an audit of every heading.

### 9.7 The acceptance test

Before Phase 3 is signed off, prove the architecture by temporarily adding `'ja'` to `enabled`, seeding two products and a handful of UI strings with Japanese values, and confirming that: the header switcher appears, `/ja/shop` resolves, translated content renders in Japanese, untranslated content falls back to English rather than breaking, and admin fields grow locale tabs. Then remove `'ja'` again and commit with English only. Report the result — that test is the deliverable, not the Japanese content.

---

## 10. Build phases

Complete each phase, then stop and report before moving on.

- **Phase 0 — Audit & setup.** Inspect the existing scaffold and report what's present. Install dependencies, configure Inertia + React + TS + Tailwind, write the token config and CSS variables, set up Latin fonts behind the `--font-display` / `--font-body` indirection, create the two layout shells, and stand up `config/locales.php`, `SetLocale` and the optional-prefix route group per §9. Deliver a single styled test page proving tokens, fonts and dictionary-sourced strings all work.
- **Phase 1 — Design system.** All primitives in §5.4, plus the icon set as SVG components. Deliver a `/design-system` route rendering every primitive in every variant and state. **Get sign-off here before building pages.**
- **Phase 2 — Data layer.** All migrations, models, relationships, factories, seeders. Deliver `php artisan migrate:fresh --seed` running clean, plus a tinker transcript proving the relationships.
- **Phase 3 — Homepage.** Sections 7.1 through 7.11, static data from the seeder, fully responsive. This is the comparison point against the mockup. Finish with the §9.7 localisation acceptance test and report the result.
- **Phase 4 — Admin auth + product/category CRUD.** The client's core need.
- **Phase 5 — Remaining storefront routes** (7.12) — shop, product detail, recipes, static pages.
- **Phase 6 — Cart, checkout, orders**, both storefront and admin sides.
- **Phase 7 — Remaining admin modules**, accessibility pass, tests, and a hardcoded-string audit: grep the page and component tree for literal user-facing English in JSX and move anything found into the dictionaries.

---

## 11. Quality floor

Not optional, not announced — just met.

- Responsive from 360px to 1920px. Test at 360, 768, 1024, 1440.
- Keyboard navigable end to end, with a visible gold focus ring (`gold-200`, 2px offset) on every interactive element. Skip-to-content link.
- Semantic HTML: one `h1` per page, real `<button>` and `<a>` elements, `<nav>`/`<main>/<footer>` landmarks, labelled form fields, `aria-live` on cart and toast updates.
- Colour contrast ≥ 4.5:1 for body text. Check gold on cream specifically — if `#C08A2F` on `#FAF7F1` fails for small text, darken to `gold-600` for text while keeping `gold` for fills.
- `prefers-reduced-motion: reduce` disables all transitions and auto-advancing carousels.
- No CLS: every media slot has a reserved aspect ratio. Images lazy-loaded below the fold, hero eager.
- No console errors or TypeScript errors in the build.

---

## 12. What not to do

- Don't invent a different colour palette or typeface pairing — §5 is fixed.
- Don't add a hero gradient mesh, glassmorphism, neon accents, or a purple/blue anything. This palette is earthy and warm, full stop.
- Don't fetch, generate or hotlink images. Placeholders only, per §3.
- Don't use floats for money, or store prices as decimals.
- Don't put admin and storefront in the same layout or share navigation between them.
- Don't hardcode user-facing English in JSX, and don't hardcode a locale list anywhere outside `config/locales.php`.
- Don't use plain `string` columns for translatable content "because it's English-only for now" — that's the exact decision §9 exists to prevent.
- Don't ship Japanese UI copy, a visible language switcher, or CJK font files in v1. Build the machinery, leave it dormant.
- Don't skip the phase gates. Stop and report.
