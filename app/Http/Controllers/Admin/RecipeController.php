<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RecipeRequest;
use App\Http\Resources\Admin\ProductRowResource;
use App\Http\Resources\Admin\RecipeFormResource;
use App\Http\Resources\Admin\RecipeRowResource;
use App\Models\Product;
use App\Models\Recipe;
use App\Support\PaginatedPayload;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Recipe management (§8): CRUD with a repeatable ingredients/steps builder and
 * product linking.
 */
final class RecipeController extends Controller
{
    private const int PER_PAGE = 20;

    public function index(Request $request): Response
    {
        $filters = ['search' => trim((string) $request->string('search'))];

        $recipes = Recipe::query()
            ->withCount('products')
            ->when(
                $filters['search'] !== '',
                // `title` is a JSON column, so LIKE searches every locale.
                fn ($query) => $query->where('title', 'like', '%'.$filters['search'].'%'),
            )
            ->ordered()
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/recipes/index', [
            'recipes' => PaginatedPayload::make($recipes, RecipeRowResource::class),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/recipes/create', [
            'products' => ProductRowResource::collection($this->linkableProducts()),
            'nextSortOrder' => (int) Recipe::query()->max('sort_order') + 1,
        ]);
    }

    public function store(RecipeRequest $request): RedirectResponse
    {
        $recipe = Recipe::query()->create($request->safe()->except('product_ids'));
        $recipe->products()->sync($request->validated('product_ids') ?? []);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.recipes.created', ['name' => $recipe->title]),
        ]);

        return to_route('admin.recipes.edit', $recipe);
    }

    public function edit(Recipe $recipe): Response
    {
        return Inertia::render('admin/recipes/edit', [
            'recipe' => new RecipeFormResource($recipe->load('products')),
            'products' => ProductRowResource::collection($this->linkableProducts()),
        ]);
    }

    public function update(RecipeRequest $request, Recipe $recipe): RedirectResponse
    {
        $recipe->update($request->safe()->except('product_ids'));
        $recipe->products()->sync($request->validated('product_ids') ?? []);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(Recipe $recipe): RedirectResponse
    {
        $title = $recipe->title;
        $recipe->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.recipes.deleted', ['name' => $title]),
        ]);

        return to_route('admin.recipes.index');
    }

    /**
     * Every active product, for the "shop the ingredients" picker. Not
     * paginated: the picker needs the whole catalogue searchable client-side,
     * and this catalogue is tens of rows rather than thousands.
     *
     * @return Collection<int, Product>
     */
    private function linkableProducts(): Collection
    {
        return Product::query()->active()->with('category')->ordered()->get();
    }
}
