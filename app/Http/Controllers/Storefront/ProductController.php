<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\RecipeCardResource;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The product detail page (§7.12): gallery, tabs, related products and
 * reviews.
 */
final class ProductController extends Controller
{
    private const int RELATED_LIMIT = 4;

    public function __invoke(Product $product): Response
    {
        // An inactive product is not a 404 for an operator previewing it, but
        // it is for everyone else — the storefront only serves the catalogue.
        abort_unless($product->is_active, 404);

        $product->loadCount('reviews')
            ->loadAvg('reviews', 'rating')
            ->load('category');

        return Inertia::render('storefront/products/show', [
            'product' => new ProductDetailResource($product),

            'reviews' => ReviewResource::collection(
                $product->reviews()->published()->latest('id')->take(10)->get(),
            ),

            'related' => ProductCardResource::collection($this->related($product)),

            'recipes' => RecipeCardResource::collection(
                $product->recipes()->published()->ordered()->get(),
            ),
        ]);
    }

    /**
     * @return Collection<int, Product>
     */
    private function related(Product $product): Collection
    {
        return Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->ordered()
            ->take(self::RELATED_LIMIT)
            ->get();
    }
}
