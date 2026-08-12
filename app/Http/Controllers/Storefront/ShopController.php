<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\ShopFilterRequest;
use App\Http\Resources\CategoryCardResource;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use App\Support\PaginatedPayload;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The shop index (§7.12): category, price and dietary filters, sort and
 * pagination.
 *
 * Filters live in the query string rather than in component state, so a
 * filtered shop is a URL a customer can share and a page the browser's back
 * button restores.
 */
final class ShopController extends Controller
{
    private const int PER_PAGE = 12;

    public function index(ShopFilterRequest $request): Response
    {
        $filters = $request->filters();

        $products = $this->query($filters)
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('storefront/shop/index', [
            'products' => PaginatedPayload::make($products, ProductCardResource::class),
            'categories' => CategoryCardResource::collection(
                Category::query()->ordered()->withCount([
                    'products' => fn (Builder $query) => $query->where('is_active', true),
                ])->get(),
            ),
            'filters' => $filters,
            'priceRange' => $this->priceRange(),
            'sorts' => ShopFilterRequest::SORTS,
        ]);
    }

    /**
     * A category's own page (§7.12). The same grid as the shop, scoped to one
     * category and headed by that category's name and description.
     */
    public function category(ShopFilterRequest $request, Category $category): Response
    {
        $filters = [...$request->filters(), 'category' => $category->slug];

        $products = $this->query($filters)
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('storefront/shop/category', [
            'category' => new CategoryCardResource($category),
            'products' => PaginatedPayload::make($products, ProductCardResource::class),
            'filters' => $filters,
            'priceRange' => $this->priceRange(),
            'sorts' => ShopFilterRequest::SORTS,
        ]);
    }

    /**
     * @param  array{q: string|null, category: string|null, min: int|null, max: int|null, dietary: string|null, sort: string}  $filters
     * @return Builder<Product>
     */
    private function query(array $filters): Builder
    {
        return Product::query()
            ->active()
            ->with('category')
            // Aggregated in the query rather than per card, so a page of
            // twelve products is a fixed number of queries.
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->when($filters['q'], function (Builder $query, string $term): void {
                /*
                 * `name` and `short_description` are JSON columns, so a LIKE
                 * against the raw value matches every locale at once — a
                 * Japanese visitor searching a Japanese name finds it without
                 * a per-locale index (§9.4).
                 */
                $query->where(function (Builder $query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('short_description', 'like', "%{$term}%");
                });
            })
            ->when(
                $filters['category'],
                fn (Builder $query, string $slug) => $query->whereHas(
                    'category',
                    fn (Builder $category) => $category->where('slug', $slug),
                ),
            )
            ->when($filters['min'], fn (Builder $query, int $min) => $query->where('price_minor', '>=', $min))
            ->when($filters['max'], fn (Builder $query, int $max) => $query->where('price_minor', '<=', $max))
            ->when(
                $filters['dietary'] === 'vegetarian',
                fn (Builder $query) => $query->where('is_vegetarian', true),
            )
            ->tap(fn (Builder $query) => $this->applySort($query, $filters['sort']));
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('price_minor'),
            'price_desc' => $query->orderByDesc('price_minor'),
            'newest' => $query->latest('id'),
            // `featured` is the editorial order the admin controls.
            default => $query->orderBy('sort_order')->orderBy('id'),
        };
    }

    /**
     * The bounds the price filter offers, taken from the catalogue rather than
     * hardcoded — a slider that stops below the most expensive product is a
     * filter that hides stock.
     *
     * @return array{min: int, max: int}
     */
    private function priceRange(): array
    {
        $range = Product::query()
            ->active()
            ->selectRaw('min(price_minor) as low, max(price_minor) as high')
            ->first();

        return [
            'min' => (int) ($range?->getAttribute('low') ?? 0),
            'max' => (int) ($range?->getAttribute('high') ?? 0),
        ];
    }
}
