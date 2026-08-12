---
paths:
  - 'app/Http/**'
---

# Http

## Inertia props are unwrapped resources
AppServiceProvider::boot() calls JsonResource::withoutWrapping(). Without it, `SomeResource::collection($x)` reaches an Inertia page as `{"data": [...]}` rather than an array, and the page component dies on `.map is not a function` with no server-side error — the page just renders blank.

If an API is ever added that needs the `data` envelope, wrap that response explicitly rather than removing the global call.

Every translatable field must be resolved to a plain string inside the resource (§9.4). React receives `product.name` as text and never sees locale JSON; the admin edit form is the only place that gets the full translation array.
