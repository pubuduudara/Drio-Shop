<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductBulkActionRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Bulk activate, deactivate and delete from the products table (§8).
 */
final class ProductBulkActionController extends Controller
{
    public function __invoke(ProductBulkActionRequest $request): RedirectResponse
    {
        /** @var list<int> $ids */
        $ids = $request->validated('ids');
        $action = $request->validated('action');

        $products = Product::query()->whereIn('id', $ids);

        $count = match ($action) {
            'activate' => $products->update(['is_active' => true]),
            'deactivate' => $products->update(['is_active' => false]),
            // Soft delete, so a mis-click is recoverable from the database.
            'delete' => $products->delete(),
            default => 0,
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans_choice("admin.products.bulk.{$action}", (int) $count, ['count' => $count]),
        ]);

        return back();
    }
}
