<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductQuickUpdateRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Inline price and stock edits from the products table row (§8).
 *
 * Repricing and restocking is the client's most frequent task, so it costs one
 * request from the row rather than a trip through the full product form.
 */
final class ProductQuickUpdateController extends Controller
{
    public function __invoke(ProductQuickUpdateRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.products.quick_saved', ['name' => $product->name]),
        ]);

        return back();
    }
}
