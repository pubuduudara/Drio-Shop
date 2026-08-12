<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroSlideReorderRequest;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Drag-to-reorder for hero slides (§8). `sort_order` is derived from the
 * posted position rather than trusted from the client, for the reason
 * documented on CategoryReorderController.
 */
final class HeroSlideReorderController extends Controller
{
    public function __invoke(HeroSlideReorderRequest $request): RedirectResponse
    {
        /** @var list<int> $ids */
        $ids = $request->validated('ids');

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $position => $id) {
                HeroSlide::query()->whereKey($id)->update(['sort_order' => $position]);
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.heroSlides.reordered'),
        ]);

        return back();
    }
}
