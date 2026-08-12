<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryReorderRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Drag-to-reorder for categories (§8).
 *
 * `sort_order` is derived from the position in the posted list rather than
 * trusted from the client, so the order is always a clean 0..n sequence.
 */
final class CategoryReorderController extends Controller
{
    public function __invoke(CategoryReorderRequest $request): RedirectResponse
    {
        /** @var list<int> $ids */
        $ids = $request->validated('ids');

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $position => $id) {
                Category::query()->whereKey($id)->update(['sort_order' => $position]);
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.categories.reordered'),
        ]);

        return back();
    }
}
