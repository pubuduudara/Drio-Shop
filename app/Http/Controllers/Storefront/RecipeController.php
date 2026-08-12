<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeCardResource;
use App\Http\Resources\RecipeDetailResource;
use App\Models\Recipe;
use App\Support\PaginatedPayload;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Recipe index and detail (§7.12).
 *
 * The index filters match the footer's Recipes column — vegetarian,
 * non-vegetarian, quick and traditional — so those links land on a real
 * filtered view rather than the unfiltered index.
 */
final class RecipeController extends Controller
{
    private const int PER_PAGE = 12;

    public const array DIETS = ['vegetarian', 'non-vegetarian', 'quick', 'traditional'];

    public function index(Request $request): Response
    {
        $diet = $request->validate([
            'diet' => ['nullable', 'string', Rule::in(self::DIETS)],
        ])['diet'] ?? null;

        $recipes = Recipe::query()
            ->published()
            ->when($diet === 'vegetarian', fn (Builder $query) => $query->where('is_vegetarian', true))
            ->when($diet === 'non-vegetarian', fn (Builder $query) => $query->where('is_vegetarian', false))
            ->when($diet === 'quick', fn (Builder $query) => $query->where('is_quick', true))
            ->when($diet === 'traditional', fn (Builder $query) => $query->where('is_traditional', true))
            ->ordered()
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('storefront/recipes/index', [
            'recipes' => PaginatedPayload::make($recipes, RecipeCardResource::class),
            'filters' => ['diet' => $diet],
            'diets' => self::DIETS,
        ]);
    }

    public function show(Recipe $recipe): Response
    {
        abort_unless($recipe->is_published, 404);

        /*
         * The linked products power the "shop the ingredients" block, and they
         * carry ratings, so the counts are aggregated on the relation rather
         * than issued once per card.
         */
        $recipe->load([
            'products' => fn ($query) => $query
                ->where('is_active', true)
                ->withCount('reviews')
                ->withAvg('reviews', 'rating'),
        ]);

        return Inertia::render('storefront/recipes/show', [
            'recipe' => new RecipeDetailResource($recipe),
            'more' => RecipeCardResource::collection(
                Recipe::query()
                    ->published()
                    ->whereKeyNot($recipe->id)
                    ->ordered()
                    ->take(3)
                    ->get(),
            ),
        ]);
    }
}
