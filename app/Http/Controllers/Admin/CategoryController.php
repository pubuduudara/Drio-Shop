<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\Admin\CategoryFormResource;
use App\Http\Resources\Admin\CategoryRowResource;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Category management (§8): CRUD, drag-to-reorder, icon picker and the
 * homepage feature toggle.
 */
final class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => CategoryRowResource::collection(
                Category::query()->withCount('products')->ordered()->get(),
            ),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            // The next free slot, so a new category lands at the end of the
            // list rather than tying with whatever is already at zero.
            'nextSortOrder' => (int) Category::query()->max('sort_order') + 1,
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $category = Category::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.categories.created', ['name' => $category->name]),
        ]);

        return to_route('admin.categories.index');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => new CategoryFormResource($category),
            'productsCount' => $category->products()->count(),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        /*
         * `products.category_id` cascades on delete, so removing a category
         * with products in it would take the products with it. Refuse instead
         * and say what to do — deleting a category is not a way to delete a
         * catalogue.
         */
        if ($category->products()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('admin.categories.has_products'),
            ]);

            return back();
        }

        $name = $category->name;
        $category->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.categories.deleted', ['name' => $name]),
        ]);

        return to_route('admin.categories.index');
    }
}
