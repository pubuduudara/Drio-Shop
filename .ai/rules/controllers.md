---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## Paginated Inertia props go through PaginatedPayload
Never hand a paginator straight to `SomeResource::collection($paginator)`. Laravel's paginated resource response re-introduces the `data` envelope that `JsonResource::withoutWrapping()` deliberately turns off, and emits snake_case meta keys that would be the only snake_case in the front end.

Use `App\Support\PaginatedPayload::make($paginator, SomeResource::class)`. Every list page — admin and storefront — reads the same `{data, meta: {currentPage, lastPage, perPage, total, from, to}, links: {prev, next}}` shape, typed as `Paginated<T>` in resources/js/types/admin.ts.
