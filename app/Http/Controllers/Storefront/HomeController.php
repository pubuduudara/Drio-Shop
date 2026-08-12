<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryCardResource;
use App\Http\Resources\HeroSlideResource;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\RecipeCardResource;
use App\Http\Resources\ReviewResource;
use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The homepage (§7.1–7.11).
 *
 * Everything reaches the page through a resource, never as a raw model, and
 * every count and average is aggregated in the query rather than per card — so
 * this whole page is a fixed handful of queries no matter how much the client
 * seeds into it.
 */
final class HomeController extends Controller
{
    private const int BEST_SELLER_LIMIT = 5;

    private const int RECIPE_LIMIT = 4;

    private const int INSTAGRAM_TILE_COUNT = 7;

    public function __invoke(): Response
    {
        return Inertia::render('storefront/home', [
            'heroSlides' => HeroSlideResource::collection(
                HeroSlide::query()->active()->ordered()->get(),
            ),

            'categories' => CategoryCardResource::collection(
                Category::query()->featured()->ordered()->get(),
            ),

            'bestSellers' => ProductCardResource::collection(
                Product::query()
                    ->active()
                    ->bestSellers()
                    ->ordered()
                    ->withCount('reviews')
                    ->withAvg('reviews', 'rating')
                    ->take(self::BEST_SELLER_LIMIT)
                    ->get(),
            ),

            'recipes' => RecipeCardResource::collection(
                Recipe::query()->published()->ordered()->take(self::RECIPE_LIMIT)->get(),
            ),

            /*
             * Insertion order, which is the editorial order the seeder wrote:
             * the four testimonials from the reference lead the carousel, and
             * the rest follow. Sorting by date would surface them backwards.
             */
            'reviews' => ReviewResource::collection(
                Review::query()->published()->featured()->orderBy('id')->get(),
            ),

            // The Instagram strip is decorative until a feed is connected; the
            // page only needs to know how many tiles to reserve (§7.9).
            'instagramTileCount' => self::INSTAGRAM_TILE_COUNT,
        ]);
    }
}
