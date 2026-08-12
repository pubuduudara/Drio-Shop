---
paths:
  - 'tests/**'
---

# Tests

## withLocales() must rebuild routes inside the web group
`withLocales()` in tests/Pest.php registers `routes/web.php` via `$router->middleware('web')->group(...)`, mirroring what `bootstrap/app.php` does through `withRouting(web: ...)`.

A bare `require` of the file rebuilds the table without the `web` group. Routes still match, so parameterless pages look fine — but with no SubstituteBindings every model-bound route receives its parameter as a raw string and the container hands the controller an empty model. That surfaces as a blank page or a null-argument TypeError deep in a resource, not as a routing error, and it made several localisation assertions pass against nothing.

Two smoke suites guard the general case: RouteSmokeTest walks every named GET route from the route table (200 for the storefront, 200/403/redirect for admin), and QueryBudgetTest asserts query counts do not grow with row counts.
