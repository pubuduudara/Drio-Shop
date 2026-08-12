<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\Admin\CategoryRowResource;
use App\Http\Resources\Admin\ProductFormResource;
use App\Http\Resources\Admin\ProductRowResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Support\PaginatedPayload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Product management (§8).
 *
 * The catalogue is the client's core need, so the list carries search, a
 * category filter and an active/inactive filter, and the form is tabbed rather
 * than one long column.
 */
final class ProductController extends Controller
{
    private const int PER_PAGE = 20;

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')),
            'category' => $request->integer('category') ?: null,
            'status' => $request->string('status')->toString(),
        ];

        $products = Product::query()
            ->with('category')
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $term = '%'.$filters['search'].'%';

                /*
                 * `name` is a JSON column, so a LIKE against the raw value
                 * searches every locale at once — which is what an operator
                 * typing a product name expects, whichever language it is in.
                 */
                $query->where(function ($query) use ($term): void {
                    $query->where('name', 'like', $term)
                        ->orWhere('sku', 'like', $term)
                        ->orWhere('slug', 'like', $term);
                });
            })
            ->when($filters['category'], fn ($query, int $id) => $query->where('category_id', $id))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->ordered()
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => PaginatedPayload::make($products, ProductRowResource::class),
            'categories' => CategoryRowResource::collection(Category::query()->ordered()->get()),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => CategoryRowResource::collection(Category::query()->ordered()->get()),
            // The store's currency, editable in Settings rather than deployed.
            'defaultCurrency' => Setting::get('currency', 'JPY'),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.products.created', ['name' => $product->name]),
        ]);

        return to_route('admin.products.edit', $product);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => new ProductFormResource($product),
            'categories' => CategoryRowResource::collection(Category::query()->ordered()->get()),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.products.deleted', ['name' => $name]),
        ]);

        return to_route('admin.products.index');
    }
}
