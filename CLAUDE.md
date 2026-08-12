# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DRIO is a Laravel + Inertia (React) e-commerce storefront selling Sri Lankan dehydrated vegetables, spice powders and traditional ingredients, shipped in Japan. Prices are in Japanese Yen. One codebase serves two applications:

- **Storefront** — public, locale-aware (`resources/js/pages/storefront`), product browsing, cart, checkout, recipes, story pages.
- **Admin console** — authenticated at `/admin`, single-language, for managing products, categories, orders, recipes, reviews and site content (`resources/js/pages/admin`).

`DRIO_BUILD_PROMPT.MD` is the original section-numbered product/design spec (visual direction, copy, data model). Code comments and `.ai/rules/*.md` frequently cite it as `§N` — read the referenced section there if a comment's rationale needs more context.

## Commands

**PHP**
- `composer setup` — first-time install: composer install, `.env`, key:generate, migrate, storage:link, npm install/build.
- `composer run dev` (or `php artisan dev`) — runs the PHP server, queue listener, log viewer (Pail) and Vite dev server concurrently.
- `php artisan test --compact` — run the full test suite. Add `--filter=testName` or a path to scope it.
- `vendor/bin/pint --dirty --format agent` — format only changed PHP files (run after every PHP edit).
- `phpstan analyse` (aliased as `composer types:check`) — static analysis at level 7, larastan.
- `composer ci:check` — the full CI gate: JS lint, JS format check, TS types, then the PHP test suite (which itself runs Pint check + PHPStan).

**JS/TS** (`resources/js`)
- `npm run dev` / `npm run build` / `npm run build:ssr` — Vite.
- `npm run lint` / `npm run lint:check` — ESLint (fix / check-only).
- `npm run format` / `npm run format:check` — Prettier (with the Tailwind class-sorting plugin).
- `npm run types:check` — `tsc --noEmit`.

If a frontend change isn't showing up, ask whether `npm run dev`/`build` needs to be (re)started — Vite isn't run automatically.

## Architecture

### Stack
Laravel 13 (PHP 8.4) · Inertia.js v3 · React 19 + TypeScript · Tailwind CSS v4 · Spatie Media Library, Permission and Translatable · Laravel Fortify (auth) · Laravel Wayfinder (typed routes) · Pest 5 · SQLite (local).

### Routing: two apps, one route table
`routes/web.php` wires three files together:
- `routes/storefront.php` is wrapped in `App\Support\LocalizedRoutes::group()`, which registers it once per entry in `config('locales.enabled')` — unprefixed for the default locale, `/{locale}`-prefixed for every other one. The file itself never mentions a locale. Model routes bind on slug.
- `routes/admin.php` is mounted at `/admin` behind `auth` + `can:access-admin`, deliberately outside `LocalizedRoutes` — the console has one interface language. Models bind on `{model:id}`, not slug, so renaming a product doesn't change the edit-page URL.
- `routes/settings.php` — authenticated account settings (profile, security, appearance).

The `access-admin` gate (`AppServiceProvider::configureAuthorization()`) checks `users.is_admin`. `spatie/laravel-permission` is installed but the gate itself is the simple boolean check, not roles/permissions.

### Localization
`config/locales.php` is the single source of truth for which locales exist (`enabled` list + `meta` for label/native name/direction/font). Nothing else — components, seeders, validation — should hardcode a locale list. Enabling a new locale is meant to be config-only, zero migrations. `App\Http\Middleware\SetLocale` applies the active locale (passed as a route-group middleware parameter, not a route default). Database-side translatable fields use Spatie Translatable (`$translatable` arrays on models); every translatable field is resolved to a plain string before it reaches an Inertia resource — React never sees the raw locale-keyed JSON.

### Inertia data flow
- `AppServiceProvider::boot()` calls `JsonResource::withoutWrapping()` globally — resources reach the frontend unwrapped (arrays, not `{"data": [...]}`).
- `HandleInertiaRequests::share()` puts `auth.user` and the current cart on every non-admin page (admin renders no cart UI, so the prop is omitted rather than resolved). A guest with no cart row gets the empty `CartResource` shape, not null.
- Paginated list props (both admin and storefront) must go through `App\Support\PaginatedPayload::make($paginator, SomeResource::class)`, never `Resource::collection($paginator)` directly — see `.ai/rules/controllers.md` for why. Typed on the frontend as `Paginated<T>`.
- Money is stored as integer minor units (`*_minor` columns; JPY is zero-decimal). `App\Support\Money::format()` is the server-side formatter; keep it in sync with the JS `formatPrice` equivalent.

### Cart & checkout
- `App\Support\CartManager` keys guest carts by a `drio_cart` cookie (a random token, not the session id) so a basket survives session expiry/regeneration across a login. The cookie is in `encryptCookies(except:)` in `bootstrap/app.php`.
- `App\Support\OrderTotals` is the *only* place shipping/order totals are computed — cart drawer, cart page, checkout review and `Actions\Checkout\PlaceOrder` all read it. `PlaceOrder` prices from the locked `products` rows at order time, never from the possibly-stale `cart_items.unit_price_minor`.

### Media
Spatie Media Library. Product, Category, Recipe, Review and HeroSlide all declare `protected $with = ['media']` — required to avoid N+1s wherever `MediaPresenter` is used in a resource; `tests/Feature/QueryBudgetTest.php` is the regression tripwire for this. Products have two collections: `gallery` (product detail carousel) and `primary` (single-file, a *copy* of one gallery item used for cards/hero, identified by a `source_media_id` custom property, not by filename). See `.ai/rules/admin.md` for the full read/write contract. `php artisan storage:link` is required for uploaded media to be reachable (runs automatically via composer's `setup`/`post-autoload-dump`).

### Frontend routes/actions (Wayfinder)
Backend routes/controllers are exposed to TypeScript as generated functions under `resources/js/actions/` (controller actions) and `resources/js/routes/` (named routes) — these are generated, import and use them instead of hardcoding URLs.

### Project convention rules (`.ai/rules/`)
Path-scoped rules recording settled decisions and non-obvious traps live in `.ai/rules/*.md`, indexed by `.ai/rules/index.md`. Laravel Boost's project-rules instruction (above) already requires reading the matching file(s) before touching a path — treat that as binding, not optional; several of these encode a bug that shipped once (e.g. the primary/gallery media relationship, the `cn()`/Tailwind theme merge config, `overlayHeader`) and reintroducing the naive version reintroduces the bug.

### Testing
Pest, `RefreshDatabase` on the `Feature` suite. Two custom helpers in `tests/Pest.php`:
- `withLocales(array $enabled)` — changes `config('locales.enabled')` *and* rebuilds the route table inside the `web` middleware group (a bare route re-require loses `SubstituteBindings`, which fails silently rather than erroring).
- `withGuestCart()` — seeds the `drio_cart` cookie, since the Pest/Laravel test client doesn't carry response cookies into the next request.

`tests/Feature/RouteSmokeTest.php` walks every named GET route for a basic status-code check, and `tests/Feature/QueryBudgetTest.php` asserts query counts don't scale with row counts — both are broad regression nets worth running after structural changes to routes or models.

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application running on PHP 8.4. You are an expert with the Laravel ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Framework and package guidelines that only apply to specific paths (testing, frontend, components) also live there, under `.ai/rules/boost` — this is not just recorded decisions, it is load-bearing guidance you have not seen inline. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.
- Record durable rules with `record-rule` so the next agent or teammate inherits them instead of working them out again. Pass a `glob` (e.g. `app/Http/Controllers/**`), a short `title`, and a few-line `note`. Always use `record-rule`, never your native memory or notes tool — native memory is personal and session-scoped; only `.ai/rules` is shared with the team and persists in the repo.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
