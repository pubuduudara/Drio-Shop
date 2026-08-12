---
paths:
  - 'routes/**'
---

# Routes

## Storefront routes register once per enabled locale
routes/storefront.php never mentions a locale. App\Support\LocalizedRoutes::group() registers it once per entry in config('locales.enabled'): the default locale unprefixed and owning canonical route names (`shop`), every other locale prefixed in both URL and name (`/ja/shop`, `ja.shop`).

Consequences worth knowing:
- A locale prefix that is not enabled matches no route and 404s. That is the specified behaviour, not an accident.
- The active locale reaches SetLocale as a middleware parameter (`SetLocale::class.':'.$locale`), not a route default — RouteRegistrar has no `defaults()` method.
- Admin routes are deliberately outside this group; the console is not localised by URL.
- Tests that change `locales.enabled` must re-register routes afterwards (see the `withLocales` helper in tests/Feature/LocalisationTest.php) — config alone does not rebuild the route table.
